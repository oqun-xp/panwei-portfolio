import { useEffect, useState } from 'react';
import { FolderKanban, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import type { Project } from '../types';
import { coverOptions } from '../lib/covers';
import { formatDate } from '../lib/format';
import AdminPageHeader from './AdminPageHeader';
import FormField from './FormField';
import MarkdownEditor from './MarkdownEditor';
import ConfirmDialog from '../components/ConfirmDialog';

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}`;
}

function emptyProject(): Project {
  return {
    id: uid(),
    title: '',
    summary: '',
    description: '',
    cover: 'aurora',
    tags: [],
    link: '',
    repo: '',
    featured: false,
    date: new Date().toISOString().slice(0, 7)
  };
}

function parseTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function ProjectsAdmin() {
  const { content, save } = useContent();
  const { pushToast } = useToast();
  const [projects, setProjects] = useState<Project[]>(content?.projects || []);
  const [draft, setDraft] = useState<Project | null>(null);
  const [draftTags, setDraftTags] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  useEffect(() => {
    if (content) setProjects(content.projects);
  }, [content]);

  if (!content) return null;

  const startNew = () => {
    setDraft(emptyProject());
    setDraftTags('');
    setEditingId('new');
  };

  const startEdit = (project: Project) => {
    setDraft({ ...project });
    setDraftTags(project.tags.join(', '));
    setEditingId(project.id);
  };

  const closeEditor = () => {
    setDraft(null);
    setDraftTags('');
    setEditingId(null);
  };

  const updateDraft = (key: keyof Project, value: string | boolean | string[]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.title.trim() || !draft.summary.trim()) {
      pushToast('请填写项目标题和摘要', 'error');
      return;
    }

    const nextProject = { ...draft, tags: parseTags(draftTags) };
    const nextProjects =
      editingId === 'new'
        ? [nextProject, ...projects]
        : projects.map((project) => (project.id === nextProject.id ? nextProject : project));

    setSaving(true);
    try {
      await save({ ...content, projects: nextProjects });
      setProjects(nextProjects);
      pushToast(editingId === 'new' ? '项目已创建' : '项目已更新', 'success');
      closeEditor();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const nextProjects = projects.filter((project) => project.id !== pendingDelete.id);
    setSaving(true);
    try {
      await save({ ...content, projects: nextProjects });
      setProjects(nextProjects);
      if (editingId === pendingDelete.id) closeEditor();
      pushToast('项目已删除', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '删除失败', 'error');
    } finally {
      setSaving(false);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="项目管理"
        description="维护作品卡片与详情内容，支持 Markdown 描述和精选标记。"
        actions={
          <button type="button" className="btn btn-primary !px-4 !py-2 text-xs" onClick={startNew}>
            <Plus className="h-3.5 w-3.5" />
            新建项目
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="admin-card h-fit">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-100">项目列表</h2>
            <span className="chip">{projects.length} 个</span>
          </div>
          <div className="mt-4 space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`rounded-xl border p-3 transition ${
                  editingId === project.id
                    ? 'border-[color:var(--accent-line)] bg-[color:var(--accent-soft)]'
                    : 'border-white/10 bg-slate-950/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(project)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="truncate text-sm font-medium text-slate-200">
                        {project.title || '未命名项目'}
                      </span>
                      {project.featured ? (
                        <span className="shrink-0 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
                          精选
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-600">
                      {project.date ? formatDate(project.date) : '未设置日期'}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
                      aria-label="编辑项目"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(project)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-200"
                      aria-label="删除项目"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!projects.length ? (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">
                还没有项目。
              </p>
            ) : null}
          </div>
        </section>

        <section className="admin-card">
          {draft ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-100">
                  {editingId === 'new' ? '新建项目' : '编辑项目'}
                </h2>
                <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={closeEditor}>
                  <X className="h-3.5 w-3.5" />
                  取消
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="项目标题">
                  <input
                    className="input-base"
                    value={draft.title}
                    onChange={(event) => updateDraft('title', event.target.value)}
                    placeholder="例如：图提取 ImageGrab"
                  />
                </FormField>
                <FormField label="日期">
                  <input
                    type="month"
                    className="input-base"
                    value={draft.date}
                    onChange={(event) => updateDraft('date', event.target.value)}
                  />
                </FormField>
                <FormField label="摘要" className="sm:col-span-2">
                  <input
                    className="input-base"
                    value={draft.summary}
                    onChange={(event) => updateDraft('summary', event.target.value)}
                    placeholder="一句话说明项目做了什么"
                  />
                </FormField>
                <FormField label="技术标签" hint="用逗号分隔，最多 12 个">
                  <input
                    className="input-base"
                    value={draftTags}
                    onChange={(event) => setDraftTags(event.target.value)}
                    placeholder="React, TypeScript, Vercel"
                  />
                </FormField>
                <FormField label="封面">
                  <select
                    className="input-base"
                    value={draft.cover}
                    onChange={(event) => updateDraft('cover', event.target.value)}
                  >
                    {coverOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="在线地址">
                  <input
                    className="input-base"
                    value={draft.link}
                    onChange={(event) => updateDraft('link', event.target.value)}
                    placeholder="https://..."
                  />
                </FormField>
                <FormField label="仓库地址">
                  <input
                    className="input-base"
                    value={draft.repo}
                    onChange={(event) => updateDraft('repo', event.target.value)}
                    placeholder="https://github.com/..."
                  />
                </FormField>
                <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(event) => updateDraft('featured', event.target.checked)}
                    className="h-4 w-4 accent-[color:var(--accent)]"
                  />
                  在首页「精选项目」中展示
                </label>
              </div>

              <MarkdownEditor
                value={draft.description}
                onChange={(value) => updateDraft('description', value)}
                label="项目详情（Markdown）"
                minHeight={320}
              />

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
                <button type="button" className="btn btn-ghost !px-4 !py-2 text-xs" onClick={closeEditor}>
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn-primary !px-4 !py-2 text-xs"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {saving ? '保存中…' : '保存项目'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
              <FolderKanban className="h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">从左侧选择一个项目进行编辑，或新建项目。</p>
              <button type="button" className="btn btn-ghost !px-4 !py-2 text-xs" onClick={startNew}>
                <Plus className="h-3.5 w-3.5" />
                新建项目
              </button>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="删除这个项目？"
        description={`「${pendingDelete?.title || '未命名项目'}」将从项目和首页中移除，该操作不可撤销。`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
