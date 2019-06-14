<p align="center">
  <a href="http://ng.ant.design">
    <img width="230" src="https://img.alicdn.com/tfs/TB1TFFaHAvoK1RjSZFwXXciCFXa-106-120.svg">
  </a>
</p>

<h1 align="center">
NG-ZORRO Blog
</h1>

[中文版说明](./README.zh-hans.md)

## Write

Follow these steps to write a new article:

- Create a dir under `content/blog/`.
- Create an `index.md` file which would be considered as a post in the default language (Simplified Chinese).
  - All static resources can be put into the same dir.
  - (Optional) Create translations with name patterns like `index.{languageId}.md`.

### Metadata

- title
- date
- description
- (Optional) author
- (Optional) category. Please make sure you use keys in posts, and write translations in `i18n.js`.
- (Optional) tags. Please make sure you use keys in posts, and write translations in `i18n.js`.

### Dark Mode

Built-in dark mode.

![](./screenshots/white.png)

![](./screenshots/dark.png)

## License

For code, MIT.

For posts, Creative Common 4.0.
