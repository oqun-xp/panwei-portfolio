import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import type { Profile, TimelineItem } from '../types';
import AdminPageHeader from './AdminPageHeader';
import FormField from './FormField';

interface TimelineEditorProps {
  title: string;
  items: TimelineItem[];
  onChange: (index: number, field: keyof TimelineItem, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

function TimelineEditor({ title, items, onChange, onAdd, onRemove }: TimelineEditorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          添加
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">条目 {index + 1}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex items-center gap-1 text-xs text-rose-300/80 transition hover:text-rose-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="标题">
                <input
                  className="input-base"
                  value={item.title}
                  onChange={(event) => onChange(index, 'title', event.target.value)}
                  placeholder="学校 / 公司 / 项目"
                />
              </FormField>
              <FormField label="副标题">
                <input
                  className="input-base"
                  value={item.subtitle}
                  onChange={(event) => onChange(index, 'subtitle', event.target.value)}
                  placeholder="专业 / 职位"
                />
              </FormField>
              <FormField label="时间">
                <input
                  className="input-base"
                  value={item.period}
                  onChange={(event) => onChange(index, 'period', event.target.value)}
                  placeholder="2022 – 2026"
                />
              </FormField>
              <FormField label="描述" className="sm:col-span-2">
                <textarea
                  className="input-base min-h-[88px] resize-y"
                  value={item.description}
                  onChange={(event) => onChange(index, 'description', event.target.value)}
                  placeholder="一句话说明这段经历"
                />
              </FormField>
            </div>
          </div>
        ))}
        {!items.length ? (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-600">
            还没有条目，点击右上角添加。
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function ProfileAdmin() {
  const { content, save } = useContent();
  const { pushToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(content?.profile || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) setProfile(content.profile);
  }, [content]);

  if (!content || !profile) return null;

  const update = (key: keyof Profile, value: string) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateSocial = (index: number, key: 'label' | 'url', value: string) => {
    setProfile((current) =>
      current
        ? {
            ...current,
            socials: current.socials.map((social, socialIndex) =>
              socialIndex === index ? { ...social, [key]: value } : social
            )
          }
        : current
    );
  };

  const updateEducation = (index: number, field: keyof TimelineItem, value: string) => {
    setProfile((current) =>
      current
        ? {
            ...current,
            education: current.education.map((item, itemIndex) =>
              itemIndex === index ? { ...item, [field]: value } : item
            )
          }
        : current
    );
  };

  const updateExperience = (index: number, field: keyof TimelineItem, value: string) => {
    setProfile((current) =>
      current
        ? {
            ...current,
            experience: current.experience.map((item, itemIndex) =>
              itemIndex === index ? { ...item, [field]: value } : item
            )
          }
        : current
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.role.trim() || !profile.tagline.trim() || !profile.bio.trim()) {
      pushToast('请填写姓名、身份、标语和个人简介', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      pushToast('邮箱格式不正确', 'error');
      return;
    }

    setSaving(true);
    try {
      await save({ ...content, profile });
      pushToast('个人信息已保存，前台已同步更新', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存失败，请稍后重试', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(content.profile);
    pushToast('已恢复为上次保存的内容', 'info');
  };

  return (
    <form onSubmit={handleSave}>
      <AdminPageHeader
        title="个人信息"
        description="修改头像、简介、社交链接、教育与经历，保存后前台立即生效。"
        actions={
          <>
            <button type="button" className="btn btn-ghost !px-4 !py-2 text-xs" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              重置
            </button>
            <button type="submit" className="btn btn-primary !px-4 !py-2 text-xs" disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? '保存中…' : '保存修改'}
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="admin-card space-y-4">
          <h2 className="text-base font-semibold text-slate-100">基础信息</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="姓名">
              <input
                className="input-base"
                value={profile.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="你的名字"
              />
            </FormField>
            <FormField label="身份 / 职位">
              <input
                className="input-base"
                value={profile.role}
                onChange={(event) => update('role', event.target.value)}
                placeholder="计算机专业 · 大四学生"
              />
            </FormField>
            <FormField label="一句话标语" className="sm:col-span-2">
              <input
                className="input-base"
                value={profile.tagline}
                onChange={(event) => update('tagline', event.target.value)}
                placeholder="用代码把想法变成可用的产品。"
              />
            </FormField>
            <FormField label="个人简介" className="sm:col-span-2">
              <textarea
                className="input-base min-h-[120px] resize-y"
                value={profile.bio}
                onChange={(event) => update('bio', event.target.value)}
                placeholder="介绍一下你自己"
              />
            </FormField>
            <FormField label="头像 URL" hint="留空则显示姓名首字母">
              <input
                className="input-base"
                value={profile.avatar}
                onChange={(event) => update('avatar', event.target.value)}
                placeholder="https://..."
              />
            </FormField>
            <FormField label="所在地">
              <input
                className="input-base"
                value={profile.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="中国"
              />
            </FormField>
            <FormField label="邮箱">
              <input
                className="input-base"
                type="email"
                value={profile.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="you@example.com"
              />
            </FormField>
            <FormField label="GitHub">
              <input
                className="input-base"
                value={profile.github}
                onChange={(event) => update('github', event.target.value)}
                placeholder="https://github.com/..."
              />
            </FormField>
          </div>
        </section>

        <section className="admin-card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-100">社交链接</h2>
            <button
              type="button"
              className="btn btn-ghost !px-3 !py-1.5 text-xs"
              onClick={() =>
                setProfile((current) =>
                  current
                    ? { ...current, socials: [...current.socials, { label: '新链接', url: '' }] }
                    : current
                )
              }
            >
              <Plus className="h-3.5 w-3.5" />
              添加
            </button>
          </div>
          <div className="space-y-3">
            {profile.socials.map((social, index) => (
              <div key={`${social.label}-${index}`} className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="input-base sm:w-32"
                  value={social.label}
                  onChange={(event) => updateSocial(index, 'label', event.target.value)}
                  placeholder="名称"
                  aria-label={`社交链接 ${index + 1} 名称`}
                />
                <input
                  className="input-base flex-1"
                  value={social.url}
                  onChange={(event) => updateSocial(index, 'url', event.target.value)}
                  placeholder="https://..."
                  aria-label={`社交链接 ${index + 1} 地址`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setProfile((current) =>
                      current
                        ? { ...current, socials: current.socials.filter((_, i) => i !== index) }
                        : current
                    )
                  }
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-rose-300/80 transition hover:border-rose-400/30 hover:text-rose-200"
                  aria-label="删除社交链接"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!profile.socials.length ? (
              <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-600">
                还没有社交链接。
              </p>
            ) : null}
          </div>
        </section>

        <TimelineEditor
          title="教育背景"
          items={profile.education}
          onChange={updateEducation}
          onAdd={() =>
            setProfile((current) =>
              current
                ? {
                    ...current,
                    education: [
                      ...current.education,
                      { title: '', subtitle: '', period: '', description: '' }
                    ]
                  }
                : current
            )
          }
          onRemove={(index) =>
            setProfile((current) =>
              current
                ? { ...current, education: current.education.filter((_, i) => i !== index) }
                : current
            )
          }
        />

        <TimelineEditor
          title="实践经历"
          items={profile.experience}
          onChange={updateExperience}
          onAdd={() =>
            setProfile((current) =>
              current
                ? {
                    ...current,
                    experience: [
                      ...current.experience,
                      { title: '', subtitle: '', period: '', description: '' }
                    ]
                  }
                : current
            )
          }
          onRemove={(index) =>
            setProfile((current) =>
              current
                ? { ...current, experience: current.experience.filter((_, i) => i !== index) }
                : current
            )
          }
        />
      </div>
    </form>
  );
}
