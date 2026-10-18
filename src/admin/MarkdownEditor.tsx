import { useState } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import Markdown from '../components/Markdown';

export default function MarkdownEditor({
  value,
  onChange,
  label = '正文（Markdown）',
  minHeight = 360
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  minHeight?: number;
}) {
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="label-base !mb-0">{label}</span>
        <div className="flex rounded-lg border border-white/10 bg-slate-950/50 p-0.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${
              mobileTab === 'edit' ? 'bg-white/10 text-slate-100' : 'text-slate-500'
            }`}
          >
            <PencilLine className="h-3.5 w-3.5" />
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${
              mobileTab === 'preview' ? 'bg-white/10 text-slate-100' : 'text-slate-500'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            预览
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={mobileTab === 'preview' ? 'hidden lg:block' : ''}>
          <textarea
            className="input-base w-full resize-y font-mono text-xs leading-6"
            style={{ minHeight }}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="支持 Markdown、GFM 表格、任务列表与代码高亮…"
            spellCheck={false}
          />
          <p className="mt-1.5 text-right text-[11px] text-slate-600">{value.length} 字符</p>
        </div>
        <div
          className={`overflow-y-auto rounded-xl border border-white/10 bg-slate-950/40 p-4 ${
            mobileTab === 'edit' ? 'hidden lg:block' : ''
          }`}
          style={{ minHeight }}
        >
          {value.trim() ? (
            <Markdown content={value} />
          ) : (
            <p className="text-sm text-slate-600">预览会显示在这里。</p>
          )}
        </div>
      </div>
    </div>
  );
}
