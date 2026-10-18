import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, '请填写姓名').max(50, '姓名太长了'),
  email: z.string().trim().email('请输入正确的邮箱').max(120),
  content: z.string().trim().min(5, '请至少写 5 个字').max(1000, '内容不能超过 1000 字')
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
