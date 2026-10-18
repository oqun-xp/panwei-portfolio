import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import Markdown from '../components/Markdown';
import { extractToc, formatDate, readingTime } from '../lib/format';
import NotFound from './NotFound';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useContent();
  const post = content?.posts.find((item) => item.slug === slug);
  const slugValue = post?.slug || '';
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);

  const toc = useMemo(() => (post ? extractToc(post.content) : []), [post]);

  useEffect(() => {
    if (!post) return;
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!headings.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [post, slugValue, toc]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!post) return <NotFound />;

  return (
    <div className="pb-20 pt-24">
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
        <div
          className="h-full transition-[width] duration-150"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), #8b5cf6)'
          }}
        />
      </div>

      <div className="container-page">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回文章列表
        </Link>

        <header className="mx-auto mt-8 max-w-3xl">
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
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-50 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">{post.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[1fr_220px]">
          <article className="card-surface p-6 sm:p-9">
            <Markdown content={post.content} />
          </article>

          {toc.length ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  目录
                </p>
                <nav className="mt-4 space-y-1 border-l border-white/10" aria-label="文章目录">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block border-l-2 py-1.5 pl-3 text-xs leading-5 transition ${
                        activeId === item.id
                          ? 'border-[color:var(--accent)] text-[color:var(--accent)]'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      } ${item.level === 3 ? 'pl-5' : ''}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
