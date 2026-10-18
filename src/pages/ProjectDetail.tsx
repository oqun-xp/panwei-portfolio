import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Calendar, Github } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import Markdown from '../components/Markdown';
import { coverStyle } from '../lib/covers';
import { formatDate } from '../lib/format';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { content } = useContent();
  const project = content?.projects.find((item) => item.id === id);

  if (!project) return <NotFound />;

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="container-page">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <div className="relative min-h-[260px] p-7 sm:p-10" style={coverStyle(project.cover)}>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
            <div className="relative flex h-full flex-col justify-end gap-4 pt-20">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-slate-950/40 px-3 py-1 text-[11px] font-medium text-white backdrop-blur"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {project.title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {project.summary}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          <article className="card-surface p-6 sm:p-8">
            <Markdown content={project.description} />
          </article>

          <aside className="space-y-4">
            <div className="card-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                项目信息
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">时间</dt>
                  <dd className="inline-flex items-center gap-1.5 text-slate-300">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(project.date)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">类型</dt>
                  <dd className="text-slate-300">个人项目</dd>
                </div>
              </dl>
            </div>

            {project.link || project.repo ? (
              <div className="card-surface space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  相关链接
                </p>
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    在线访问
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
                {project.repo ? (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
