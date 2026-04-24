import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';

const variants: Record<BtnVariant, string> = {
  primary:   'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm',
  secondary: 'bg-[var(--color-surface-2)] text-[var(--color-t2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-t1)] border border-[var(--color-b0)]',
  ghost:     'text-[var(--color-t3)] hover:text-[var(--color-t1)] hover:bg-[var(--color-surface-1)]',
  danger:    'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
};

const sizes: Record<BtnSize, string> = {
  sm: 'px-2.5 py-1.5 text-[11px]',
  md: 'px-3 py-2 text-[12px]',
  lg: 'px-4 py-2.5 text-[13px]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: boolean;
}

export default function Button({ children, variant = 'secondary', size = 'md', icon = false, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30',
        'disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        icon && 'p-0 w-8 h-8',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
