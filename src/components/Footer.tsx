import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, LockKeyhole, Mail } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export default function Footer() {
  const { content } = useContent();
  if (!content) return null;
  const { profile, settings } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 border-t border-white/10 bg-slate-950/40">
      <div className="container-page flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-200">{settings.siteTitle}</p>
          <p className="mt-2 max-w-md text-sm text-slate-500">{settings.footerText}</p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target={social.url.startsWith('http') ? '_blank' : undefined}
                rel={social.url.startsWith('http') ? 'noreferrer noopener' : undefined}
                className="chip gap-1.5 hover:border-white/25 hover:text-slate-100"
              >
                {social.label === 'GitHub' ? (
                  <Github className="h-3.5 w-3.5" />
                ) : social.label === '邮箱' ? (
                  <Mail className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                )}
                {social.label}
              </a>
            ))}
            <Link to="/admin" className="chip gap-1.5 hover:border-white/25 hover:text-slate-100">
              <LockKeyhole className="h-3.5 w-3.5" />
              管理后台
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            © {year} {profile.name} · Built with React + Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
