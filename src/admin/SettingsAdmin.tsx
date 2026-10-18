import { useEffect, useState } from 'react';
import { Loader2, Palette, Save, ShieldCheck } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import type { Settings } from '../types';
import AdminPageHeader from './AdminPageHeader';
import FormField from './FormField';

export default function SettingsAdmin() {
  const { content, save } = useContent();
  const { pushToast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(content?.settings || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) setSettings(content.settings);
  }, [content]);

  if (!content || !settings) return null;

  const update = (key: keyof Settings, value: string) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    if (!settings.siteTitle.trim()) {
      pushToast('站点标题不能为空', 'error');
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(settings.accent)) {
      pushToast('强调色必须是 #RRGGBB 格式', 'error');
      return;
    }

    setSaving(true);
    try {
      await save({ ...content, settings });
      pushToast('站点设置已保存', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="站点设置"
        description="调整站点标题、主题强调色与页脚文案。"
        actions={
          <button
            type="button"
            className="btn btn-primary !px-4 !py-2 text-xs"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? '保存中…' : '保存设置'}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="admin-card space-y-5">
          <h2 className="text-base font-semibold text-slate-100">基础设置</h2>

          <FormField label="站点标题" hint="显示在浏览器标签页和页脚">
            <input
              className="input-base"
              value={settings.siteTitle}
              onChange={(event) => update('siteTitle', event.target.value)}
              placeholder="盘巍 · 个人作品集"
            />
          </FormField>

          <FormField label="主题强调色" hint="用于按钮、链接、进度条和星空点缀">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="color"
                value={settings.accent}
                onChange={(event) => update('accent', event.target.value)}
                className="h-11 w-16 cursor-pointer rounded-xl border border-white/10 bg-slate-950/50 p-1"
                aria-label="选择强调色"
              />
              <input
                className="input-base flex-1 font-mono"
                value={settings.accent}
                onChange={(event) => update('accent', event.target.value)}
                placeholder="#22D3EE"
              />
              <span
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-slate-950"
                style={{ background: settings.accent }}
              >
                <Palette className="h-4 w-4" />
                预览
              </span>
            </div>
          </FormField>

          <FormField label="页脚文案">
            <textarea
              className="input-base min-h-[88px] resize-y"
              value={settings.footerText}
              onChange={(event) => update('footerText', event.target.value)}
              placeholder="用代码把想法变成产品。"
            />
          </FormField>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs leading-6 text-amber-100/80">
            <p className="flex items-center gap-2 font-semibold text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              安全提示
            </p>
            <p className="mt-1.5">
              管理员账号、密码、AUTH_SECRET 与 GitHub token 都存放在 Vercel 环境变量中，不能在本页面修改。
              如需更换密码，请在 Vercel 项目 Settings → Environment Variables 更新
              <code className="mx-1 rounded bg-black/20 px-1.5 py-0.5">ADMIN_PASSWORD</code>
              后重新部署。
            </p>
          </div>
        </section>

        <section className="admin-card h-fit">
          <h2 className="text-base font-semibold text-slate-100">效果预览</h2>
          <p className="mt-0.5 text-xs text-slate-500">保存后前台会使用新的主题色。</p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <div className="bg-slate-950/60 p-5">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg text-[10px] font-black text-slate-950"
                  style={{ background: `linear-gradient(135deg, ${settings.accent}, #8b5cf6)` }}
                >
                  PW
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{settings.siteTitle}</p>
                  <p className="text-[10px] text-slate-600">Personal Portfolio</p>
                </div>
              </div>
              <p className="mt-5 text-lg font-bold text-slate-100">
                你好，我是
                <span style={{ color: settings.accent }}>{content.profile.name}</span>
              </p>
              <div className="mt-4 flex gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-[10px] font-semibold text-slate-950"
                  style={{ background: settings.accent }}
                >
                  查看项目
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-slate-300">
                  联系我
                </span>
              </div>
            </div>
            <div className="border-t border-white/10 bg-slate-950/30 p-4 text-[10px] text-slate-500">
              {settings.footerText || '页脚文案'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
