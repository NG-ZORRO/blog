---
title: NG-ZORRO 进阶指南：为轮播图组件自定义切换效果
date: '2019-06-04T13:40:32.169Z'
description: 在之前的一次对轮播图 (carousel) 组件的重构中，我们将实现切换效果的代码和其他代码分离，这不仅使得组件更容易维护，而且允许用户为轮播图添加各种各样的切换效果 (strategy)。这篇文章将会以一个翻转 (flip) 效果为例，介绍如何使用该进阶功能。
author: Wendell <wendzhue@gmail.com>
category: Other
tags:
  - announcement
  - hello
---

在之前的一次对轮播图 (carousel) 组件的重构中，我们将实现切换效果的代码和其他代码分离，这不仅使得组件更容易维护，而且允许用户为轮播图添加各种各样的切换效果 (strategy)。这篇文章将会以一个翻转 (flip) 效果为例，介绍如何使用该进阶功能。

_注：需要 ng-zorro-antd 7.5.0 及以上版本。_

你可以[在这里](https://flip-strategy-for-ng-zorro-antd.wendellhu.now.sh/)预览最终效果。

并且[在这里](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd)找到源代码。

---

要实现并使用自定义的切换效果，需要如下步骤：

1. 定义一个继承了 `NzCarouselBaseStrategy` 的类，实现切换效果
2. 通过 `NZ_CAROUSEL_CUSTOM_STRATEGIES` 提供自定义切换效果
3. 在 `nz-carousel` 的 `nzEffect` input 中指定使用自定义效果

## 实现切换效果 `FlipStrategy`

要实现一个切换效果，只需要继承并实现 ng-zorro-antd 提供的 `NzCarouselBaseStrategy` 抽象类即可。主要是实现以下三个方法：

1. `withCarouselContents` 该方法会在轮播图组件初次渲染、轮播图内容改变，或者是切换效果的时候被调用，切换效果应该在这个方法里进行初始化设置
2. switch 会在轮播图切换到其他画面时被调用，负责执行切换动画
3. dispose 会在轮播图组件销毁，或者是切换效果的时候被调用，应该在这个方法里移除初始化设置

下面来看一下 `FlipStrategy` 的具体实现吧。

### [`withCarouselContents`](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/flip-strategy.ts%23L9-L52)

在这个方法被调用的最初，需要调用父类的同名方法，让父类准备好辅助属性。

```ts
super.withCarouselContents(contents)
```

> [`NzCarouselBaseStrategy` 提供了一些辅助属性和方法](https://github.com/NG-ZORRO/ng-zorro-antd/blob/d6906925187aef56b8c169bc644711d1919f1abf/components/carousel/strategies/base-strategy.ts%23L49-L59)，能够帮助开发者更好地实现想要的切换效果。比如记录轮播图项目的宽度的 `unitWidth`，所有轮播图项目指令 `NzCarouselContentDirective` 的 `contents` 等。

然后，对轮播图组件中的各个项目的样式做初始化。对于翻转效果来说，所有的元素都应该重合在相同的位置，所以外层元素的宽度均为轮播图项目的单位宽度。

```ts
this.renderer.setStyle(this.slickListEl, 'width', `${this.unitWidth}px`)
this.renderer.setStyle(
  this.slickTrackEl,
  'width',
  `${this.length * this.unitWidth}px`
)
```

接下来，对每个轮播图项目做处理。对于当前激活的项目而言，不需要做翻转，而其他项目均要做翻转。然后，设置每个项目的位置，并设置过渡效果。

```ts
this.contents.forEach((content: NzCarouselContentDirective, i: number) => {
  const cur = this.carouselComponent.activeIndex === i

  this.renderer.setStyle(
    content.el,
    'transform',
    cur ? 'rotateY(0deg)' : 'rotateY(180deg)'
  )
  this.renderer.setStyle(content.el, 'position', 'relative')
  this.renderer.setStyle(content.el, 'width', `${this.unitWidth}px`)
  this.renderer.setStyle(content.el, 'left', `${-this.unitWidth * i}px`)

  this.renderer.setStyle(content.el, 'transform-style', 'preserve-3d')
  this.renderer.setStyle(content.el, 'backface-visibility', 'hidden')
})
```

这样，初始化就完成了。

### [`switch`](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/flip-strategy.ts%23L54-L77)

在切换项目的时候，[轮播图组件会调用该方法](https://github.com/NG-ZORRO/ng-zorro-antd/blob/d6906925187aef56b8c169bc644711d1919f1abf/components/carousel/nz-carousel.component.ts%23L219)，并订阅该方法返回的 Observable 对象，以便在动画完成的时候做后处理。所以，我们返回一个 `Subject.asObservable()` 并在动画效果结束后 next 和 complete。

```ts
const complete$ = new Subject<void>()
const speed = this.carouselComponent.nzTransitionSpeed

timer(speed).subscribe(() => {
  complete$.next()
  complete$.complete()
})

// ...

return complete$.asObservable()
```

然后就是执行动画的部分。先得到在范围内起始位置下标和终止位置下标。

```ts
const { from, to } = this.getFromToInBoundary(rawF, rawT)
```

> `switch(rawF: number, rawT: number): Observable<void>` 参数里的起始位置和终止位置并不总是在 0 到录播图项目个数 -1 这个范围之内，因为从最后一项回到第一项时，有的切换效果可能需要特别的处理（比如 ng-zorro-antd 里自带的 [`TransformStrategy`](https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/carousel/strategies/transform-strategy.ts)）。所以 `NzCarouselBaseStrategy` 提供了 `getFromToInBoundary` 方法来获取范围内的下标。

然后，翻转起始位置和终止位置的轮播图项目。

```ts
this.contents.forEach((content: NzCarouselContentDirective, i: number) => {
  if (i === from) {
    this.renderer.setStyle(content.el, 'transform', 'rotateY(180deg)')
  } else if (i === to) {
    this.renderer.setStyle(content.el, 'transform', 'rotateY(0deg)')
  }
})
```

这样翻转效果就实现了，是不是非常简单？

### [`dispose`](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/flip-strategy.ts%23L79-L87)

这个方法相对简单，把过渡效果去掉即可。

```ts
dispose(): void {
  this.contents.forEach((content: NzCarouselContentDirective) => {
    this.renderer.setStyle(content.el, 'transition', null);
    this.renderer.setStyle(content.el, 'transform-style', null);
    this.renderer.setStyle(content.el, 'backface-visibility', null);
  });

  super.dispose();
}
```

## 提供自定义的切换效果

在 app.module.ts 中，[我们 provide 自定义的切换效果](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/app.module.ts%23L13-L19)。

```ts
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { NZ_CAROUSEL_CUSTOM_STRATEGIES, NzCarouselModule } from 'ng-zorro-antd'
import { FlipStrategy } from './flip-strategy'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NzCarouselModule],
  providers: [
    {
      provide: NZ_CAROUSEL_CUSTOM_STRATEGIES,
      useValue: [
        {
          name: 'flip',
          strategy: FlipStrategy,
        },
      ],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## 指定轮播图组件使用该效果

最后只需要像平常那样使用轮播图组件，[只不过指定效果的时候用之前 provide 的 name](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/app.component.html%23L9)，像下面这样：

```html
<nz-carousel [nzEffect]="'flip'" [nzDotRender]="dotTpl">
  <div nz-carousel-content>A</div>
  <div nz-carousel-content>B</div>
  <div nz-carousel-content>C</div>
  <div nz-carousel-content>D</div>
</nz-carousel>
```

就得到了一个效果为翻转的轮播图了。

## 实现拖拽效果

如果实现了 `NzCarouselBaseStrategy` 的 `dragging` 方法，还可以支持拖拽。这个方法会传递一个 `PointerVector` 对象，开发者可以从这个对象获取光标在拖拽中在 x 和 y 两个方向上拖动的距离（像素单位）。

```ts
dragging(_vector: PointerVector): void {}
```

我们把实现拖拽当作留给大家的练习。

## 参考链接

1. [策略模式](https://design-patterns.readthedocs.io/zh_CN/latest/behavioral_patterns/strategy.html)。切换效果 (strategy) 的设计是典型的策略模式，不妨学习一下。
