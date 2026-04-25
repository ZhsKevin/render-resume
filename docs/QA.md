# 常见问题

这里放 `render-resume` 的细节配置说明。README 负责快速介绍项目，这份文档负责回答实际改简历时最容易遇到的问题。

## 改了文案是否要重新构建？

如果改的是源码里的 `index.html`、`assets/markdown/`、`assets/imgs/` 或 `src/`，建议重新执行：

```bash
npm run build
```

如果你已经构建完成，只是在托管后的 `dist/index.html` 里临时改一个文案、链接或标点，不需要重新生成 JS 和 CSS。

## 图片不显示怎么办？

确认图片放在 `assets/imgs/` 中，并且 `index.html` 里使用的是构建后也成立的相对路径，例如：

```json
{
  "image": "assets/imgs/wechat-qr.png"
}
```

构建后它会对应到：

```text
dist/assets/imgs/wechat-qr.png
```

## Markdown 详情页怎么配置？

把 Markdown 文件放到：

```text
assets/markdown/
```

然后在 `index.html` 的项目条目里写：

```json
{
  "name": "项目名称",
  "href": "mdviewer.html?file=assets/markdown/project-name.md"
}
```

`mdviewer` 默认只允许读取 `assets/markdown/` 下的 `.md` 文件，这样可以避免误把其他公开文件当作文档打开。

## Markdown 之间能互相跳转吗？

可以。Markdown 中可以写普通 `.md` 链接，也可以写带 `mdviewer.html?file=` 的链接。模板里的示例项目合集使用的是：

```markdown
[Orion AgentMesh](../../mdviewer.html?file=assets/markdown/agent-mesh.md)
```

渲染时，查看器会把同源 Markdown 链接整理成 `mdviewer.html?file=...` 形式。

## JS/CSS 为什么不压缩？

这是刻意设置的。项目更重视部署后的可读性和轻量维护，所以 `vite.config.js` 里关闭了生产压缩：

```js
minify: false,
cssMinify: false,
```

同时 JS/CSS 文件名仍然带 hash，避免浏览器长期缓存旧资源。

## 文本怎么局部加粗？

简历文案支持用一对星号标记局部加粗：

```json
{
  "name": "某某某某软件*科技*有限公司 ｜ Java 开发工程师"
}
```

页面会显示为“某某某某软件科技有限公司”，其中“科技”加粗。

如果确实需要显示星号本身，并且它刚好会被识别成加粗标记，可以写 `\\*`：

```json
{
  "name": "这里显示星号：\\*"
}
```

## 简历内容字段怎么写？

纯列表内容使用 `items`，适合教育经历、校园经历、相关技能：

```json
{
  "title": "教育经历：",
  "tag": "教育经历",
  "items": [
    "XX 大学 ｜ XX 专业 ｜ 本科（2020.9 - 2024.7）",
    "英文水平：CET-6"
  ]
}
```

带标题的经历使用 `lists`，工作经历、社会实践、项目经历都可以用这一套：

```json
{
  "title": "项目经历：",
  "tag": "项目",
  "lists": [
    {
      "name": "项目名称",
      "href": "mdviewer.html?file=assets/markdown/project-name.md",
      "img": "assets/imgs/project-icon.png",
      "frontScale": 1.2,
      "dtoList": [
        "第一条说明",
        "第二条说明"
      ]
    }
  ]
}
```

字段含义：

- `name`：条目标题。
- `href`：标题链接，可以是外链，也可以是 Markdown 详情页。
- `dto`：普通段落，适合较长描述。
- `dtoList`：多行圆点说明，适合项目亮点或职责拆分。
- `frontScale`：标题字号倍率，例如 `1.2` 表示放大 20%。
- `img`：显示在文字前面的图片，适用于项目、基础信息和页脚。

## 长文本怎么编辑？

`index.html` 里的配置是标准 JSON，双引号字符串内部不能直接敲真实换行。下面这种写法会让编辑器标红：

```json
{
  "dto": [
    "第一句文字
    第二句文字"
  ]
}
```

推荐把长文本拆成多个数组项。页面渲染时会合并成同一段自然排版：

```json
{
  "dto": [
    "第一句文字",
    "第二句文字",
    "第三句文字"
  ]
}
```

## 长文本如何显示成多行？

使用 `dtoList`：

```json
{
  "name": "2024.1 - 2025.1  某某公司 ｜ 后端研发工程师",
  "dtoList": [
    "第一行文字",
    "第二行文字",
    "第三行文字"
  ]
}
```

`dtoList` 的每一项都会显示成一条圆点说明，也支持 `*局部加粗*`。

## 怎么配置证件照？

证件照开关在 `index.html` 的 `profilePhoto` 字段中：

```json
{
  "profilePhoto": {
    "enabled": false,
    "src": "assets/imgs/profile-photo.jpg",
    "alt": "证件照"
  }
}
```

- `enabled: false`：不显示证件照。
- `enabled: true`：显示证件照。
- `src`：图片路径，建议放到 `assets/imgs/profile-photo.jpg`。

## 怎么配置二维码和图片？

公共图片放在：

```text
assets/imgs/
```

配置图片时，在 `index.html` 中写构建后的相对路径：

```json
{
  "caption": "微信",
  "image": "assets/imgs/qrcode-placeholder.svg",
  "alt": "微信二维码"
}
```

替换成自己的图片时，把文件放进 `assets/imgs/`，再把 `image` 改成对应路径即可，例如：

```json
{
  "caption": "微信",
  "image": "assets/imgs/wechat-qr.png",
  "alt": "微信二维码"
}
```

## 怎么配置网站 Logo？

浏览器标签页上的网站 logo 在 `index.html` 的 `<head>` 中配置：

```html
<link rel="icon" href="assets/imgs/site-logo.svg" type="image/svg+xml">
```

默认文件位置：

```text
assets/imgs/site-logo.svg
```

如果要替换成自己的 logo，直接替换这个文件即可。也可以改成其他文件名：

```html
<link rel="icon" href="assets/imgs/favicon.png" type="image/png">
```

## 怎么配置 PDF 下载？

把 PDF 放到：

```text
assets/files/
```

然后在 `index.html` 的页脚里写：

```json
{
  "label": "下载 PDF 版简历",
  "href": "assets/files/resume.pdf"
}
```

## 怎么改样式？

简历样式文件是：

```text
src/main.scss
```

Markdown 查看器样式文件是：

```text
src/mdviewer.scss
```

常改项：

- `$theme-color`：主题蓝色。
- `$text-color`：正文颜色。
- `$page-bg`：页面背景色。
- `.content`：简历纸张宽度和外边距。
- `.content-hd .name h1`：姓名字号、字重、字距。
- `@media screen and (max-width: 720px)`：手机端样式。

样式变化需要重新执行 `npm run build`，因为 CSS 是从 `src/*.scss` 生成的。

## 怎么配置 404 页面？

项目根目录的 `404.html` 会参与构建，并输出为：

```text
dist/404.html
```

部署到 GitHub Pages 或其他静态托管平台时，可以用它作为未匹配路径的兜底页面。

## 怎么配置自定义域名？

如需自定义域名，可以按静态托管平台要求创建 `CNAME` 文件。常见做法是在公开资源目录或发布分支根目录放置：

```text
CNAME
```

内容只写域名本身，不要写 `https://`。

## 如何发布到 GitHub Pages？

先构建：

```bash
npm run build
```

如果你想把 `dist/` 发布到指定分支，可以运行：

```bash
npm run publish:dist -- branch master
```

脚本会构建、复制 `dist/`、提交并推送到目标分支，不会切换当前工作区分支。
