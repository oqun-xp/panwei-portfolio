import type { ReactNode } from 'react';

export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  className = '',
  children
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label-base" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-rose-300">{error}</p> : null}
      {!error && hint ? <p className="mt-1.5 text-xs text-slate-600">{hint}</p> : null}
    </div>
  );
}
