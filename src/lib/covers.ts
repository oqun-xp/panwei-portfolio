import type { CSSProperties } from 'react';

export const coverOptions = [
  { key: 'aurora', label: '极光' },
  { key: 'ocean', label: '深海' },
  { key: 'starry', label: '星夜' },
  { key: 'violet', label: '紫雾' },
  { key: 'ember', label: '余烬' },
  { key: 'forest', label: '森林' }
] as const;

const gradients: Record<string, string> = {
  aurora:
    'radial-gradient(circle at 20% 20%, rgba(34,211,238,.85), transparent 45%), linear-gradient(135deg, #0ea5e9 0%, #6366f1 55%, #a855f7 100%)',
  ocean:
    'radial-gradient(circle at 80% 15%, rgba(56,189,248,.55), transparent 42%), linear-gradient(135deg, #082f49 0%, #0369a1 48%, #0891b2 100%)',
  starry:
    'radial-gradient(circle at 75% 25%, rgba(167,139,250,.6), transparent 40%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 52%, #312e81 100%)',
  violet:
    'radial-gradient(circle at 25% 75%, rgba(244,114,182,.5), transparent 45%), linear-gradient(135deg, #4c1d95 0%, #7e22ce 52%, #db2777 100%)',
  ember:
    'radial-gradient(circle at 75% 20%, rgba(251,191,36,.7), transparent 42%), linear-gradient(135deg, #7c2d12 0%, #ea580c 52%, #f59e0b 100%)',
  forest:
    'radial-gradient(circle at 20% 80%, rgba(52,211,153,.5), transparent 45%), linear-gradient(135deg, #022c22 0%, #047857 52%, #10b981 100%)'
};

export function coverStyle(cover: string): CSSProperties {
  if (/^https?:\/\//i.test(cover) || cover.startsWith('data:')) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(5,7,13,.05), rgba(5,7,13,.65)), url("${cover}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return { backgroundImage: gradients[cover] || gradients.aurora };
}
