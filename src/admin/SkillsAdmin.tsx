import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import type { Skill } from '../types';
import AdminPageHeader from './AdminPageHeader';
import ConfirmDialog from '../components/ConfirmDialog';

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `skill-${Date.now()}`;
}

export default function SkillsAdmin() {
  const { content, save } = useContent();
  const { pushToast } = useToast();
  const [skills, setSkills] = useState<Skill[]>(content?.skills || []);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (content) setSkills(content.skills);
  }, [content]);

  if (!content) return null;

  const categories = Array.from(new Set(skills.map((skill) => skill.category))).filter(Boolean);

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setSkills((current) =>
      current.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill))
    );
  };

  const addSkill = () => {
    setSkills((current) => [
      { id: uid(), category: categories[0] || '前端', name: '', level: 70 },
      ...current
    ]);
  };

  const removeSkill = () => {
    if (!pendingDelete) return;
    setSkills((current) => current.filter((skill) => skill.id !== pendingDelete));
    setPendingDelete(null);
    pushToast('已从草稿中移除，点击保存后生效', 'info');
  };

  const handleSave = async () => {
    if (skills.some((skill) => !skill.name.trim() || !skill.category.trim())) {
      pushToast('技能名称和分类不能为空', 'error');
      return;
    }
    setSaving(true);
    try {
      await save({ ...content, skills });
      pushToast('技能已保存，前台进度条已同步', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="技能管理"
        description="按分类维护技能与熟练度。熟练度用于前台的进度条展示。"
        actions={
          <>
            <button type="button" className="btn btn-ghost !px-4 !py-2 text-xs" onClick={addSkill}>
              <Plus className="h-3.5 w-3.5" />
              添加技能
            </button>
            <button
              type="button"
              className="btn btn-primary !px-4 !py-2 text-xs"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? '保存中…' : '保存修改'}
            </button>
          </>
        }
      />

      <div className="admin-card">
        <div className="hidden grid-cols-[1fr_1.2fr_1.5fr_auto] gap-3 border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 md:grid">
          <span>分类</span>
          <span>技能名称</span>
          <span>熟练度</span>
          <span>操作</span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="grid gap-3 py-4 md:grid-cols-[1fr_1.2fr_1.5fr_auto] md:items-center"
            >
              <input
                className="input-base"
                value={skill.category}
                onChange={(event) => updateSkill(skill.id, 'category', event.target.value)}
                list="skill-categories"
                aria-label="技能分类"
                placeholder="分类"
              />
              <input
                className="input-base"
                value={skill.name}
                onChange={(event) => updateSkill(skill.id, 'name', event.target.value)}
                aria-label="技能名称"
                placeholder="技能名称"
              />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={skill.level}
                  onChange={(event) => updateSkill(skill.id, 'level', Number(event.target.value))}
                  className="h-1.5 flex-1 cursor-pointer accent-[color:var(--accent)]"
                  aria-label={`${skill.name || '技能'}熟练度`}
                />
                <span className="w-10 text-right text-xs tabular-nums text-slate-400">
                  {skill.level}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPendingDelete(skill.id)}
                className="inline-flex items-center gap-1.5 justify-self-start rounded-lg border border-white/10 px-3 py-2 text-xs text-rose-300/80 transition hover:border-rose-400/30 hover:text-rose-200 md:justify-self-end"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            </div>
          ))}
        </div>

        {!skills.length ? (
          <p className="py-12 text-center text-sm text-slate-600">还没有技能，点击右上角添加。</p>
        ) : null}

        <datalist id="skill-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="删除这项技能？"
        description="删除后需要点击「保存修改」才会同步到前台；保存前仍可通过重置恢复。"
        onCancel={() => setPendingDelete(null)}
        onConfirm={removeSkill}
      />
    </div>
  );
}
