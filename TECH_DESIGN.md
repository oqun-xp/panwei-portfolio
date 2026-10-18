# 个人作品集网站 TECH_DESIGN

> 项目：Panwei Portfolio
>
> 文档版本：v1.0
>
> 更新时间：2026-10-18

---

## 一、技术选型

| 层 | 选型 | 说明 |
|---|---|---|
| 前端框架 | React 18 + TypeScript | 组件化开发，类型安全 |
| 构建工具 | Vite | 快速冷启动与生产构建 |
| 样式 | Tailwind CSS + CSS 变量 | 原子化样式，主题色可配置 |
| 路由 | React Router | 前台与后台路由隔离 |
| Markdown | react-markdown + remark-gfm + rehype-highlight | 博客/项目详情渲染、代码高亮 |
| 表单校验 | zod | 前后端共享校验规则 |
| 图标 | lucide-react | 轻量按需加载图标 |
| 后端 | Vercel Serverless Functions（Node.js） | 与前端同仓部署，无需独立服务器 |
| 持久化 | GitHub Contents API + 私有数据仓库 | 无需额外数据库账号，天然具备版本历史 |
| 鉴权 | HMAC-SHA256 签名 token | 无状态、适配 Serverless |
| 部署 | Vercel | 静态资源 + Serverless API 一体化 |

> 未引入重型 UI 组件库，后台表单与布局使用 Tailwind 手写，符合课程约束。

---

## 二、系统架构

```text
┌──────────────────────────────────────────────────────────┐
│                       浏览器（访客 / 管理员）              │
│  React SPA（Vite 构建，Vercel 静态托管）                  │
│  ├── 前台：/ /projects /blog ...                          │
│  └── 后台：/admin/*（token + 路由守卫）                    │
└───────────────────────┬──────────────────────────────────┘
                        │ fetch /api/*
┌───────────────────────▼──────────────────────────────────┐
│                Vercel Serverless Functions                │
│  /api/login      登录，签发 token                          │
│  /api/auth-verify 校验 token                              │
│  /api/content    GET 公开内容 / PUT 管理员保存             │
│  /api/contact    POST 访客留言                             │
│  /api/messages   GET/PATCH/DELETE 管理员消息管理           │
└───────────────────────┬──────────────────────────────────┘
                        │ GitHub Contents API
┌───────────────────────▼──────────────────────────────────┐
│         GitHub 私有仓库 personal-site-data                │
│                     content.json                          │
└──────────────────────────────────────────────────────────┘
```

### 2.1 请求流程

1. 页面加载时 `GET /api/content` 获取全站内容。
2. 管理员登录 `POST /api/login`，服务端比对环境变量中的账号密码，返回 HMAC 签名 token。
3. 后台保存时 `PUT /api/content`，请求头携带 `Authorization: Bearer <token>`。
4. 服务端校验 token → zod 校验数据 → 调用 GitHub Contents API 写入 `content.json`。
5. GitHub 返回最新文件 SHA，写入成功后返回更新后的内容。

### 2.2 为什么用 GitHub 作为数据层

- 课程作业不需要额外购买/开通数据库。
- 已有 GitHub 账号，无需新增第三方平台。
- `content.json` 的每次修改都有 commit 记录，可回滚。
- Serverless 环境无持久磁盘，GitHub 提供稳定的外部持久化。

---

## 三、项目结构

```text
panwei-portfolio/
├── PRD.md                       # 产品需求文档
├── TECH_DESIGN.md               # 技术设计文档
├── AGENTS.md                    # AI 开发规范
├── README.md                    # 安装、配置、部署说明
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vercel.json                  # SPA 重写与构建配置
├── .env.example                 # 环境变量示例（不含真实密钥）
├── api/
│   ├── _lib/
│   │   ├── auth.js              # token 签发/校验
│   │   ├── store.js             # GitHub / 本地文件数据读写
│   │   ├── schema.js            # zod 数据模型
│   │   └── http.js              # 请求体解析、响应辅助
│   ├── login.js
│   ├── auth-verify.js
│   ├── content.js
│   ├── contact.js
│   └── messages.js
├── server/
│   └── api-dev.mjs              # 本地开发 API 服务（代理 GitHub/文件存储）
├── data/
│   └── content.json             # 本地开发种子数据
├── public/
│   └── ...                      # 静态资源
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    ├── api/client.ts            # 统一 API 层
    ├── context/
    │   ├── AuthContext.tsx
    │   ├── ContentContext.tsx
    │   └── ToastContext.tsx
    ├── components/
    │   ├── Starfield.tsx
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── SectionHeading.tsx
    │   ├── ProjectCard.tsx
    │   ├── Markdown.tsx
    │   ├── Tag.tsx
    │   ├── Toast.tsx
    │   ├── ConfirmDialog.tsx
    │   └── ProtectedRoute.tsx
    ├── pages/
    │   ├── Home.tsx
    │   ├── Projects.tsx
    │   ├── ProjectDetail.tsx
    │   ├── Blog.tsx
    │   ├── BlogPost.tsx
    │   └── NotFound.tsx
    └── admin/
        ├── AdminLayout.tsx
        ├── Login.tsx
        ├── Dashboard.tsx
        ├── ProfileAdmin.tsx
        ├── SkillsAdmin.tsx
        ├── ProjectsAdmin.tsx
        ├── PostsAdmin.tsx
        ├── MessagesAdmin.tsx
        ├── SettingsAdmin.tsx
        └── MarkdownEditor.tsx
```

---

## 四、数据模型

```ts
export interface Profile {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatar: string;              // 图片 URL，留空使用首字母头像
  location: string;
  email: string;
  github: string;
  socials: SocialLink[];
  education: TimelineItem[];
  experience: TimelineItem[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  level: number;               // 0-100
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;         // Markdown
  cover: string;               // 预设渐变 key 或图片 URL
  tags: string[];
  link?: string;
  repo?: string;
  featured: boolean;
  date: string;                // YYYY-MM
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;             // Markdown
  tags: string[];
  date: string;                // YYYY-MM-DD
  cover?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Settings {
  siteTitle: string;
  accent: string;              // hex
  footerText: string;
}

export interface ContentData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  posts: Post[];
  messages: Message[];
  settings: Settings;
  updatedAt: string;
}
```

### 4.1 content.json 顶层示例

```json
{
  "profile": { "name": "盘巍", "role": "计算机专业 · 大四学生", "...": "..." },
  "skills": [{ "id": "s1", "category": "前端", "name": "React", "level": 85 }],
  "projects": [{ "id": "p1", "title": "图提取 ImageGrab", "featured": true }],
  "posts": [{ "id": "b1", "slug": "build-imagegrab", "title": "..." }],
  "messages": [],
  "settings": { "siteTitle": "盘巍 · 个人作品集", "accent": "#22D3EE" },
  "updatedAt": "2026-10-18T00:00:00.000Z"
}
```

---

## 五、API 设计

所有接口统一返回 JSON；错误格式：

```json
{ "error": { "code": "UNAUTHORIZED", "message": "登录已过期，请重新登录" } }
```

### 5.1 接口清单

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/login` | 否 | 账号密码登录 |
| GET | `/api/auth-verify` | Bearer | 校验 token 是否有效 |
| GET | `/api/content` | 否 | 获取全站内容 |
| PUT | `/api/content` | Bearer | 保存全站内容 |
| POST | `/api/contact` | 否 | 提交联系表单 |
| GET | `/api/messages` | Bearer | 获取留言列表 |
| PATCH | `/api/messages` | Bearer | 标记留言已读 |
| DELETE | `/api/messages?id=` | Bearer | 删除留言 |

### 5.2 登录

```http
POST /api/login
Content-Type: application/json

{ "username": "admin", "password": "******" }
```

成功：

```json
{ "token": "<payload>.<signature>", "user": { "name": "admin" }, "expiresIn": 43200 }
```

失败：`401`，统一返回「账号或密码错误」，不区分具体原因。

### 5.3 内容保存

```http
PUT /api/content
Authorization: Bearer <token>
Content-Type: application/json

{ "profile": {...}, "skills": [...], "projects": [...], "posts": [...], "settings": {...} }
```

- 请求体不包含 `messages`，消息只能通过联系表单/消息接口修改。
- 服务端补齐 `updatedAt`，校验通过后写入 GitHub。
- 写入冲突（GitHub 409）时重新读取 SHA 并重试一次。

---

## 六、认证与安全设计

### 6.1 Token 结构

```text
base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, AUTH_SECRET))
payload = { "sub": "admin", "iat": 1729200000, "exp": 1729243200 }
```

- 签名与校验使用 Node `crypto.createHmac('sha256', AUTH_SECRET)`。
- 比较签名时使用 `crypto.timingSafeEqual`，避免时序攻击。
- token 有效期 12 小时；过期后前端跳转登录页。
- `AUTH_SECRET` 为 32 字节以上随机字符串，只存放在服务端环境变量。

### 6.2 密码

- 服务端环境变量 `ADMIN_USERNAME`、`ADMIN_PASSWORD`。
- 比较前对两侧做 SHA-256，再用 `timingSafeEqual` 比较。
- 前端不存储密码，只存储 token。
- 登录接口固定延迟 300ms，降低暴力破解速度。
- 生产环境必须在 Vercel 中替换默认密码。

### 6.3 数据安全

- `GITHUB_DATA_TOKEN` 仅存在 Vercel 环境变量，API 读取后不会返回给客户端。
- 数据仓库设为 **private**，只有 token 可读写。
- 前端 Markdown 不启用 raw HTML，避免 XSS。
- 联系表单限制字段长度，服务端 zod 校验。
- 所有删除操作前端二次确认。

### 6.4 CORS 与缓存

- 前后端同域，无需额外 CORS 配置。
- `GET /api/content` 设置 `Cache-Control: no-store`，保证后台修改后立即生效。
- 静态资源由 Vercel CDN 缓存。

---

## 七、关键实现

### 7.1 星空 Canvas

- `Starfield` 组件创建全屏 `canvas`，`position: fixed`，`z-index: -1`。
- 根据 `window.innerWidth` 生成星星：桌面 160 颗、移动端 70 颗。
- 每帧绘制星星，透明度按 `sin(time + phase)` 闪烁。
- 鼠标移动时按 `(mouse - center) * 0.01` 偏移，形成视差。
- `matchMedia('(prefers-reduced-motion: reduce)')` 命中时只绘制一次静态星空。
- 监听 `resize` 重新计算设备像素比与星星数量。

### 7.2 Markdown 与目录

- `react-markdown` + `remark-gfm` 渲染表格、任务列表、删除线。
- `rehype-highlight` + `highlight.js` 主题实现代码高亮。
- 通过正则从 Markdown 提取 `##` / `###` 标题，生成 TOC。
- 标题 slug 使用「去空格 + 转小写 + 保留中文」规则；渲染时给标题加 `id`。
- 目录使用 `IntersectionObserver` 高亮当前章节。

### 7.3 后台状态管理

- `ContentContext` 在应用启动时请求一次 `/api/content`，前台与后台共享。
- 后台页面编辑时复制一份 draft，保存时调用 `updateContent(next)`；成功后同步 context。
- 保存失败保留 draft，并展示错误 Toast。
- 路由守卫 `ProtectedRoute` 检查 token 是否存在且未过期；进入后台布局时调用 `/api/auth-verify` 二次校验。

### 7.4 本地开发

Vercel Serverless 函数无法直接由 Vite 提供，因此本地开发使用：

```text
Vite dev server :5173
      │ /api 代理
      ▼
server/api-dev.mjs :8787
      │ 无 GITHUB_DATA_TOKEN 时
      ▼
data/content.json（本地文件持久化）
```

- `npm run dev` 同时启动 Vite 与本地 API。
- 本地未配置 GitHub token 时自动使用 `data/content.json`，方便开发与截图。
- 生产环境必须配置 `GITHUB_DATA_TOKEN` 与 `GITHUB_DATA_REPO`。

### 7.5 SPA 路由

`vercel.json` 中将非 `/api` 请求重写到 `index.html`，保证刷新 `/blog/xxx` 等前端路由不 404：

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

---

## 八、部署设计

### 8.1 仓库

| 仓库 | 可见性 | 用途 |
|---|---|---|
| `oqun-xp/panwei-portfolio` | Public | 前端 + API 源码 |
| `oqun-xp/personal-site-data` | Private | `content.json` 数据 |

### 8.2 环境变量

| 变量 | 说明 |
|---|---|
| `ADMIN_USERNAME` | 管理员账号 |
| `ADMIN_PASSWORD` | 管理员密码 |
| `AUTH_SECRET` | token 签名密钥（32 字节以上） |
| `GITHUB_DATA_TOKEN` | 可读写数据仓库的 GitHub token |
| `GITHUB_DATA_REPO` | `oqun-xp/personal-site-data` |
| `GITHUB_DATA_PATH` | `content.json`（默认） |

### 8.3 部署流程

1. 推送代码到 GitHub。
2. Vercel 导入仓库，框架自动识别为 Vite。
3. 在 Vercel 项目 Settings → Environment Variables 配置上述变量。
4. 点击 Deploy，等待构建完成。
5. 访问分配的 `*.vercel.app` 域名。
6. 登录 `/admin`，修改资料，验证线上持久化。

### 8.4 本地回退策略

```text
if (GITHUB_DATA_TOKEN && GITHUB_DATA_REPO) → GitHub Contents API
else if (非生产环境) → data/content.json
else → 500 DATA_STORE_NOT_CONFIGURED
```

---

## 九、测试策略

### 9.1 本地验收

- `npm run build` 通过，无 TypeScript 错误。
- 首页、项目、博客、404 路由可访问。
- 登录错误密码提示、正确密码进入后台。
- 修改姓名/简介/技能并保存，刷新前台生效。
- 新建/编辑/删除项目与文章。
- 联系表单提交后，后台留言列表出现新消息。
- 375px、768px、1440px 截图检查无溢出。

### 9.2 线上验收

- Vercel 部署状态 Ready。
- 线上首页与本地一致。
- 线上登录、保存、刷新后数据仍存在。
- 检查浏览器控制台无报错。
- 检查移动端菜单与星空动画。

### 9.3 回归清单

- [ ] 构建通过
- [ ] 控制台无报错
- [ ] 登录/退出正常
- [ ] 数据保存与读取正常
- [ ] 删除二次确认
- [ ] 移动端无横向滚动
- [ ] 减少动效模式生效

---

## 十、性能与可维护性

- 路由级组件按需加载（React.lazy）可选；当前项目体量较小，首屏依赖可控。
- Markdown 渲染组件仅在详情页加载。
- 星空 Canvas 使用 `requestAnimationFrame`，页面隐藏时暂停。
- 图标按需引入，避免整包打入。
- 数据模型集中定义，API 使用 zod 校验，新增字段时同步更新 `types.ts`、`schema.js` 与 `content.json`。
- 设计变量集中在 `index.css` 的 `:root`，强调色由后台设置动态注入。
