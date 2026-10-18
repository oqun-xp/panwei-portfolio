import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 pt-20">
      <div className="card-surface w-full max-w-lg p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-6 text-5xl font-black tracking-tight text-slate-100">404</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-200">这个页面不存在</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          链接可能已经失效，或者内容被移动到了别的位置。
        </p>
        <Link to="/" className="btn btn-primary mt-7">
          <ArrowLeft className="h-4 w-4" />
          回到首页
        </Link>
      </div>
    </div>
  );
}
