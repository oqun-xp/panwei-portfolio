import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { api } from '../api/client';
import type { ContentData } from '../types';

interface ContentContextValue {
  content: ContentData | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  save: (next: ContentData) => Promise<ContentData>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;
  const number = Number.parseInt(value, 16);
  const r = (number >> 16) & 255;
  const g = (number >> 8) & 255;
  const b = number & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getContent();
      setContent(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '内容加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!content) return;
    document.title = content.settings.siteTitle;
    const root = document.documentElement;
    root.style.setProperty('--accent', content.settings.accent);
    root.style.setProperty('--accent-soft', hexToRgba(content.settings.accent, 0.14));
    root.style.setProperty('--accent-line', hexToRgba(content.settings.accent, 0.38));
  }, [content]);

  const save = useCallback(async (next: ContentData) => {
    const saved = await api.saveContent(next);
    setContent(saved);
    return saved;
  }, []);

  const value = useMemo(
    () => ({ content, loading, error, refresh, save }),
    [content, loading, error, refresh, save]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent 必须在 ContentProvider 内使用');
  return context;
}
