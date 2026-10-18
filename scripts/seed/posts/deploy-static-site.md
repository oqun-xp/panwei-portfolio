## 为什么需要部署

本地开发只能自己看到。部署之后，简历、作业和社交分享才能有一个稳定的访问入口。静态网站常见的免费方案有 GitHub Pages、Vercel、Cloudflare Pages 等。

这篇文章记录我在课程作业中使用 GitHub Pages 与 Vercel 的实践。

## GitHub Pages

GitHub Pages 适合纯静态站点。配置步骤：

1. 把代码推送到 GitHub 仓库。
2. 打开仓库 **Settings → Pages**。
3. Source 选择 **Deploy from a branch**。
4. 分支选 `main`，目录选 `/docs` 或 `/`。
5. 等待 Actions 构建完成，访问 `https://用户名.github.io/仓库名/`。

我的 Chrome 插件官网就放在 `docs/` 目录，使用 `main` + `/docs` 发布：

```text
https://oqun-xp.github.io/imagegrab/
```

GitHub Pages 的优点是免费、稳定、和仓库天然集成；缺点是只能托管静态资源，没有服务端接口。

## Vercel

Vercel 更适合需要 API 的项目。导入 GitHub 仓库后，它会自动识别 Vite、Next.js 等框架，分配 `*.vercel.app` 域名。

对于 Vite + Serverless Functions 的项目，关键在于：

- 前端构建产物输出到 `dist/`
- `api/` 目录下的函数自动成为 `/api/*`
- 用 `vercel.json` 配置 SPA 重写

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

这条规则保证刷新 `/blog/xxx` 时仍然返回 `index.html`，由前端路由接管。

## 环境变量

部署带后台的项目时，不要把密钥写进代码。Vercel 的环境变量只在服务端可用：

- `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `GITHUB_DATA_TOKEN`

前端只能拿到登录后的短期 token，拿不到这些长期密钥。

## 两种方案怎么选

| 需求 | 推荐 |
|---|---|
| 纯静态博客、文档 | GitHub Pages |
| 需要 API、登录、数据库 | Vercel |
| 需要全球 CDN 与 Cloudflare 生态 | Cloudflare Pages |

我的个人作品集需要后台保存数据，所以选择 Vercel；插件官网只需要展示，继续使用 GitHub Pages。两者并不冲突。
