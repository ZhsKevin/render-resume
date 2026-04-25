# render-resume

> 一个用于在线简历和作品集展示的 Vite 静态页面模板。

## 项目简介

render-resume 使用一份内嵌 JSON 描述简历内容，再由前端脚本渲染成响应式页面。它适合个人主页、作品集、求职简历、项目介绍页和 GitHub Pages 静态部署。

当前仓库中的姓名、学校、公司、项目和联系方式全部是虚构示例，目的是帮助你安全地理解字段结构。正式发布前，请替换为自己的真实信息，或继续保留虚构内容作为演示模板。

## 为什么这样设计

- 内容集中：大部分简历内容都在 `index.html` 的 `resume-data` JSON 中。
- 结构轻量：核心只有 Vite、Sass 和少量原生 JavaScript。
- 易于部署：执行 `npm run build` 后即可把 `dist/` 上传到静态托管平台。
- 项目详情：可通过 `mdviewer.html?file=assets/markdown/example.md` 展示 Markdown 项目说明。
- 公开友好：默认示例数据已虚构化，避免误把私人经历、二维码或文档发布出去。

## 适合谁用

- 想快速搭一个在线简历的人。
- 想把项目经历写得更完整，但又不想维护复杂博客系统的人。
- 想发布一个简洁 GitHub Pages 项目页的人。

## 使用建议

先改 `index.html` 中的 JSON，再把项目详情写进 `assets/markdown/`。如果需要放图片，优先放到 `assets/imgs/` 或新增公开素材目录，并确认图片不包含隐私信息。
