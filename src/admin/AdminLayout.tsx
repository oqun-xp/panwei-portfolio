import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  ShieldCheck,
  UserRound,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: '个人信息', icon: UserRound },
  { to: '/admin/skills', label: '技能管理', icon: Wrench },
  { to: '/admin/projects', label: '项目管理', icon: FolderKanban },
  { to: '/admin/posts', label: '博客管理', icon: Newspaper },
  { to: '/admin/messages', label: '留言管理', icon: Mail },
  { to: '/admin/settings', label: '站点设置', icon: Settings }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const current = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="关闭侧边栏"
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link to="/admin" className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-slate-950"
              style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
            >
              PW
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-100">管理后台</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-600">
                Panwei Portfolio
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="关闭侧边栏"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="后台导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-link ${isActive ? 'admin-link-active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <Link to="/" className="admin-link">
            <ExternalLink className="h-4 w-4" />
            查看网站
          </Link>
          <button type="button" onClick={handleLogout} className="admin-link w-full">
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            已登录：{user?.name || 'admin'}
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-slate-950/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="打开侧边栏"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-100">{current?.label || '管理后台'}</p>
              <p className="text-[11px] text-slate-600">内容修改后记得点击保存</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:block">你好，{user?.name || 'admin'}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--accent-soft)] text-xs font-bold text-[color:var(--accent)]">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
