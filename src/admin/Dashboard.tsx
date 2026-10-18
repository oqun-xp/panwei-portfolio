import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FolderKanban,
  Mail,
  Newspaper,
  Settings,
  UserRound,
  Wrench
} from 'lucide-react';
import { api } from '../api/client';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import type { Message } from '../types';
import { formatDateTime } from '../lib/format';

const quickActions = [
  { to: '/admin/profile', label: '编辑个人信息', icon: UserRound },
  { to: '/admin/projects', label: '管理项目', icon: FolderKanban },
  { to: '/admin/posts', label: '写一篇文章', icon: Newspaper },
  { to: '/admin/settings', label: '站点设置', icon: Settings }
];

export default function Dashboard() {
  const { content } = useContent();
  const { pushToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .getMessages()
      .then((result) => {
        if (!cancelled) setMessages(result.messages);
      })
      .catch((error) => {
        if (!cancelled) pushToast(error instanceof Error ? error.message : '留言加载失败', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  if (!content) return null;

  const unread = messages.filter((message) => !message.read).length;
  const stats = [
    {
      label: '项目',
      value: content.projects.length,
      detail: `${content.projects.filter((project) => project.featured).length} 个精选`,
      icon: FolderKanban,
      color: 'text-cyan-300 bg-cyan-400/10'
    },
    {
      label: '文章',
      value: content.posts.length,
      detail: '持续更新中',
      icon: Newspaper,
      color: 'text-violet-300 bg-violet-400/10'
    },
    {
      label: '技能',
      value: content.skills.length,
      detail: `${new Set(content.skills.map((skill) => skill.category)).size} 个分类`,
      icon: Wrench,
      color: 'text-emerald-300 bg-emerald-400/10'
    },
    {
      label: '未读留言',
      value: unread,
      detail: `共 ${messages.length} 条`,
      icon: Mail,
      color: 'text-amber-300 bg-amber-400/10'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          你好，{content.profile.name}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          这里可以快速了解站点内容，并进入对应的管理页面。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-slate-100">{stat.value}</p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="admin-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">最近留言</h2>
              <p className="mt-0.5 text-xs text-slate-500">来自联系表单的最新消息</p>
            </div>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-[color:var(--accent)]"
            >
              全部留言
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {messages.slice(0, 3).map((message) => (
              <div
                key={message.id}
                className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{message.name}</span>
                    {!message.read ? (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        未读
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-slate-600">
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                  {message.content}
                </p>
              </div>
            ))}
            {!messages.length ? (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">
                暂时还没有留言。
              </p>
            ) : null}
          </div>
        </section>

        <section className="admin-card">
          <h2 className="text-base font-semibold text-slate-100">快捷操作</h2>
          <p className="mt-0.5 text-xs text-slate-500">常用入口</p>
          <div className="mt-5 grid gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                </Link>
              );
            })}
          </div>

          <p className="mt-5 border-t border-white/10 pt-4 text-[11px] text-slate-600">
            内容最后更新：{formatDateTime(content.updatedAt)}
          </p>
        </section>
      </div>
    </div>
  );
}
