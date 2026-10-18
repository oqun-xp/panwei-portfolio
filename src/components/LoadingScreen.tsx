export default function LoadingScreen({ label = '正在加载内容…' }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-slate-400">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[color:var(--accent)]" />
      <p className="text-sm tracking-wide">{label}</p>
    </div>
  );
}
