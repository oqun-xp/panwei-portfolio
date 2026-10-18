# AGENTS.md

本文件用于约束 AI 在本项目中的开发行为。所有代码修改都应先阅读 PRD.md、TECH_DESIGN.md 与本文件。

## 一、项目概述

Panwei Portfolio 是一个深色星空主题的个人作品集网站：

- 前台：个人介绍、技能、项目、博客、联系方式。
- 后台：管理员登录后编辑个人信息、技能、项目、博客、站点设置，并查看留言。
- 技术栈：React 18 + TypeScript + Vite + Tailwind CSS + React Router。
- 后端：Vercel Serverless Functions。
- 持久化：GitHub 私有数据仓库中的 `content.json`；本地开发回退到 `data/content.json`。
- 部署：Vercel。

## 二、常用命令

```bash
npm install          # 安装依赖
npm run dev          # 同时启动 Vite 与本地 API（端口 5173 / 8787）
npm run build        # TypeScript 检查 + 生产构建
npm run preview      # 预览生产构建（不含 API）
npm run lint         # 如已配置 ESLint
vercel --prod        # 部署生产环境
```

- 本地 API 未配置 GitHub token 时自动读写 `data/content.json`。
- 不要在开发环境伪造线上数据；线上验证必须走 Vercel 域名。

## 三、目录与职责

| 目录 | 职责 |
|---|---|
| `src/pages` | 前台页面，只负责展示与交互 |
| `src/admin` | 后台页面，独立布局与表单 |
| `src/components` | 可复用展示组件 |
| `src/context` | 全局内容、鉴权、Toast 状态 |
| `src/api` | 统一 API 客户端，禁止页面直接写 `fetch('/api/...')` |
| `api/` | Vercel Serverless 函数，只处理 HTTP 与数据校验 |
| `api/_lib` | 鉴权、存储、zod schema、HTTP 辅助 |
| `data/` | 本地开发种子数据，不包含真实密钥 |
| `server/` | 本地开发 API 服务，不部署 |

## 四、代码规范

### 4.1 TypeScript

- 开启 `strict`，禁止使用 `any` 绕过类型检查。
- 公共数据类型统一放在 `src/types.ts`。
- 组件 props 必须显式定义类型。
- 异步函数必须处理错误分支，不能只写 happy path。

### 4.2 React

- 使用函数组件 + Hooks，不使用 class 组件。
- 组件保持单一职责；超过 250 行的组件应拆分。
- 列表渲染必须提供稳定的 `key`。
- 副作用放入 `useEffect`，并正确清理事件监听与定时器。
- 不直接在渲染阶段修改 state。
- 表单使用受控组件；提交时先做客户端校验（zod），再请求 API。

### 4.3 样式

- 优先使用 Tailwind 原子类；复杂复用样式可抽到 `index.css`。
- 颜色、圆角、间距使用设计 token（CSS 变量 / Tailwind 主题）。
- 强调色从 `settings.accent` 注入 `--accent`，不要在组件中硬编码强调色。
- 深色主题下所有文字对比度达到 WCAG AA。
- 不使用重型 UI 组件库；图标使用 lucide-react。
- 所有页面必须在 375px、768px、1440px 下检查。

### 4.4 文案

- 界面文案使用中文，语气简洁专业。
- 错误提示必须可理解，不直接展示堆栈或英文异常。
- 代码注释只在逻辑不直观时添加，避免解释显而易见的代码。

## 五、API 与数据约定

1. 所有写操作必须经过 `src/api/client.ts`，统一附加 token。
2. 前台只调用 `GET /api/content` 与 `POST /api/contact`，不得直接读写 GitHub。
3. 后台保存时必须提交完整内容对象（不含 `messages`）。
4. 任何写入前都必须在服务端用 zod 校验：
   - 字符串长度限制；
   - 枚举值限制（如 `level` 0–100）；
   - 数组最大长度；
   - URL 仅允许 `http://` / `https://` / 空字符串。
5. 禁止把 `GITHUB_DATA_TOKEN`、`AUTH_SECRET`、管理员密码写入前端代码、日志或仓库。
6. `content.json` 中不得存放密码、token、身份证号等敏感信息。
7. 删除操作必须有二次确认。
8. 保存成功/失败必须给用户反馈（Toast）。

## 六、认证规范

- 登录成功后仅将 token 存到 `localStorage`，key 为 `panwei_portfolio_token`。
- 禁止在 localStorage 存储明文密码。
- 后台路由统一由 `ProtectedRoute` 守卫。
- token 过期或被服务端拒绝时，清除本地 token 并跳转 `/admin/login`。
- 服务端所有受保护接口必须先校验 `Authorization: Bearer <token>`。
- 比较密码/签名时使用 `crypto.timingSafeEqual`。

## 七、设计与交互规范

- 深色背景 `#05070D` / `#0B0F1A`，卡片半透明，边框低对比。
- 星空 Canvas 固定在内容后方，不能拦截点击。
- 尊重 `prefers-reduced-motion`：减少动效时停止星星闪烁与滚动动画。
- 导航吸顶，移动端使用汉堡菜单，点击链接后自动收起。
- 所有交互元素有 hover / focus-visible 状态。
- 图片必须有 `alt`；纯装饰元素加 `aria-hidden="true"`。
- 表单控件必须有 `<label>` 或 `aria-label`。
- 页面切换后滚动到顶部；锚点跳转要扣除导航栏高度。

## 八、测试要求

每次提交前至少完成：

1. `npm run build` 通过，无 TypeScript 错误。
2. 打开浏览器控制台，确认无红色报错。
3. 前台路由逐个访问：`/`、`/projects`、`/projects/:id`、`/blog`、`/blog/:slug`、404。
4. 后台流程：
   - 错误密码登录失败；
   - 正确密码登录成功；
   - 修改个人信息并保存，刷新前台生效；
   - 新建/编辑/删除项目、文章；
   - 删除时出现二次确认；
   - 联系表单提交后，后台留言列表出现新记录。
5. 响应式：375px / 768px / 1440px 无横向滚动。
6. 关闭动画模式（系统减少动效）下页面仍可正常使用。

## 九、禁止事项

- 禁止引入 Next.js、Ant Design、MUI 等重型框架/UI 库替换现有技术栈。
- 禁止将 GitHub token、Vercel token、管理员密码提交到 Git。
- 禁止在生产环境使用 `data/content.json` 作为存储。
- 禁止使用 `dangerouslySetInnerHTML` 渲染用户输入。
- 禁止跳过登录直接开放写接口。
- 禁止删除 `PRD.md`、`TECH_DESIGN.md`、`AGENTS.md` 或改变其核心约束。
- 禁止为了截图而写死虚假的成功状态；所有展示必须来自真实 API 数据。

## 十、交付要求

- 代码、文档、数据种子结构保持一致。
- README 必须包含本地启动、环境变量、默认管理员账号、部署步骤。
- 线上部署后，后台修改必须可持久化并在刷新后生效。
- 截图材料需覆盖：三份文档内容、线上首页、后台登录、后台编辑、保存后前台变化、域名地址。
