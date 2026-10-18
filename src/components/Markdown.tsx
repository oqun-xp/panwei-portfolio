import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ReactNode } from 'react';
import { slugifyHeading } from '../lib/format';

function textOf(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(textOf).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return textOf((children as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

const components: Components = {
  h2({ children }) {
    return <h2 id={slugifyHeading(textOf(children))}>{children}</h2>;
  },
  h3({ children }) {
    return <h3 id={slugifyHeading(textOf(children))}>{children}</h3>;
  },
  a({ href, children }) {
    const external = Boolean(href && /^https?:\/\//i.test(href));
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
      >
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    return <img src={src} alt={alt || ''} loading="lazy" />;
  },
  code({ className, children }) {
    const isBlock = Boolean(className && className.includes('language-'));
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return <code>{children}</code>;
  }
};

export default function Markdown({
  content,
  className = ''
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={`prose-custom max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
