import { z } from 'zod';

const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(20000);
const urlOrEmpty = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || /^https?:\/\//i.test(value), '链接必须以 http:// 或 https:// 开头');

const socialUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => !value || /^(https?:\/\/|mailto:)/i.test(value),
    '链接必须以 http(s):// 或 mailto: 开头'
  );

const timelineSchema = z.object({
  title: shortText.min(1),
  subtitle: z.string().trim().max(120).default(''),
  period: z.string().trim().max(60).default(''),
  description: z.string().trim().max(1000).default('')
});

const socialSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: socialUrl.refine((value) => Boolean(value), '社交链接不能为空')
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(40),
  role: z.string().trim().min(1).max(80),
  tagline: z.string().trim().min(1).max(160),
  bio: z.string().trim().min(1).max(3000),
  avatar: urlOrEmpty.default(''),
  location: z.string().trim().max(80).default(''),
  email: z.string().trim().email('邮箱格式不正确').max(120),
  github: urlOrEmpty.default(''),
  socials: z.array(socialSchema).max(12).default([]),
  education: z.array(timelineSchema).max(12).default([]),
  experience: z.array(timelineSchema).max(12).default([])
});

const skillSchema = z.object({
  id: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(60),
  level: z.number().min(0).max(100)
});

const projectSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(100),
  summary: z.string().trim().min(1).max(300),
  description: longText.default(''),
  cover: z.string().trim().max(500).default('aurora'),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  link: urlOrEmpty.default(''),
  repo: urlOrEmpty.default(''),
  featured: z.boolean().default(false),
  date: z.string().trim().max(20).default('')
});

const postSchema = z.object({
  id: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符'),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(300),
  content: longText.default(''),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  date: z.string().trim().max(20).default(''),
  cover: z.string().trim().max(500).default('')
});

const settingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(80),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, '强调色必须是 #RRGGBB 格式'),
  footerText: z.string().trim().max(200).default('')
});

export const contentSchema = z.object({
  profile: profileSchema,
  skills: z.array(skillSchema).max(200),
  projects: z.array(projectSchema).max(100),
  posts: z.array(postSchema).max(100),
  settings: settingsSchema
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, '请填写姓名').max(50),
  email: z.string().trim().email('邮箱格式不正确').max(120),
  content: z.string().trim().min(5, '请至少写 5 个字').max(1000)
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200)
});

export const messagePatchSchema = z.object({
  id: z.string().trim().min(1).max(80),
  read: z.boolean()
});
