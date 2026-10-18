import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ToastKind } from '../types';

interface ToastItem {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  pushToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3800);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-3 px-4">
        <div aria-live="polite" className="flex w-full max-w-md flex-col gap-3">
          {toasts.map((toast) => {
            const Icon =
              toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? XCircle : Info;
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-card backdrop-blur-xl animate-[fadeUp_.25s_ease] ${
                  toast.kind === 'success'
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
                    : toast.kind === 'error'
                      ? 'border-rose-400/30 bg-rose-500/15 text-rose-100'
                      : 'border-white/10 bg-slate-900/90 text-slate-100'
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="leading-6">{toast.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast 必须在 ToastProvider 内使用');
  return context;
}
