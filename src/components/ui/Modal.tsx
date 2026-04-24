import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={[
          'relative w-full mx-4 rounded-xl anim-fade-up',
          'bg-[var(--color-panel)] border border-[var(--color-b1)]',
          width,
        ].join(' ')}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-b0)]">
            <h3 className="text-[14px] font-semibold text-[var(--color-t1)]">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--color-t4)] hover:text-[var(--color-t1)] hover:bg-[var(--color-surface-1)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
