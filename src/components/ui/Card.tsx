import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
  style?: CSSProperties;
}

const paddings: Record<string, string> = { sm: 'p-3', md: 'p-4', lg: 'p-5', none: '' };

export default function Card({ children, className = '', hover = true, padding = 'lg', onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        'rounded-xl border transition-all duration-150',
        'bg-[var(--color-surface-1)] border-[var(--color-b0)]',
        hover && 'hover:bg-[var(--color-surface-2)] hover:border-[var(--color-b1)]',
        onClick && 'cursor-pointer',
        paddings[padding],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
