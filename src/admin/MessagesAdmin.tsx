import { useCallback, useEffect, useState } from 'react';
import { CheckCheck, Loader2, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import type { Message } from '../types';
import { formatDateTime } from '../lib/format';
import AdminPageHeader from './AdminPageHeader';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MessagesAdmin() {
  const { pushToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getMessages();
      setMessages(result.messages);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '留言加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (message: Message) => {
    try {
      const result = await api.updateMessage(message.id, !message.read);
      setMessages(result.messages);
      pushToast(message.read ? '已标记为未读' : '已标记为已读', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '操作失败', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      const result = await api.deleteMessage(pendingDelete.id);
      setMessages(result.messages);
      pushToast('留言已删除', 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : '删除失败', 'error');
    } finally {
      setPendingDelete(null);
    }
  };

  const unread = messages.filter((message) => !message.read).length;
  const filtered = filter === 'unread' ? messages.filter((message) => !message.read) : messages;

  return (
    <div>
      <AdminPageHeader
        title="留言管理"
        description="查看访客通过联系表单提交的消息，可以标记已读或直接回复邮件。"
        actions={
          <div className="flex rounded-xl border border-white/10 bg-slate-950/50 p-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                filter === 'all' ? 'bg-white/10 text-slate-100' : 'text-slate-500'
              }`}
            >
              全部 {messages.length}
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                filter === 'unread' ? 'bg-white/10 text-slate-100' : 'text-slate-500'
              }`}
            >
              未读 {unread}
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="admin-card flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载留言…
        </div>
      ) : filtered.length ? (
        <div className="space-y-3">
          {filtered.map((message) => (
            <article
              key={message.id}
              className={`admin-card transition ${
                message.read ? '' : 'border-[color:var(--accent-line)]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      message.read
                        ? 'bg-white/[0.05] text-slate-500'
                        : 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                    }`}
                  >
                    {message.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-200">{message.name}</h2>
                      {!message.read ? (
                        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                          未读
                        </span>
                      ) : null}
                    </div>
                    <a
                      href={`mailto:${message.email}`}
                      className="mt-0.5 block text-xs text-slate-500 hover:text-[color:var(--accent)]"
                    >
                      {message.email}
                    </a>
                  </div>
                </div>
                <span className="text-[11px] text-slate-600">{formatDateTime(message.createdAt)}</span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {message.content}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <a
                  href={`mailto:${message.email}`}
                  className="btn btn-ghost !px-3 !py-1.5 text-xs"
                >
                  <Reply className="h-3.5 w-3.5" />
                  邮件回复
                </a>
                <button
                  type="button"
                  onClick={() => handleToggle(message)}
                  className="btn btn-ghost !px-3 !py-1.5 text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {message.read ? '标记未读' : '标记已读'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(message)}
                  className="btn !border !border-rose-400/20 !bg-rose-500/10 !px-3 !py-1.5 text-xs text-rose-200 hover:!bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-card flex flex-col items-center gap-3 py-16 text-center">
          <Mail className="h-9 w-9 text-slate-700" />
          <p className="text-sm text-slate-500">
            {filter === 'unread' ? '没有未读留言。' : '还没有收到留言。'}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="删除这条留言？"
        description={`来自 ${pendingDelete?.name || '访客'} 的留言将被永久删除。`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
