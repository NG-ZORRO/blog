---
title: 为什么 Breadrumb 有这么多的 bug
date: '2018-12-28T22:40:32.169Z'
description: 'Bugs we ran into when we were developing the breadcrumbs component.'
author: Wendell
---

面包屑组件的自动生成功能推出之后存在一些问题，经常有用反馈没有跟随路由变化改变，或者拿不到正确的路径等等，比如下面这些 issue：

- https://github.com/NG-ZORRO/ng-zorro-antd/issues/3206
- https://github.com/NG-ZORRO/ng-zorro-antd/issues/3186
- https://github.com/NG-ZORRO/ng-zorro-antd/issues/2538

下面就结合一下相关代码解释为何会出现这些问题，以及在最新的 PR 中这些问题是如何被解决的，在此过程中，你将还会学习到 Angular 路由机制的一些基本原理。

## 问题一：为什么会有用户说在懒加载的 module 中，或者子路由中使用自动生成，没有渲染出任何东西？

相关 issue

结论：这是 Angular 的路由 cycle 和生命周期之间的先后顺序导致的。
在面包屑 NzBreadcrumb 组件中，这个方法在 ngOnInit 钩子里被调用，负责监听路由变化的事件，然后调用 getBreadcrumbs 方法来生成面包屑项目 NzBreadcrumbItem。

```ts
private registerRouterChange(): void {
  try {
    const router = this.injector.get(Router);
    const activatedRoute = this.injector.get(ActivatedRoute);
    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
        startWith(true) // Trigger initial render.
      )
      .subscribe(() => {
        this.breadcrumbs = this.getBreadcrumbs(activatedRoute.root);
        this.cdr.markForCheck();
      });
  } catch (e) {
    throw new Error('[NG-ZORRO] You should import RouterModule if you want to use NzAutoGenerate');
  }
}
```

可以在这个在线 demo 里通过 console 查看各个路由事件和生命周期钩子的先后顺序。点击 view 2 / DisplayIdComponent 之后，你可以看见 App oninit 最先被输出，而 View2Component oninit DisplayIdComponent oninit 在 NavigationEnd 事件之后被输出。

之前的代码里并没有这一行：

```ts
startWith(true)
```

这就导致了问题：

`AppComponent` 和它的非路由子组件在 `NavigationEnd` 事件被派发之前，就已经执行了 `ngOnInit` 钩子，监听了事件，面包屑就会去调用 `getBreadcrumbs`。

而对于 `AppComponent` 路由底下的子组件来说，`NavigationEnd` 事件先于它们的 `ngOnInit` 钩子，这就导致了 `registerRouterChanges` 被调用的时候，错过了该事件，面包屑就不会在组件初始化的时候调用 `getBreadcrumbs` 了。而在加上了 `startWith` 之后，无论是在哪里，面包屑被渲染的时候一定会调用 `getBreadcrumbs`, 从而生成面包屑项目。

## 问题二：为什么会有用户说切换路由的时候面包屑没有更新？

相关 issue
结论：这是因为 ActivatedRoute 是有作用范围的（有层次的），而 Router 是一个单例。
当你调用 RouterModule.forRoot 的时候，返回的是 ModuleWithProviders<RouterModule>, 而这个 module provide 了 ROUTER_PROVIDERS, 其中就包含
{
provide: Router,
},
所以，Router 是在根注入器中提供的，不论在哪个组件注入 Router, 然后监听 Router.events, 你都会监听到同一个事件。
而 ActivatedRoute 是（此处引用官网的说明）
Contains the information about a route associated with a component loaded in an outlet. An ActivatedRoute can also be used to traverse the router state tree.
即组件注入的 ActivatedRoute 是哪一个和它被挂在哪一层 <router-outlet> 底下有关。
很不幸，之前 registerRouterChange 监听的是 activatedRoute.url, 这就导致了：当我在 AppComponent 里声明了一个自动生成的面包屑，而我接下来的路由改变发生在第二或者是更靠后的 segment 的话，面包屑是根本不可能知道路由发生变化了的，因为它当前所在层的 url segment 的确没有变嘛！
官网上对 ActicatedRoute.url 的定义是 An observable of the URL segments matched by this route，仅仅是当前路由对应的片段，而非整个 URL。
问题三：为什么产生的面包屑会出现“双皮奶”？
结论：这种情况发生在有懒加载路由的时候，懒加载路由会给你的路由带来额外的层次，你会看到两个一模一样的面包屑。
举个例子，我们这样定义根路由和一个子路由：

```ts
const root: Routes = [
  {
    path: 'first',
    loadChildren: './first/first.module#FirstModule',
    data: {
      breadcrumb: 'First',
    },
  },
]

const child: Routes = [
  {
    path: '',
    component: FirstComponent,
    children: [
      {
        path: 'second',
        loadChildren: './second/second.module#SecondModule',
        data: {
          breadcrumb: 'Second',
        },
      },
    ],
  },
]
```

当我们访问 /first/second 的时候，看起来只应该有两层路由对不对？但实际上有三层！

```
first --> '' --> second
```

面包屑显示出来是这样：

```
First / First / Second
```

而如果你这样写子路由：

```ts
const child: Routes = [
  {
    path: 'first',
    component: FirstComponent,
    children: [
      {
        path: 'second',
        loadChildren: './second/second.module#SecondModule',
        data: {
          breadcrumb: 'Second',
        },
      },
    ],
  },
]
```

访问 /first/second 的时候，会报错，而访问 /first/first/second 就一切正常了，面包屑也能对应上。

这就说明：虽然 '' 也会成为 ActivatedRoute 的一层，但是不会在 url 中体现出来，可以把它称为虚路由。

而之前 getBreadcrumbs 是这样的：

```ts
private getBreadcrumbs(
  route: ActivatedRoute,
  url: string = '',
  breadcrumbs: BreadcrumbOption[] = []
): BreadcrumbOption[] | undefined {
  const children: ActivatedRoute[] = route.children;

  // If there's no sub root, then stop the recurse and returns the generated breadcrumbs.
  if (children.length === 0) {
    return breadcrumbs;
  }
  for (const child of children) {
    if (child.outlet === PRIMARY_OUTLET) {
      // Only parse components in primary router-outlet (in another word, router-outlet without a specific name).
      // Parse this layer and generate a breadcrumb item.
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      const nextUrl = url + `/${routeURL}`;
      // If have data, go to generate a breadcrumb for it.
      if (child.snapshot.data.hasOwnProperty(NZ_ROUTE_DATA_BREADCRUMB)) {
        const breadcrumb: BreadcrumbOption = {
          label: child.snapshot.data[NZ_ROUTE_DATA_BREADCRUMB] || 'Breadcrumb',
          params: child.snapshot.params,
          url: nextUrl
        };
      breadcrumbs.push(breadcrumb);
      }
    return this.getBreadcrumbs(child, nextUrl, breadcrumbs);
    }
  }
}
```

当我们递归处理到懒加载路由的根 '' 时，routeURL 为 ''，这是对的，因为 segment.path 的确是空字符串，但是这一行：

```ts
if (child.snapshot.data.hasOwnProperty(NZ_ROUTE_DATA_BREADCRUMB))
```

完全没管是不是虚路由，直接塞到 breadcrumbs 里渲染出来了，再加上父层路由里声明的懒加载路由，就出现了双皮奶。解决方式，就是在判断的时候加入对 routeURL 的非空判断。

## 参考链接

- 这个 PR 将会修复以上提到的所有问题
- The Three Pillars of Angular Routing 系列的文章会让你对 Angular 的路由有全面的了解，本文的在线 demo 也出自这里
