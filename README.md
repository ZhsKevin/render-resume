# H&S 简历

一份简约的在线简历模板，基于 Vite 构建。项目现在把“文本内容 / 简历配置”和“样式 / 渲染逻辑”分开：

## 效果预览
PC端：

<img src="imgs/pc%E7%AB%AF%E9%A2%84%E8%A7%88.png" width="520" alt="pc端预览" style="zoom:20%;" />

移动端：

<img src="imgs/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E9%A2%84%E8%A7%88.png" width="360" alt="移动端预览" style="zoom:33%;" />

- `index.html`：放简历文本、链接、图片路径、页面标题等配置。
- `src/main.scss`：只放样式。
- `src/main.js`：只读取 `index.html` 里的配置并渲染页面。

这样构建后，如果只是改一个文案、链接或标点，可以直接改 `dist/index.html`，不需要重新生成 JS 和 CSS。

## 环境要求

- Node.js 20 或更高版本
- npm 10 或更高版本
- Git

## 从拉项目开始

```bash
git clone <你的仓库地址>
cd HS-resume
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:9991/
```

## 配置简历内容

简历内容集中在 `index.html` 的这段 JSON 中：

```html
<script id="resume-data" type="application/json">
  {
    "title": "张得帅丨简历",
    "name": "张得帅"
  }
</script>
```

常用字段：

- `title`：浏览器标签页标题。
- `name`：页面顶部姓名。
- `profilePhoto`：证件照配置，默认关闭。
- `basics`：求职意向、现居地区、电话、博客、邮箱。
- `mainSections`：教育经历、校园经历、工作经历、社会实践、项目经历、相关技能。
- `sideSections`：开发技能、项目演示、联系方式二维码。
- `footer`：页脚版权、PDF 下载链接、备案信息。

带 `href` 的内容会渲染成链接。电话建议使用 `tel:`，邮箱建议使用 `mailto:`。

### 长文本怎么换行编辑

`index.html` 里的配置是标准 JSON，双引号字符串内部不能直接敲真实换行。下面这种写法会让编辑器标红：

```json
{
  "descriptions": [
    "第一句文字
    第二句文字"
  ]
}
```

推荐把长文本拆成多个数组项，编辑时自然换行，页面渲染时仍然会合并成同一段自然排版：

```json
{
  "descriptions": [
    "第一句文字",
    "第二句文字",
    "第三句文字"
  ]
}
```

如果确实想让页面显示为两段，可以在字符串里写 `\n`：

```json
{
  "descriptions": [
    "第一段文字\n第二段文字"
  ]
}
```

### 配置证件照

证件照开关在 `index.html` 的 `profilePhoto` 字段中，建议选择白底证件照：

```json
{
  "profilePhoto": {
    "enabled": false,
    "src": "assets/profile-photo.jpg",
    "alt": "证件照"
  }
}
```

- `enabled: false`：不显示证件照，页面保持无照片布局。
- `enabled: true`：显示证件照，顶部蓝色线会缩短到照片左侧。
- `src`：图片路径。建议把证件照放到 `assets/profile-photo.jpg`，构建后路径仍然是 `assets/profile-photo.jpg`。

## 配置二维码和图片

公共图片放在：

```text
assets/
```

构建后会复制到：

```text
dist/assets/
```

配置图片时，在 `index.html` 中写构建后的相对路径：

```json
{
  "caption": "微信",
  "image": "assets/qrcode-placeholder.svg",
  "alt": "微信二维码"
}
```

替换成自己的图片时，把文件放进 `assets/`，再把 `image` 改成对应路径即可，例如：

```json
{
  "caption": "微信",
  "image": "assets/wechat-qr.png",
  "alt": "微信二维码"
}
```

## 配置网站 Logo

浏览器标签页上的网站 logo 使用 favicon 配置，在 `index.html` 的 `<head>` 中：

```html
<link rel="icon" href="assets/site-logo.svg" type="image/svg+xml">
```

默认文件位置：

```text
assets/site-logo.svg
```

如果要替换成自己的 logo，直接替换这个文件即可。也可以改成其他文件名，例如：

```html
<link rel="icon" href="assets/favicon.png" type="image/png">
```

## 配置样式

样式文件是：

```text
src/main.scss
```

常改项：

- `$theme-color`：主题蓝色。
- `$text-color`：正文颜色。
- `$page-bg`：页面背景色。
- `.content`：简历纸张宽度和外边距。
- `.content-hd .name h1`：姓名字号、字重、字距。
- `@media screen and (max-width: 720px)`：手机端样式。

样式变化需要重新执行 `npm run build`，因为 CSS 是从 `src/main.scss` 生成的。

## 生成静态页面

```bash
npm run build
```

生成结果在：

```text
dist/
```

当前构建配置会输出可读文件名：

```text
dist/
├── assets/
│   ├── index.css
│   ├── index.js
│   ├── profile-photo.jpg
│   └── qrcode-placeholder.svg
└── index.html
```

生产构建已关闭压缩和哈希文件名，所以 `index.js` 和 `index.css` 会保持相对可读。

## 修改已生成页面

如果只改文本、链接、图片路径、备案信息等内容：

```text
dist/index.html
```

改完直接刷新页面即可，不需要重新构建。

如果改的是样式或渲染逻辑：

- 样式：修改 `src/main.scss` 后执行 `npm run build`。
- 逻辑：修改 `src/main.js` 后执行 `npm run build`。

## 本地检查构建产物

```bash
npm run preview
```

默认访问：

```text
http://localhost:9991/
```

## 发布页面

项目已移除内置发布依赖，保持更轻量。发布时先生成静态目录：

```bash
npm run build
```

然后把整个 `dist/` 上传到你的静态托管服务，例如 GitHub Pages、对象存储、Nginx、宝塔面板或 CDN 控制台。

## 配置自定义域名

如需自定义域名，创建：

```text
public/CNAME
```

内容只写域名本身，不要写 `https://`。

构建时，Vite 会自动把它复制到 `dist/CNAME`。

## 常见问题

### 改了文案是否要重新构建？

如果改的是 `dist/index.html` 里的 `resume-data` 配置，不需要重新构建。

如果改的是源码里的 `index.html`，需要重新执行 `npm run build` 才会更新 `dist/index.html`。

### 图片不显示

确认图片在 `assets/` 中，并且 `index.html` 里使用的是类似 `assets/wechat-qr.png` 的相对路径。

### JS/CSS 为什么不压缩？

这是刻意设置的。项目更重视部署后可维护性，因此 `vite.config.js` 里关闭了生产压缩和哈希文件名。

## 命令速查

```bash
npm install       # 安装依赖
npm run dev      # 本地开发预览
npm run build    # 生成 dist 静态页面
npm run preview  # 预览 dist 构建产物
```
