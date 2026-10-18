import { useEffect, useState } from 'react';
import { Loader2, Newspaper, Pencil, Plus, Save, Trash2, Wand2, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import type { Post } from '../types';
import { coverOptions } from '../lib/covers';
import { formatDate, sortByDateDesc } from '../lib/format';
import AdminPageHeader from './AdminPageHeader';
import FormField from './FormField';
import MarkdownEditor from './MarkdownEditor';
import ConfirmDialog from '../components/ConfirmDialog';

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `post-${Date.now()}`;
}

function emptyPost(): Post {
  return {
    id: uid(),
    slug: '',
    title: '',
    summary: '',
    content: '',
    tags: [],
    date: new Date().toISOString().slice(0, 10),
    cover: 'starry'
  };
}

function parseTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function PostsAdmin() {
  const { content, save } = useContent();
  const { pushToast } = useToast();
  const [posts, setPosts] = useState<Post[]>(content?.posts || []);
  const [draft, setDraft] = useState<Post | null>(null);
  const [draftTags, setDraftTags] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);

  useEffect(() => {
    if (content) setPosts(content.posts);
  }, [content]);

  if (!content) return null;

  const sortedPosts = sortByDateDesc(posts);

  const startNew = () => {
    setDraft(emptyPost());
    setDraftTags('');
    setEditingId('new');
  };

  const startEdit = (post: Post) => {
    setDraft({ ...post });
    setDraftTags(post.tags.join(', '));
    setEditingId(post.id);
  };

  const closeEditor = () => {
    setDraft(null);
    setDraftTags('');
    setEditingId(null);
  };

  const updateDraft = (key: keyof Post, value: string) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const suggestSlug = () => {
    if (!draft) return;
    const base = draft.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    updateDraft('slug', base || `post-${Date.now()}`);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.title.trim() || !draft.summary.trim() || !draft.content.trim()) {
      pushToast('请填写标题、摘要和正文', 'error');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(draft.slug)) {
      pushToast('slug 只能包含小写字母、数字和连字符', 'error');
      return;
    }
    if (
      posts.some((post) => post.slug === draft.slug && post.id !== draft.id)
    ) {
      pushToast('这个 slug 已经被其他文章使用', 'error');
      return;
    }

    const nextPost = { ...draft, tags: parseTags(draftTags) };
    const nextPosts =
      editingId === 'new'
        ? [nextPost, ...posts]
        : posts.map((post) => (post.id === nextPost.id ? nextPost : post));

    setSaving(true);
    try {
      await save({ ...content, posts: nextPosts });
      setPosts(nextPosts);
      pushToast(editingId === 'new' ? '文章已发布' : '文章已更新', 'success');
      closeEditor();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const nextPosts = posts.filter((post) => post.id !== pendingDelete.id);
    setSaving(true);
    try {
      await save({ ...content, posts: nextPosts });
      setPosts(nextPosts);
      if (editingId === pendingDelete.id) closeEditor();
      pushToast('文章已删除', 'success');
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
        title="博客管理"
        description="用 Markdown 编写文章，支持实时预览、标签、日期和封面。"
        actions={
          <button type="button" className="btn btn-primary !px-4 !py-2 text-xs" onClick={startNew}>
            <Plus className="h-3.5 w-3.5" />
            新建文章
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="admin-card h-fit">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-100">文章列表</h2>
            <span className="chip">{posts.length} 篇</span>
          </div>
          <div className="mt-4 space-y-2">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className={`rounded-xl border p-3 transition ${
                  editingId === post.id
                    ? 'border-[color:var(--accent-line)] bg-[color:var(--accent-soft)]'
                    : 'border-white/10 bg-slate-950/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="truncate text-sm font-medium text-slate-200">
                        {post.title || '未命名文章'}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-slate-600">
                      {formatDate(post.date)} · /{post.slug}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
                      aria-label="编辑文章"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(post)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-200"
                      aria-label="删除文章"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!posts.length ? (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">
                还没有文章。
              </p>
            ) : null}
          </div>
        </section>

        <section className="admin-card">
          {draft ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-100">
                  {editingId === 'new' ? '新建文章' : '编辑文章'}
                </h2>
                <button type="button" className="btn btn-ghost !px-3 !py-1.5 text-xs" onClick={closeEditor}>
                  <X className="h-3.5 w-3.5" />
                  取消
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="标题" className="sm:col-span-2">
                  <input
                    className="input-base"
                    value={draft.title}
                    onChange={(event) => updateDraft('title', event.target.value)}
                    placeholder="文章标题"
                  />
                </FormField>
                <FormField
                  label="Slug"
                  hint="用于 URL，只能包含小写字母、数字和连字符"
                >
                  <div className="flex gap-2">
                    <input
                      className="input-base flex-1"
                      value={draft.slug}
                      onChange={(event) => updateDraft('slug', event.target.value)}
                      placeholder="build-imagegrab"
                    />
                    <button
                      type="button"
                      onClick={suggestSlug}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      aria-label="根据标题生成 slug"
                      title="根据标题生成 slug"
                    >
                      <Wand2 className="h-4 w-4" />
                    </button>
                  </div>
                </FormField>
                <FormField label="日期">
                  <input
                    type="date"
                    className="input-base"
                    value={draft.date}
                    onChange={(event) => updateDraft('date', event.target.value)}
                  />
                </FormField>
                <FormField label="摘要" className="sm:col-span-2">
                  <textarea
                    className="input-base min-h-[72px] resize-y"
                    value={draft.summary}
                    onChange={(event) => updateDraft('summary', event.target.value)}
                    placeholder="列表页展示的摘要"
                  />
                </FormField>
                <FormField label="标签" hint="用逗号分隔">
                  <input
                    className="input-base"
                    value={draftTags}
                    onChange={(event) => setDraftTags(event.target.value)}
                    placeholder="React, 工程实践"
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
              </div>

              <MarkdownEditor
                value={draft.content}
                onChange={(value) => updateDraft('content', value)}
                label="正文（Markdown）"
                minHeight={420}
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
                  {saving ? '保存中…' : '保存文章'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
              <Newspaper className="h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">从左侧选择一篇文章进行编辑，或新建文章。</p>
              <button type="button" className="btn btn-ghost !px-4 !py-2 text-xs" onClick={startNew}>
                <Plus className="h-3.5 w-3.5" />
                新建文章
              </button>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="删除这篇文章？"
        description={`「${pendingDelete?.title || '未命名文章'}」将从博客列表和首页移除，该操作不可撤销。`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
