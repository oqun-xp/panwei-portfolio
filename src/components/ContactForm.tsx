import { useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import { api } from '../api/client';
import { contactFormSchema } from '../lib/schemas';
import { useToast } from '../context/ToastContext';

const initialValues = { name: '', email: '', content: '' };

export default function ContactForm() {
  const { pushToast } = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof initialValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] || 'content');
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.sendContact(parsed.data);
      setValues(initialValues);
      pushToast(result.message || '留言已发送', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '发送失败，请稍后重试', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label-base" htmlFor="contact-name">
            姓名
          </label>
          <input
            id="contact-name"
            className="input-base"
            placeholder="怎么称呼你"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="mt-2 text-xs text-rose-300">{errors.name}</p> : null}
        </div>
        <div>
          <label className="label-base" htmlFor="contact-email">
            邮箱
          </label>
          <input
            id="contact-email"
            type="email"
            className="input-base"
            placeholder="you@example.com"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="mt-2 text-xs text-rose-300">{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <label className="label-base" htmlFor="contact-content">
          想说的话
        </label>
        <textarea
          id="contact-content"
          className="input-base min-h-[132px] resize-y"
          placeholder="项目合作、技术交流，或者只是打个招呼…"
          value={values.content}
          onChange={(event) => update('content', event.target.value)}
          aria-invalid={Boolean(errors.content)}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-rose-300">{errors.content || ''}</p>
          <span className="text-xs text-slate-600">{values.content.length}/1000</span>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? '发送中…' : '发送留言'}
      </button>
      <p className="text-center text-xs text-slate-600">留言会保存到后台，仅站主可见。</p>
    </form>
  );
}
