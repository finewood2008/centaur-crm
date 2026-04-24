interface TabItem {
  key: string;
  label: string;
  badge?: number;
}

interface TabGroupProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function TabGroup({ items, active, onChange, className = '' }: TabGroupProps) {
  return (
    <div
      className={[
        'inline-flex items-center gap-0.5 p-0.5 rounded-lg',
        'bg-[var(--color-surface-1)] border border-[var(--color-b0)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={[
            'px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150',
            'focus:outline-none',
            active === item.key
              ? 'bg-[var(--color-elevated)] text-[var(--color-t1)] shadow-sm'
              : 'text-[var(--color-t3)] hover:text-[var(--color-t2)]',
          ].join(' ')}
        >
          <span className="flex items-center gap-1.5">
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span className="text-[10px] w-4 h-4 flex items-center justify-center rounded-full bg-[var(--color-surface-3)]">
                {item.badge}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
