import { useState, type JSX } from 'react';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { Card, Badge, SectionHeader } from '../components/ui';
import { TASKS as INIT_TASKS } from '../mock';
import type { Task } from '../types';

const TYPE_LABEL: Record<string, string> = {
  tax_filing: '税务申报',
  annual_report: '年度汇算',
  license_renewal: '执照年检',
  social_security: '社保',
  invoice: '发票',
  other: '其他',
};

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'overdue', label: '已逾期' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

const STATUS_ICON: Record<string, JSX.Element> = {
  overdue:     <AlertCircle size={14} className="text-red-400" />,
  pending:     <Circle size={14} className="text-[var(--color-t4)]" />,
  in_progress: <Clock size={14} className="text-blue-400" />,
  completed:   <CheckCircle2 size={14} className="text-green-400" />,
};

const PRIORITY_BADGE: Record<string, { variant: 'bad' | 'warn' | 'default'; label: string }> = {
  high:   { variant: 'bad',   label: '高优先' },
  medium: { variant: 'warn',  label: '中优先' },
  low:    { variant: 'default', label: '低优先' },
};

const PRIORITY_BORDER: Record<string, string> = {
  high:   'border-l-red-500',
  medium: 'border-l-amber-500',
  low:    'border-l-[var(--color-t4)]',
};

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([...INIT_TASKS]);
  const [tab, setTab] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const assignees = [...new Set(tasks.map(t => t.assignedTo))];

  const advanceStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const next: Record<string, Task['status']> = {
        pending: 'in_progress',
        overdue: 'in_progress',
        in_progress: 'completed',
      };
      const nextStatus = next[t.status];
      return nextStatus ? { ...t, status: nextStatus } : t;
    }));
  };

  const filtered = tasks
    .filter(t => tab === 'all' || t.status === tab)
    .filter(t => assigneeFilter === 'all' || t.assignedTo === assigneeFilter)
    .sort((a, b) => {
      const order: Record<string, number> = { overdue: 0, in_progress: 1, pending: 2, completed: 3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9) || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const stats = {
    total: tasks.length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    thisWeek: tasks.filter(t => {
      const d = new Date(t.deadline);
      const now = new Date();
      const diff = (d.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 7 && t.status !== 'completed';
    }).length,
  };

  const statCards = [
    { label: '总待办', value: stats.total, accent: 'var(--color-accent-bright)' },
    { label: '已逾期', value: stats.overdue, accent: 'var(--color-bad)' },
    { label: '待处理', value: stats.pending, accent: 'var(--color-warn)' },
    { label: '本周到期', value: stats.thisWeek, accent: 'var(--color-info)' },
  ];

  return (
    <div className="p-6 max-w-[1100px] mx-auto anim-fade-in">
      {/* Header */}
      <div className="mb-6">
        <SectionHeader
          icon={<CalendarDays size={18} className="text-[var(--color-accent-bright)]" />}
          title="智能日历"
          className="mb-1"
        />
        <p className="text-sm mt-1 text-[var(--color-t3)]">
          AI 自动生成的服务日历，再也不漏事
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6 stagger">
        {statCards.map(s => (
          <Card key={s.label} padding="md">
            <p className="text-[22px] font-semibold leading-none" style={{ color: s.accent }}>
              {s.value}
            </p>
            <p className="text-[11px] mt-1.5 text-[var(--color-t4)]">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="tab-group">
          {STATUS_TABS.map(s => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`tab-item ${tab === s.key ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          className="text-[12px] px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-b0)',
            color: 'var(--color-t2)',
          }}
        >
          <option value="all">所有负责人</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Task list */}
      <div className="space-y-2 stagger">
        {filtered.length === 0 ? (
          <Card padding="lg" hover={false}>
            <p className="text-[14px] text-center text-[var(--color-t4)] py-8">暂无任务</p>
          </Card>
        ) : filtered.map(t => (
          <Card
            key={t.id}
            padding="md"
            className={[
              'flex items-center gap-4',
              PRIORITY_BORDER[t.priority],
              'border-l-3',
            ].join(' ')}
            style={{ borderLeftWidth: '3px' }}
          >
            {/* Status icon */}
            <div className="shrink-0">
              {STATUS_ICON[t.status]}
            </div>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="text-[13px] font-medium truncate"
                  style={{
                    color: t.status === 'completed' ? 'var(--color-t4)' : 'var(--color-t1)',
                    textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {t.title}
                </p>
                <Badge variant="default">{TYPE_LABEL[t.type]}</Badge>
              </div>
              <p className="text-[11px] mt-0.5 text-[var(--color-t4)]">
                {t.customerName} · {t.assignedTo}
              </p>
            </div>

            {/* Deadline + priority */}
            <div className="text-right shrink-0">
              <p
                className="text-[12px] font-medium"
                style={{
                  color: t.status === 'overdue' ? 'var(--color-bad)' : t.status === 'completed' ? 'var(--color-t4)' : 'var(--color-t2)',
                }}
              >
                {t.status === 'overdue' ? '⚠ 已逾期' : t.deadline}
              </p>
              <Badge
                variant={PRIORITY_BADGE[t.priority].variant}
                className="mt-0.5"
              >
                {PRIORITY_BADGE[t.priority].label}
              </Badge>
            </div>

            {/* Action button */}
            <button
              onClick={() => advanceStatus(t.id)}
              disabled={t.status === 'completed'}
              className={[
                'text-[11px] px-3 py-1.5 rounded-md transition-all shrink-0 font-medium',
                'focus:outline-none',
                t.status === 'completed'
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-t4)] cursor-default border border-[var(--color-b0)]'
                  : 'bg-[var(--color-accent-muted)] text-[var(--color-accent-bright)] border border-[var(--color-accent-muted)] hover:bg-[var(--color-accent)] hover:text-white',
              ].join(' ')}
            >
              {t.status === 'completed' ? '已完成' : t.status === 'in_progress' ? '完成' : '开始'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
