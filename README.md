# 周子墨 ZIMO · 写代码，拍故事

我的个人网站与 AI 影像作品集，展示网站开发项目、四支完整视频、工作经历和简历。

**在线访问：[zzmandy.online](https://zzmandy.online/)**

## 项目内容

- 暖白底、黑色大字与电光蓝视觉，首页包含 WebGL 三维图形。
- 四支可播放的作品：五月天《任性》MV、联想世界杯、爱情的底色、过年。
- 12 秒作品片段、作品分类筛选和视频播放器。
- [Clavisnova](https://clavisnova.org/) 网站项目介绍。
- 个人介绍、工作经历、简历下载和联系入口。
- 适配桌面与手机，支持键盘操作与减少动态效果的系统偏好。

## 本地运行

安装 Node.js 后，在项目目录执行：

```sh
node server.mjs
```

浏览器打开 [http://127.0.0.1:4178](http://127.0.0.1:4178)。

网站使用原生 HTML、CSS 和 JavaScript，不需要安装前端依赖或运行构建命令。

## 文件说明

| 文件 | 内容 |
| --- | --- |
| `dist/index.html` | 页面内容、个人介绍、经历和联系方式 |
| `dist/projects.js` | 作品标题、简介、封面和视频地址 |
| `dist/app.js` | 筛选、播放器、导航与页面交互 |
| `dist/sculpture.js` | 首页 WebGL 三维视觉 |
| `dist/styles.css` | 页面排版、响应式样式和动效 |
| `dist/brand.css` | ZIMO 品牌标记样式 |
| `dist/assets/` | 视频、封面、图标和简历 |
| `server.mjs` | 本地预览服务，支持视频分段读取 |

## Cloudflare 部署

当前网站托管于 Cloudflare Pages，项目名为 `zimo-creative-portfolio`。

- 发布目录：`dist`。
- 构建命令：无需构建。
- 正式域名：[zzmandy.online](https://zzmandy.online/)。
- 默认地址：[zimo-creative-portfolio.pages.dev](https://zimo-creative-portfolio.pages.dev/)。

可在 Cloudflare Pages 中上传 `dist`，也可在登录 Wrangler 后发布：

```sh
npx wrangler pages deploy dist --project-name zimo-creative-portfolio --branch main
```

此仓库保存与正式网站一致的发布文件。推送 GitHub 本身不会触发当前 Pages 项目的自动部署。

## 作品说明

《任性》MV 为 AI 动画音乐视频与参赛作品；联想世界杯为品牌概念短片。视频页面展示作品类型及制作信息。

