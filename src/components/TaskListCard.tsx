import type { ReactNode } from 'react';
import { Badge, Card } from '../components/ui';
import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import type { Task } from '../types';

interface Props {
  tasks: Task[];
  title?: string;
}

const STATUS_ICON: Record<string, ReactNode> = {
  overdue:     <AlertCircle size={12} className="text-red-400" />,
  pending:     <Circle size={12} className="text-[var(--color-t4)]" />,
  in_progress: <Clock size={12} className="text-blue-400" />,
  completed:   <CheckCircle2 size={12} className="text-green-400" />,
};

export default function TaskListCard({ tasks, title }: Props) {
  if (tasks.length === 0) return null;

  return (
    <Card padding="md" hover={false} className="my-2">
      {title && (
        <p className="text-[12px] font-semibold text-[var(--color-t1)] mb-2">{title}</p>
      )}
      <div className="space-y-1">
        {tasks.map(t => {
          const status = t.status === 'overdue' ? 'overdue' : t.status;
          return (
            <div key={t.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg">
              {STATUS_ICON[status] || <Circle size={12} className="text-[var(--color-t4)]" />}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate text-[var(--color-t1)]">{t.title}</p>
                <p className="text-[10px] text-[var(--color-t4)]">{t.customerName}</p>
              </div>
              <span className="mono text-[10px] text-[var(--color-t4)]">{t.deadline.slice(5)}</span>
              {t.status === 'overdue' && <Badge variant="bad">逾期</Badge>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
