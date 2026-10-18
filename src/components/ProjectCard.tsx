import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Github } from 'lucide-react';
import type { Project } from '../types';
import { coverStyle } from '../lib/covers';

export default function ProjectCard({ project }: { project: Project }) {
  const externalLink = project.link || project.repo;

  return (
    <article className="group card-surface flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card">
      <div className="relative h-44 overflow-hidden">
        <div
          className="absolute inset-0 transition duration-500 group-hover:scale-[1.04]"
          style={coverStyle(project.cover)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {project.featured ? (
            <span className="rounded-full border border-white/20 bg-slate-950/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              精选
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-slate-950/45 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-white/70">{project.date}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/projects/${project.id}`} className="group/title">
          <h3 className="text-lg font-semibold text-slate-100 transition group-hover/title:text-[color:var(--accent)]">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{project.summary}</p>
        </Link>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-[color:var(--accent)]"
          >
            查看详情
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-1">
            {project.repo ? (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${project.title} GitHub 仓库`}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100"
              >
                <Github className="h-4 w-4" />
              </a>
            ) : null}
            {externalLink ? (
              <a
                href={externalLink}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`打开 ${project.title}`}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-100"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
