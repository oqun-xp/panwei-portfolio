import { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import ProjectCard from '../components/ProjectCard';
import { sortByDateDesc } from '../lib/format';

export default function Projects() {
  const { content } = useContent();
  const [activeTag, setActiveTag] = useState('全部');

  const projects = useMemo(() => sortByDateDesc(content?.projects || []), [content]);
  const tags = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.tags))).slice(0, 10),
    [projects]
  );
  const filtered = useMemo(
    () =>
      activeTag === '全部'
        ? projects
        : projects.filter((project) => project.tags.includes(activeTag)),
    [projects, activeTag]
  );

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="container-page">
        <SectionHeading
          align="left"
          eyebrow="项目"
          title="做过的项目与作品"
          description="从需求、设计到开发和部署，尽量把每个项目完整地走一遍。"
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {['全部', ...tags].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                activeTag === tag
                  ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project, index) => (
              <Reveal key={project.id} delay={Math.min(index, 5) * 70}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="card-surface mt-10 flex flex-col items-center gap-3 p-14 text-center">
            <Layers className="h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">这个标签下还没有项目。</p>
          </div>
        )}
      </div>
    </div>
  );
}
