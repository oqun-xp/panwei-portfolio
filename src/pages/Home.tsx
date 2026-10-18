import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Code2,
  Copy,
  Github,
  GraduationCap,
  Mail,
  MapPin,
  Palette,
  Server,
  Sparkles,
  Wrench,
  type LucideIcon
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import ContactForm from '../components/ContactForm';
import { formatDate, initials, readingTime, sortByDateDesc } from '../lib/format';
import type { Skill } from '../types';

const categoryIcons: Record<string, LucideIcon> = {
  前端: Code2,
  后端: Server,
  工具: Wrench,
  设计: Palette
};

function SkillBar({ skill, index }: { skill: Skill; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{skill.name}</span>
        <span className="text-xs tabular-nums text-slate-500">{skill.level}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <span
          className="block h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: active ? `${skill.level}%` : '0%',
            transitionDelay: `${index * 60}ms`,
            background: 'linear-gradient(90deg, var(--accent), #8b5cf6)'
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const { content } = useContent();
  const { pushToast } = useToast();

  if (!content) return null;

  const { profile, skills, projects, posts } = content;
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const latestPosts = sortByDateDesc(posts).slice(0, 2);
  const categories = Array.from(new Set(skills.map((skill) => skill.category)));
  const stats = [
    { value: projects.length, label: '项目作品' },
    { value: posts.length, label: '博客文章' },
    { value: skills.length, label: '技能项' }
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      pushToast('邮箱已复制到剪贴板', 'success');
    } catch (error) {
      pushToast('复制失败，请手动选择邮箱', 'error');
    }
  };

  return (
    <>
      <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
        <div className="container-page grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {profile.role}
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-tight text-slate-50 sm:text-5xl xl:text-6xl">
              你好，我是
              <br />
              <span className="bg-gradient-to-r from-[color:var(--accent)] via-sky-400 to-violet-400 bg-clip-text text-transparent">
                {profile.name}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-slate-300 sm:text-xl">
              {profile.tagline}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              {profile.bio}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/projects" className="btn btn-primary">
                查看项目
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#contact" className="btn btn-ghost">
                联系我
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 transition hover:text-slate-200"
              >
                <Github className="h-4 w-4" />
                {profile.github.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold tabular-nums text-slate-100">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="relative aspect-square">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-6 animate-[spin_36s_linear_infinite] rounded-full border border-dashed border-white/10" />
              <div
                className="absolute inset-12 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, var(--accent-soft), transparent 68%)' }}
              />
              <div className="absolute inset-14 grid place-items-center overflow-hidden rounded-full border border-white/15 bg-slate-950/60 backdrop-blur-xl sm:inset-16">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="bg-gradient-to-br from-[color:var(--accent)] to-violet-400 bg-clip-text text-7xl font-black text-transparent sm:text-8xl"
                  >
                    {initials(profile.name)}
                  </span>
                )}
              </div>

              <div className="absolute -left-2 top-10 animate-float-slow rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 shadow-card backdrop-blur-xl">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400" />
                React
              </div>
              <div
                className="absolute -right-3 top-1/3 animate-float-slow rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 shadow-card backdrop-blur-xl"
                style={{ animationDelay: '1.2s' }}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-400" />
                TypeScript
              </div>
              <div
                className="absolute bottom-12 -left-4 animate-float-slow rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 shadow-card backdrop-blur-xl"
                style={{ animationDelay: '2.1s' }}
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Vercel
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section-shell">
        <div className="container-page">
          <SectionHeading
            eyebrow="关于我"
            title="从真实需求出发，做能用的产品"
            description="喜欢把复杂流程拆成简单、可靠的交互，也喜欢把做项目的过程记录下来。"
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[.92fr_1.08fr]">
            <Reveal>
              <div className="card-surface h-full p-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-slate-100">个人简介</h3>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-400">{profile.bio}</p>
                <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm text-slate-400">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">方向</span>
                    <span className="text-slate-200">Web 开发 · AI 应用</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">位置</span>
                    <span className="text-slate-200">{profile.location}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">邮箱</span>
                    <a href={`mailto:${profile.email}`} className="text-slate-200 hover:text-[color:var(--accent)]">
                      {profile.email}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card-surface h-full p-7">
                <h3 className="text-lg font-semibold text-slate-100">教育与经历</h3>
                <div className="mt-6 space-y-7">
                  {profile.education.map((item) => (
                    <div key={`${item.title}-${item.period}`} className="relative border-l border-white/10 pl-6">
                      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-[color:var(--accent)]" />
                      <div className="flex flex-wrap items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                        <span className="text-xs text-slate-600">{item.period}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                    </div>
                  ))}
                  {profile.experience.map((item) => (
                    <div key={`${item.title}-${item.period}`} className="relative border-l border-white/10 pl-6">
                      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-violet-400" />
                      <div className="flex flex-wrap items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                        <span className="text-xs text-slate-600">{item.period}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="skills" className="section-shell border-y border-white/[0.06] bg-white/[0.015]">
        <div className="container-page">
          <SectionHeading
            eyebrow="技能"
            title="常用工具与技术栈"
            description="从页面到接口，再到部署，尽量把一件事做完整。"
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {categories.map((category, categoryIndex) => {
              const Icon = categoryIcons[category] || Code2;
              const categorySkills = skills.filter((skill) => skill.category === category);
              return (
                <Reveal key={category} delay={categoryIndex * 80}>
                  <div className="card-surface h-full p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-[color:var(--accent)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-100">{category}</h3>
                        <p className="text-xs text-slate-500">{categorySkills.length} 项技能</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {categorySkills.map((skill, index) => (
                        <SkillBar key={skill.id} skill={skill} index={index} />
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="featured" className="section-shell">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="精选项目"
              title="最近在做什么"
              description="从 Chrome 扩展到个人网站，都是一些从真实需求出发的小产品。"
            />
            <Link
              to="/projects"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-[color:var(--accent)]"
            >
              全部项目
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.id} delay={index * 80}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell border-y border-white/[0.06] bg-white/[0.015]">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="博客"
              title="最近的思考"
              description="记录项目过程、技术选型和踩过的坑。"
            />
            <Link
              to="/blog"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-[color:var(--accent)]"
            >
              全部文章
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {latestPosts.map((post, index) => (
              <Reveal key={post.id} delay={index * 100}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group card-surface block h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card"
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ background: 'linear-gradient(90deg, var(--accent), #8b5cf6)' }}
                  />
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(post.date)}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {readingTime(post.content)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-100 transition group-hover:text-[color:var(--accent)]">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{post.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-shell">
        <div className="container-page grid gap-8 lg:grid-cols-[.88fr_1.12fr]">
          <Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="联系"
                title="一起做点有意思的事"
                description="如果你对我的项目感兴趣，或者想聊聊 Web 开发与 AI 工具，欢迎给我留言。"
              />

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={copyEmail}
                  className="card-surface flex w-full items-center justify-between gap-4 p-4 text-left transition hover:border-white/20"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                      <Mail className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-xs text-slate-500">邮箱</span>
                      <span className="block text-sm font-medium text-slate-200">{profile.email}</span>
                    </span>
                  </span>
                  <Copy className="h-4 w-4 text-slate-500" />
                </button>

                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="card-surface flex items-center justify-between gap-4 p-4 transition hover:border-white/20"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-slate-300">
                      <Github className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-xs text-slate-500">GitHub</span>
                      <span className="block text-sm font-medium text-slate-200">
                        {profile.github.replace(/^https?:\/\//, '')}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card-surface p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-100">给我留言</h3>
              <p className="mt-1 text-sm text-slate-500">表单会保存到后台，我看到后会尽快回复。</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
