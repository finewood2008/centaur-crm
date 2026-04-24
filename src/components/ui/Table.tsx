import type { ReactNode } from 'react';

interface ColDef {
  key: string;
  label: string;
  width?: string; // col-span-N
  sortable?: boolean;
  render?: (row: any) => ReactNode;
}

interface TableProps {
  columns: ColDef[];
  data: any[];
  onRowClick?: (row: any) => void;
  sortKey?: string;
  sortAsc?: boolean;
  onSort?: (key: string) => void;
  emptyText?: string;
  className?: string;
}

export default function Table({ columns, data, onRowClick, sortKey, sortAsc, onSort, emptyText = '暂无数据', className = '' }: TableProps) {
  return (
    <div className={className}>
      {/* Header */}
      <div
        className="grid gap-3 px-4 py-2.5 rounded-t-xl text-[11px] font-medium uppercase tracking-wider"
        style={{
          background: 'var(--color-surface-2)',
          borderBottom: '1px solid var(--color-b0)',
          color: 'var(--color-t4)',
          gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
        }}
      >
        {columns.map(col => (
          <div
            key={col.key}
            className={[
              'flex items-center gap-1',
              col.sortable ? 'cursor-pointer hover:text-[var(--color-t2)]' : '',
              sortKey === col.key ? 'text-[var(--color-t2)]' : '',
            ].join(' ')}
            onClick={() => col.sortable && onSort?.(col.key)}
          >
            {col.label}
            {col.sortable && sortKey === col.key && (
              <span className="text-[9px]">{sortAsc ? '↑' : '↓'}</span>
            )}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="rounded-b-xl border border-[var(--color-b0)] border-t-0">
        {data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-[var(--color-t4)]">{emptyText}</p>
          </div>
        ) : (
          data.map((row, i) => (
            <div
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={[
                'grid gap-3 px-4 py-3 transition-colors',
                onRowClick ? 'cursor-pointer' : '',
              ].join(' ')}
              style={{
                borderBottom: '1px solid var(--color-b0)',
                gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map(col => (
                <div key={col.key} className="min-w-0">
                  {col.render ? col.render(row) : (
                    <span className="text-[13px] text-[var(--color-t2)]">{row[col.key]}</span>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
