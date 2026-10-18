import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFile(path.join(root, relative), 'utf8');

const [imagegrab, summarizer, portfolio, aiZero] = await Promise.all([
  read('scripts/seed/projects/imagegrab.md'),
  read('scripts/seed/projects/summarizer.md'),
  read('scripts/seed/projects/portfolio.md'),
  read('scripts/seed/projects/ai-zero.md')
]);

const [postImagegrab, postDeploy, postAi] = await Promise.all([
  read('scripts/seed/posts/build-imagegrab.md'),
  read('scripts/seed/posts/deploy-static-site.md'),
  read('scripts/seed/posts/ai-dev-workflow.md')
]);

const content = {
  profile: {
    name: '盘巍',
    role: '计算机专业 · 大四学生',
    tagline: '用代码把想法变成可用的产品。',
    bio:
      '我是一名计算机专业大四学生，关注 Web 开发、AI 应用与开发者工具。喜欢从真实需求出发做小产品，把复杂流程拆成简单、可靠的交互。最近在实践用 AI 辅助完成需求分析、编码、排错和部署的完整流程。',
    avatar: '',
    location: '中国',
    email: '3125750848@qq.com',
    github: 'https://github.com/oqun-xp',
    socials: [
      { label: 'GitHub', url: 'https://github.com/oqun-xp' },
      { label: '邮箱', url: 'mailto:3125750848@qq.com' }
    ],
    education: [
      {
        title: '计算机科学与技术 · 本科',
        subtitle: '计算机专业',
        period: '2022 – 2026',
        description:
          '主修 Web 开发、数据结构、计算机网络、数据库与软件工程。课程之外持续做个人项目，覆盖前端、浏览器扩展与服务端开发。'
      }
    ],
    experience: [
      {
        title: '个人项目开发',
        subtitle: '独立开发',
        period: '2025 – 至今',
        description:
          '独立完成 Chrome 电商图片下载插件、网页总结工具与个人作品集网站，负责需求分析、界面设计、编码、排错和部署。'
      },
      {
        title: 'AI 编程实践',
        subtitle: '课程与自学',
        period: '2025 – 2026',
        description:
          '使用 Qoder、Cursor 等 AI 编程工具完成多个课程项目，实践 PRD、技术设计、AGENTS 约束与分步迭代的开发流程。'
      }
    ]
  },
  skills: [
    { id: 'sk-01', category: '前端', name: 'React', level: 88 },
    { id: 'sk-02', category: '前端', name: 'TypeScript', level: 82 },
    { id: 'sk-03', category: '前端', name: 'Tailwind CSS', level: 85 },
    { id: 'sk-04', category: '前端', name: 'HTML / CSS', level: 90 },
    { id: 'sk-05', category: '后端', name: 'Node.js', level: 78 },
    { id: 'sk-06', category: '后端', name: 'Python', level: 80 },
    { id: 'sk-07', category: '后端', name: 'REST API', level: 76 },
    { id: 'sk-08', category: '后端', name: 'Serverless', level: 72 },
    { id: 'sk-09', category: '工具', name: 'Git / GitHub', level: 86 },
    { id: 'sk-10', category: '工具', name: 'Chrome Extension', level: 86 },
    { id: 'sk-11', category: '工具', name: 'Vite', level: 80 },
    { id: 'sk-12', category: '工具', name: 'Vercel', level: 78 },
    { id: 'sk-13', category: '设计', name: 'UI / UX', level: 70 },
    { id: 'sk-14', category: '设计', name: 'Figma', level: 65 }
  ],
  projects: [
    {
      id: 'p-imagegrab',
      title: '图提取 ImageGrab',
      summary: 'Chrome 电商图片提取下载插件，一键提取详情页图片并批量转为 PNG。',
      description: imagegrab,
      cover: 'aurora',
      tags: ['Chrome Extension', 'Manifest V3', 'JavaScript'],
      link: 'https://oqun-xp.github.io/imagegrab/',
      repo: 'https://github.com/oqun-xp/imagegrab',
      featured: true,
      date: '2026-10'
    },
    {
      id: 'p-summarizer',
      title: '网页总结工具 Web Summarizer',
      summary: '输入网址，抓取正文并生成中文摘要的本地网页工具，支持中英文站点。',
      description: summarizer,
      cover: 'ocean',
      tags: ['Node.js', 'AI', '原生 JavaScript'],
      link: '',
      repo: '',
      featured: true,
      date: '2026-10'
    },
    {
      id: 'p-portfolio',
      title: '个人作品集 Panwei Portfolio',
      summary: '深色星空主题的个人网站，带后台管理与 Serverless API，部署在 Vercel。',
      description: portfolio,
      cover: 'starry',
      tags: ['React', 'TypeScript', 'Vercel'],
      link: '',
      repo: 'https://github.com/oqun-xp',
      featured: true,
      date: '2026-10'
    },
    {
      id: 'p-ai-zero',
      title: 'AI 零代码作品集',
      summary: '使用 AI 零代码平台完成的文字水印工具与英文词汇学习卡片。',
      description: aiZero,
      cover: 'violet',
      tags: ['AI 零代码', '产品设计', '提示词'],
      link: '',
      repo: '',
      featured: false,
      date: '2026-10'
    }
  ],
  posts: [
    {
      id: 'b-imagegrab',
      slug: 'build-imagegrab',
      title: '从 0 到 1 开发 Chrome 电商图片下载插件',
      summary: '记录图提取 ImageGrab 的需求拆解、图片提取、过滤策略、跨域 PNG 转换与真实页面测试。',
      content: postImagegrab,
      tags: ['Chrome Extension', '工程实践', 'JavaScript'],
      date: '2026-10-18'
    },
    {
      id: 'b-deploy',
      slug: 'deploy-static-site',
      title: 'GitHub Pages + Vercel：两种免费部署方式实践',
      summary: '对比 GitHub Pages 与 Vercel 的适用场景，记录静态官网和个人作品集的部署流程。',
      content: postDeploy,
      tags: ['部署', 'Vercel', 'GitHub Pages'],
      date: '2026-10-15'
    },
    {
      id: 'b-ai-workflow',
      slug: 'ai-dev-workflow',
      title: '用 AI 辅助开发：我的三步工作流',
      summary: '从 PRD、项目骨架到逐个功能回归，分享一套可复用的 AI 编程流程与提示词写法。',
      content: postAi,
      tags: ['AI', '开发流程', '提示词'],
      date: '2026-10-10'
    }
  ],
  messages: [
    {
      id: 'm-01',
      name: '李同学',
      email: 'li@example.com',
      content: '你好，看到你的图提取插件很实用，想请教一下背景图提取的实现思路。',
      createdAt: '2026-10-17T09:20:00.000Z',
      read: false
    },
    {
      id: 'm-02',
      name: '王老师',
      email: 'wang@example.com',
      content: '作品集的结构很清晰，建议后续补充项目的过程记录和测试截图。',
      createdAt: '2026-10-16T14:05:00.000Z',
      read: true
    }
  ],
  settings: {
    siteTitle: '盘巍 · 个人作品集',
    accent: '#22D3EE',
    footerText: '用代码把想法变成产品。'
  },
  updatedAt: new Date().toISOString()
};

await fs.mkdir(path.join(root, 'data'), { recursive: true });
await fs.writeFile(path.join(root, 'data', 'content.json'), `${JSON.stringify(content, null, 2)}\n`, 'utf8');
console.log('content.json generated');
