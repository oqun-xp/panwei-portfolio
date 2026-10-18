import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const links = [
  { label: '关于', to: '/#about', hash: 'about' },
  { label: '技能', to: '/#skills', hash: 'skills' },
  { label: '项目', to: '/projects', hash: '' },
  { label: '博客', to: '/blog', hash: '' },
  { label: '联系', to: '/#contact', hash: 'contact' }
];

export default function Navbar() {
  const { content } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }
    const sections = ['about', 'skills', 'featured', 'contact']
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-42% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname, content]);

  const handleHashLink = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    event.preventDefault();
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (link: (typeof links)[number]) => {
    if (link.hash) {
      return location.pathname === '/' && activeSection === link.hash;
    }
    return location.pathname.startsWith(link.to);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-slate-950/75 shadow-[0_10px_40px_rgba(2,6,23,.45)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Link to="/" className="flex items-center gap-3" aria-label="返回首页">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-slate-950"
            style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
          >
            PW
          </span>
          <span className="hidden text-sm font-semibold tracking-wide text-slate-200 sm:block">
            {content?.profile.name || '盘巍'}
            <span className="ml-2 text-xs font-normal text-slate-500">Portfolio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {links.map((link) =>
            link.hash ? (
              <a
                key={link.label}
                href={link.to}
                onClick={(event) => handleHashLink(event, link.hash)}
                className={`rounded-full px-3.5 py-2 text-sm transition ${
                  isActive(link)
                    ? 'bg-white/[0.07] text-slate-50'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={`rounded-full px-3.5 py-2 text-sm transition ${
                  isActive(link)
                    ? 'bg-white/[0.07] text-slate-50'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            onClick={(event) => handleHashLink(event, 'contact')}
            className="btn btn-primary hidden !px-4 !py-2 text-xs md:inline-flex"
          >
            联系我
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="移动端导航">
            {links.map((link) =>
              link.hash ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={(event) => handleHashLink(event, link.hash)}
                  className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              to="/admin"
              className="mt-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
            >
              管理后台
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
