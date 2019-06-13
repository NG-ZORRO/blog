---
title: NG-ZORRO Advanced - Customized Switching Strategy
date: '2019-06-04T13:40:32.169Z'
description: In a previous refactoring of the carousel component, we separated code that actually does switching animations with other code. This approach not only make the component maintainable, but also makes it possible for users to implement their own switching strategies. This article would take a flip strategy as an example to show you how to leverage this advanced feature.
author: Wendell <wendzhue@gmail.com>
category: dev-blog
tags:
  - carousel
  - tutorial
---

In a previous refactoring of the carousel component, we separated code that actually does switching animations with other code. This approach not only make the component maintainable, but also makes it possible for users to implement their own switching strategies. This article would take a flip strategy as an example to show you how to leverage this advanced feature.

_Requires ng-zorro-antd 7.5.0 and above._

You can [click here](https://flip-strategy-for-ng-zorro-antd.wendellhu.now.sh/) to preview the result.

And find the source code [here](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd).

---

To implement and use a customized switching strategy, you need to:

1. Defined a class that inherits `NzCarouselBaseStrategy` to implement a switching strategy.
2. Provide this class with injection token `NZ_CAROUSEL_CUSTOM_STRATEGIES`.
3. Use your switching strategy in `nz-carousel` by assign `nzEffect` with a name that you pre-defined.

## Implement Switching Strategy `FlipStrategy`

To implement a strategy, you just have to inherit and implement the abstract class `NzCarouselBaseStrategy` provided by ng-zorro-antd. You should implement three methods of this abstract class.

1. `withCarouselContents`. This method will be invoked when the carousel component inits, the carousel items change or the switching strategy is changed. It should setup for switching in this method.
2. `switch`. This method will be invoked when the currently activated carousel item changes. It should do animations.
3. `dispose`. This method will be invoked when the carousel component destroys or the switching strategy is replaced by another. It should revert setup by `withCarouselContents`.

Let's have an insight of the implementation of `FlipStrategy`.

### [`withCarouselContents`](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/flip-strategy.ts%23L9-L52)

When it's invoked, the first thing it needs to do is to invoke its parent class to prepare util properties.

```ts
super.withCarouselContents(contents)
```

> [`NzCarouselBaseStrategy` provided util properties](https://github.com/NG-ZORRO/ng-zorro-antd/blob/d6906925187aef56b8c169bc644711d1919f1abf/components/carousel/strategies/base-strategy.ts%23L49-L59) that could help developers implement switching effect conveniently.

Then, it set styles of the slick list element and the slick track element. As of flip switching effect, all elements should be in the same position. So width of the slick list element should be `unitWidth`.

```ts
this.renderer.setStyle(this.slickListEl, 'width', `${this.unitWidth}px`)
this.renderer.setStyle(
  this.slickTrackEl,
  'width',
  `${this.length * this.unitWidth}px`
)
```

After that, it set styles of elements of carousel items. For the currently activated carousel item, its element should not be flipped while others should be flipped. The elements are also moved to the correct position by `left` style. Their `transition` is set, too.

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

### [`switch`](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/flip-strategy.ts%23L54-L77)

When the currently activated item changes, [the carousel component would call this method](https://github.com/NG-ZORRO/ng-zorro-antd/blob/d6906925187aef56b8c169bc644711d1919f1abf/components/carousel/nz-carousel.component.ts%23L219), and subscribe the Observable object it returns. So, a `Subject.asObservable()` is returned here, and it would `next` and `complete` when the switching animation is done.

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

Then, this method would start animation.

First get `from` and `to` indexes in the boundary.

```ts
const { from, to } = this.getFromToInBoundary(rawF, rawT)
```

> Parameters passed to the method `switch(rawF: number, rawT: number): Observable<void>` are not always between 0 and the number of carousel items. Because some strategies, like [`TransformStrategy`](https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/carousel/strategies/transform-strategy.ts) may want to know they are switching from the last to the first instead of **back to the first**. So `NzCarouselBaseStrategy` provides a method called `getFromToInBoundary` for developers to get indexes in boundary.

Then, it reset `transform` property of elements of carousel items.

```ts
this.contents.forEach((content: NzCarouselContentDirective, i: number) => {
  if (i === from) {
    this.renderer.setStyle(content.el, 'transform', 'rotateY(180deg)')
  } else if (i === to) {
    this.renderer.setStyle(content.el, 'transform', 'rotateY(0deg)')
  }
})
```

So a flipping effect is completed! How simple is that?

### [`dispose`](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/flip-strategy.ts%23L79-L87)

This method is relatively simple.

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

## Provide new Switching Strategy

In app.module.ts we [provide custom switching strategy](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/app.module.ts%23L13-L19).

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

## Use the new Switching Strategy

The last step is just to [pass the `name` you defined in the previous step to `nzEffect` input](https://github.com/wendzhue/flip-strategy-for-ng-zorro-antd/blob/f2ce7856b3f350b58d637b8ffde8a52e3aeeba72/src/app/app.component.html%23L9).

```html
<nz-carousel [nzEffect]="'flip'" [nzDotRender]="dotTpl">
  <div nz-carousel-content>A</div>
  <div nz-carousel-content>B</div>
  <div nz-carousel-content>C</div>
  <div nz-carousel-content>D</div>
</nz-carousel>
```

So, you get a carousel component that flips. Congratulations!

## What abound Dragging?

If you implement `dragging` of `NzCarouselBaseStrategy`, you can make your strategy support dragging. Try it yourself!

```ts
dragging(_vector: PointerVector): void {}
```

## Reference

1. [Strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern). As the name suggests, this switching strategy thing follows strategy pattern. You may want to have a through understanding about it.
