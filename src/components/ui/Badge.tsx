import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'ok' | 'warn' | 'bad' | 'info' | 'amber';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-2)] text-[var(--color-t3)]',
  accent:  'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  ok:      'bg-green-500/10 text-green-400',
  warn:    'bg-amber-500/10 text-amber-400',
  bad:     'bg-red-500/10 text-red-400',
  info:    'bg-blue-500/10 text-blue-400',
  amber:   'bg-[var(--color-amber-soft)] text-[var(--color-amber)]',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export default function Badge({ children, variant = 'default', className = '', dot }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium leading-tight',
        variants[variant],
        className,
      ].filter(Boolean).join(' ')}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: variant === 'default' ? 'var(--color-t4)' : 'currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
}
