---
title: 漫谈 Angular 定制主题的四种方式
date: '2019-07-04T11:29:18.169Z'
description: 介绍一下 Angular 中实现主题定制的四种方式
author: SiMengChen <chensimengsara@gmail.com>
category: other
tags:
  - announcement
---



主题定制是提升用户体验最常见的一种，前端框架众多，主题定制方式却异曲同工，下面来介绍一下 Angular 中实现主题定制的四种方式。

## 1. webpack loader
React 版本的 [Ant Design](https://ant.design/index-cn) 使用  [less-loader](https://webpack.js.org/loaders/less-loader/) 加载 globalVars 与 modifyVars 变量，并通过 less 的 render 方法传递 callback 到 loader 来实现的项目的主题修改功能。

目前绝大部分的 angular 项目同样使用 webpack 打包方案。显然，相同的主题修改方案在 angular 中一样适用。

### webpack 打包 less
* [webpack](https://webpack.js.org/) 本身并不具备打包 less 文件的功能，最终实现该部分功能的是 [less-loader](https://webpack.js.org/loaders/less-loader/)，该加载器把 less 转为 CSS，在 webpack 中每个文件或模块都是有效的 JS 模块，因此我们还需要 [css-loader](https://webpack.js.org/loaders/css-loader/) 将CSS样式文件转换为变成 JS 模块。
* 这时我们已经有了生成的 dist/style.js，在这个模块中只是将样式导出为字符串并存放于数组中，我们需要 [style-loader](https://webpack.js.org/loaders/style-loader/) 将该数组转换成 style 标签。
* 最后我们还需要将 dist/style.js 自动导入 到 html 中，[html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/) 可以帮我们实现这部分功能。
* 除了以上这些 loader，我们可能还需要 [autoprefixer](https://github.com/postcss/autoprefixer)、[cssnano](https://github.com/cssnano/cssnano) 和 [postcss-loader](https://github.com/postcss/postcss-loader) 等，有兴趣的同学可以自行了解。

### modifyVars
上面介绍的 [less-loader](https://webpack.js.org/loaders/less-loader/) 可以帮忙我们实现主体定制，这里涉及到两个重要的配置：
* globalVars：相当于给每个 less 文件顶部增加一行 @VariableName: xx；
* modifyVars：相当于给每个 less 文件底部增加一行变量 @variable:xx；

通过这两个配置，我们就可以把部分样式抽出变量，通过不同的变量组合成不同的主题。

###  custom-webpack

[angular-cli](https://github.com/angular/angular-cli) 提供了 [custom-webpack](https://github.com/meltedspark/angular-builders/tree/master/packages/custom-webpack) 的 builder，可以和 [angular-cli](https://github.com/angular/angular-cli) 合并使用，通过 builder 重写 webpack 中的 [less-loader](https://webpack.js.org/loaders/less-loader/) 的配置，然后利用 modifyVars 实现主题定制。

1. 安装 `npm i -D @angular-builders/custom-webpack`
2. 在根目录新建 webpack 配置文件 extra-webpack.config.js
``` javascript
module.exports = {
  module : {
    rules: [
      {test: /\.css$/,use : [ 'style-loader',  'css-loader'  ]},
      {
        test: /\.less$/,
        use : [{
            loader : 'less-loader',
            options: {
              modifyVars       : {  // 修改主题变量
                'primary-color'     : 'red'
              },
              javascriptEnabled: true
            }
          }]
      }
    ]
  }
  ...
}
```
3.在 angular.json 中使用 @angular-builders/custom-webpack:browser
``` json
"architect": {
        "build": {
          + "builder": "@angular-builders/custom-webpack:browser",
          - "builder": "@angular-builders/build-angular:browser",
          "options": {
            "customWebpackConfig": {
              "path": "./extra-webpack.config.js"
            },
            "outputPath": "dist/custom-webpack",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.less"
            ],
          },
		  ...
```
这样就可以实现 less 原理的主题定制了，当然 [custom-webpack](https://github.com/meltedspark/angular-builders/tree/master/packages/custom-webpack) 不仅仅可以做到 [less-loader](https://webpack.js.org/loaders/less-loader/) 的重写，它还可以利用 webpack 实现更多功能，具体研究我们在下一篇文章再来探讨；

如果你想进一步了解在 angular cli 中自定义 webpack 打包的方案，可以参考这篇[文章](https://blog.angularindepth.com/customizing-angular-cli-build-an-alternative-to-ng-eject-v2-c655768b48cc)

笔者准备好了可以直接使用的源代码，方便大家查看
[点击查看源码](https://github.com/chensimeng/angular-builder-less)

###  纯 webpack 打包

如果开发者的项目未使用 Angular CLI，也可以通过同样的方式实现自己的 [webpack](https://webpack.js.org/) 打包器：

1.在根目录添加 webpack.config.js 文件。

2.运行命令 webpack 或者 webpack-dev-serve，即可查看效果。

笔者准备好了可以直接使用的源代码，方便大家查看
[点击查看源码](https://github.com/chensimeng/angular-webpack-less)

可能很多开发者并不熟悉 less，开发过程中大多用纯 CSS，纯 CSS 能否实现主题定制了？答案是肯定的，下面我们来探讨一下纯 CSS 的主题定制。

## 2. CSS Variable

CSS3 提供了 [Variable](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)， 利用 angular Directive 指令，动态修改 CSS Variable，从而得到主题切换的效果。注意：CSS Variable 支持的浏览器可以在 [这里](https://caniuse.com/#feat=css-variables) 查看

```css
.element{--main-bg-color: brown;}   // 声明局部变量
.element{background-color: var(--main-bg-color);}   // 使用局部变量
:root { --global-color: #666; --pane-padding: 5px 42px; }   // 声明全局变量
.demo{ color: var(--global-color); }  // 使用全局变量
```

有了以上的的基础知识，我们很容易想到如何在 angular 中实现基于 css Variable 的主题切换功能，我们只需要一个 Directive 可以根据 @Input 输入动态切换 style 即可。

1.创建一个指令：ThemeDirective，用来给需要 CSS 变量的标签添加样式
```javascript
import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
@Directive({
  selector: '[dtTheme]'
})
export class ThemeDirective implements OnChanges {
  @Input('dtTheme') theme: {[prop: string]: string};
  constructor(private el: ElementRef<HTMLElement>) {
  }
  ngOnChanges() {
    Object.keys(this.theme).forEach(prop => {
      this.el.nativeElement.style.setProperty(`--${prop}`, this.theme[prop]);
    });
  }
}
```

2.创建一个组件：app.component.ts
```javascript
import { Component } from '@angular/core';
@Component({
  selector   : 'app-root',
  template: `
<select (input)="setTheme($event.target.value)" title="theme" class="form-control">
  <option value="">- select theme -</option>
  <option>green</option>
  <option>pink</option>
</select>
<app-trex [dtTheme]="themes"></app-trex>`,
  styleUrls  : [ './app.component.less' ]
})
export class AppComponent {
readonly themes = {
    'green': {
      'color-main'        : '#3D9D46',
      'color-main-darken' : '#338942',
      'color-main-darken2': '#286736',
      'color-main-lighten': '#7BBC4D',
      'color-accent'      : '#DC3C2A'
    },
    'pink'   : {
      'color-main'        : '#E05389',
      'color-main-darken' : '#CA3E86',
      'color-main-darken2': '#C13480',
      'color-main-lighten': '#E77A96',
      'color-accent'      : '#208FBC'
    }
  };
  selectedTheme = {};

  setTheme(val) {
    this.selectedTheme = this.themes[val];
  }
}
```
3.创建一个trex.component.ts组件
```javascript
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'dt-trex',
  template: `
<div class="class1">aaaa</div>
<div class="class2">bbb</div>
<div class="class3">ccc</div>
<div class="class4">ddd</div>
`,
  styles:`
.class1{color:var(--color-main, #ff0000);}
.class2{color:var(--color-main-darken);}
.class3{color:var(--color-main-darken2);}
.class4{color:var(--color-main-lighten);}
`
})
export class TrexComponent {
  constructor() { }
}

```
CSS 定制主题完成了，笔者准备好了源代码，方便大家查看，[点击查看源码](https://github.com/sulco/dino-themes)

但是这种方式有个缺点，浏览器最好支持 CSS3 Variable，如果不支持 CSS3 Variable，那么我还是建议你使用 less 变量。如果你并不想采用 less 的 modifyVars 方式，或者不想重写 webpack，那么以下这种方式也许适合你。

## 3. Angular Configuration

Angular 的组件默认工作在 [ViewEncapsulation.Emulated](https://angular.cn/api/core/ViewEncapsulation) 模式下，在这个模式下，应用程序的dom元素都会附加额外的属性，而 index.html 被添加的 style 会包含这些属性，从而做到组件样式的隔离；但是 component 中的样式，打包后最后会以 JS 形式出现（原理可查看上面 “webpack 打包原理”）。

因此如果想实现主题定制，实际上是需要打多个 angular 的生成包，不过值得高兴的是 angular-cli 原生支持同时生成多个 package，我们可以配置 light 和 dark 变量文件，利用 angular-cli 的 builder 打多个主题包，然后利用路由切换不同的主题。

> ViewEncapsulation.Emulated（默认）样式将被包装到 style 标签中，推送到 head 标签，并唯一标识，以便与组件的模板匹配，样式将仅用于同一组件中的模板。
> ViewEncapsulation.ShadowDom  全局样式都不会影响后代组件
> ViewEncapsulation.Native  已弃用
> ViewEncapsulation.None  样式包裹在 style 标签中并推送到 head，紧跟在组件内联和外部样式之后，属于全局样式。
通常我们都使用 Emulated 模式，如上所诉，样式将被包装到 style 标签中，推送到 head 标签，并唯一标识，以便与组件的模板匹配，这样，样式将仅用于同一组件中的模板。

下面简单介绍一下这种方式的实现流程：
1.配置全局样式 style.less
```css
 // customize_theme 是文件夹名称，存放于 src/product-configurations/styles/（light|dark）下，利用 angular.json 中的 stylePreprocessorOptions，引入 includePaths 下的样式文件；
@import 'customize_theme'; 
```
2.配置 angular.json
注意：升级到 angular8.0 后，configurations 中的 key（如 ligth-theme）不能包含“:”（踩坑），原因[这里查看](https://github.com/angular/angular-cli/pull/14676/files)
```json
"configurations": {
            "light-theme": {
              "stylePreprocessorOptions": {  // 允许您添加额外的基准路径，这些基准路径将被检查以导入，Import ‘customize_theme’，文件夹名称，也可以成功导入，不用写各种../../../相对路径
                "includePaths": [
                  "src/styles",
                  "src/product-configurations/styles/light"
                ]
              }
          },
            "dark-theme": {
                "stylePreprocessorOptions": { 
                "includePaths": [
                  "src/styles",
                  "src/product-configurations/styles/dark"
                ]
              }
            }
}
```
3.配置 packge.json
``` json
{
  "name": "app",
  "version": "0.0.1",
  "scripts": {
       "build:light": "ng build --project=app-build --configuration=light-theme"，
       "build:dark": "ng build --project=app-build --configuration=dark-theme"
  }
  // ...
}
```
这种方式缺点很明显，需要打包后切换不同语言包，打包时间翻倍，且需要路由来控制语言切换，每次切换语言都要重新加载，性能上比较浪费。

既然如此，如何避免这些缺陷了？下面来介绍一种既简单又性能好的方式。

## 4. :host-context()

[:host-context()](https://developer.mozilla.org/en-US/docs/Web/CSS/:host-context()) 是 [webComponents](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components) 下的 selector，很多人可能都没有使用过，但是却是相对而言最适合的主题切换方式。注意 :host-context() 支持的浏览器可以在 [这里](https://developer.mozilla.org/en-US/docs/Web/CSS/:host-context()) 查看


``` css
:host-context(.theme-light) h2{
   // 基于当前组件，向上查找 .theme-light 样式，如果有，则应用到组件的 h2 中
}
```
下面来介绍一下实现这种主题定制的流程：[点击查看源码](https://github.com/chensimeng/angular-theme-host-content)

1.配置 angular.json，暴露两个主题文件
```json
"styles": [ "src/light.less","src/dark.less" ]
```

2.修改 dark.less 和 light.less 文件
```css
  @html-selector: html;
  @primary-color: blue;
```
```css

  @html-selector: html;
  @primary-color: red;
```

3.配置全局样式 styles.less 文件
```css
.themeMixin(@rules) {
  :host-context(.dark) {
    @import "theme-dark";
    @rules();
  }
  :host-context(.light) {
    @import "theme-light";
    @rules();
  }
}
```

4.配置 app.component.less 应用
```css
@import "../styles";
.themeMixin({
  p {
    color: @primary-color;
  }
});
```
5.在浏览器中给 body 添加 class='dark|light'，即可看到效果。

以上方式可以实现 less 的主题动态切换，无需打包和设置路由，但是 :host-context() 和 :host 混用，会有些问题，具体可查看[这里](https://github.com/angular/angular/issues/14349)。

其他组件中有主题概念，需要用 `themeMixin` 包起来使用，此外 `@html-selector` 变量可以实现两种主题共同存在，如果你需要的话。

## 对比以上四种方式

| 定制方式 | 浏览器支持 | 打包次数  | :host混用 | 流程复杂度
| -------- | -------- | -------- | -------- | -------- |
| webpack loader     | 都支持    | 多次打包   | 支持  | 比较复杂 |
|  CSS Variable     | Chrome 49以上、FireFox 31以上、Safari 9.1以上、IE不支持   | 1次打包  | 支持  | 简单直接 |
| Angular Configuration     | 都支持    | 多次打包   | 支持   | 简单直接 |
| :host-context()     | Chrome 54以上、opera 41以上，FireFox 、Safari、IE不支持  |  1次打包  | 不支持  | 比较复杂 |
