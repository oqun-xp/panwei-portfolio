# Panwei Portfolio

深色星空主题的个人作品集网站，包含前台展示与独立后台管理，部署在 Vercel。

- 前台：个人介绍、技能、项目、博客、联系方式
- 后台：`/admin` 登录后管理个人信息、技能、项目、博客、留言与站点设置
- 后端：Vercel Serverless Functions
- 持久化：GitHub 私有仓库 `personal-site-data/content.json`
- 技术栈：React 18 + TypeScript + Vite + Tailwind CSS + React Router

## 快速开始

```bash
npm install
npm run dev
```

本地访问 `http://localhost:5173`，后台入口 `http://localhost:5173/admin`。

本地开发默认使用 `data/content.json` 作为数据源，不需要配置 GitHub token。

### 默认管理员账号

```text
用户名：admin
密码：Panwei@2026
```

> 仅用于课程演示。线上部署请在 Vercel 环境变量中修改 `ADMIN_USERNAME` 与 `ADMIN_PASSWORD`。

## 环境变量

复制 `.env.example` 为 `.env.local`（本地）或在 Vercel 项目 Settings → Environment Variables 中配置：

| 变量 | 必填 | 说明 |
|---|---|---|
| `ADMIN_USERNAME` | 是 | 管理员用户名 |
| `ADMIN_PASSWORD` | 是 | 管理员密码 |
| `AUTH_SECRET` | 是 | token 签名密钥，建议 32 字节以上随机字符串 |
| `GITHUB_DATA_TOKEN` | 线上必填 | 可读写数据仓库的 GitHub token |
| `GITHUB_DATA_REPO` | 线上必填 | 例如 `oqun-xp/personal-site-data` |
| `GITHUB_DATA_PATH` | 否 | 默认 `content.json` |

本地如果设置了 `GITHUB_DATA_TOKEN`，会优先使用 GitHub 存储；否则回退到 `data/content.json`。

## 常用命令

```bash
npm run dev       # Vite + 本地 API
npm run build     # TypeScript 检查 + 生产构建
npm run preview   # 预览构建产物
```

## 目录

```text
api/                 Vercel Serverless Functions
data/content.json    本地开发种子数据
server/api-dev.mjs   本地 API 服务
src/pages/           前台页面
src/admin/           后台页面
src/components/      通用组件
src/context/         内容、鉴权、Toast
src/api/             统一 API 客户端
```

详细设计见 [PRD.md](./PRD.md)、[TECH_DESIGN.md](./TECH_DESIGN.md)、[AGENTS.md](./AGENTS.md)。

## 部署到 Vercel

1. 将代码推送到 GitHub 仓库。
2. 在 Vercel 中导入仓库，框架自动识别为 Vite。
3. 配置上述环境变量。
4. 点击 Deploy，等待构建完成。
5. 访问 `https://<project>.vercel.app`。
6. 登录 `/admin` 修改资料，刷新前台验证数据已持久化。

数据仓库需要提前创建为 **private**，并在其中放入 `content.json`。Vercel 函数通过 GitHub Contents API 读写该文件。

## 说明

本项目为计算机综合实习课程作业，内容与账号仅用于学习与演示。
