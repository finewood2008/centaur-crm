import type { ReactNode } from 'react';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export default function SectionHeader({ icon, title, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={['flex items-center justify-between mb-3', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--color-t3)]">{icon}</span>}
        <h3 className="text-[13px] font-semibold text-[var(--color-t1)]">{title}</h3>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
