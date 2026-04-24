import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  search?: boolean;
}

export default function Input({ search = false, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {search && (
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-t4)' }}
        />
      )}
      <input
        className={[
          'w-full rounded-lg text-[13px] transition-all duration-150',
          'bg-[var(--color-surface-2)] border border-[var(--color-b0)] text-[var(--color-t1)]',
          'placeholder:text-[var(--color-t4)]',
          'focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20',
          search ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
    </div>
  );
}
