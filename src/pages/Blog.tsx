import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { formatDate, readingTime, sortByDateDesc } from '../lib/format';

export default function Blog() {
  const { content } = useContent();
  const [activeTag, setActiveTag] = useState('全部');

  const posts = useMemo(() => sortByDateDesc(content?.posts || []), [content]);
  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 10),
    [posts]
  );
  const filtered = useMemo(
    () => (activeTag === '全部' ? posts : posts.filter((post) => post.tags.includes(activeTag))),
    [posts, activeTag]
  );

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="container-page">
        <SectionHeading
          align="left"
          eyebrow="博客"
          title="把过程写下来"
          description="记录项目实践、技术选型、踩坑与复盘，也记录一些关于开发方式的思考。"
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
          <div className="mt-10 space-y-4">
            {filtered.map((post, index) => (
              <Reveal key={post.id} delay={Math.min(index, 5) * 60}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group card-surface flex flex-col gap-4 p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.date)}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {readingTime(post.content)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-slate-100 transition group-hover:text-[color:var(--accent)]">
                      {post.title}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{post.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-slate-500 transition group-hover:border-[color:var(--accent-line)] group-hover:text-[color:var(--accent)]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="card-surface mt-10 p-14 text-center text-sm text-slate-400">
            这个标签下还没有文章。
          </div>
        )}
      </div>
    </div>
  );
}
