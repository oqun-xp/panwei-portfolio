import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/admin';

  if (loading) return <LoadingScreen label="正在验证登录状态…" />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-base font-black text-slate-950"
              style={{ background: 'linear-gradient(135deg, var(--accent), #8b5cf6)' }}
            >
              PW
            </span>
            <span className="text-left">
              <span className="block text-lg font-semibold text-slate-100">管理后台</span>
              <span className="block text-xs uppercase tracking-[0.18em] text-slate-600">
                Panwei Portfolio
              </span>
            </span>
          </Link>
        </div>

        <div className="card-surface p-7 sm:p-8">
          <h1 className="text-xl font-semibold text-slate-100">登录</h1>
          <p className="mt-1.5 text-sm text-slate-500">登录后可编辑个人信息、技能、项目与博客。</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="label-base" htmlFor="login-username">
                账号
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-username"
                  className="input-base pl-10"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="请输入管理员账号"
                />
              </div>
            </div>

            <div>
              <label className="label-base" htmlFor="login-password">
                密码
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-base pl-10 pr-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {submitting ? '登录中…' : '登录后台'}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-5 text-slate-600">
            默认账号密码见项目 README。线上部署后请及时在环境变量中修改。
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-500 transition hover:text-slate-300">
            返回个人网站
          </Link>
        </div>
      </div>
    </div>
  );
}
