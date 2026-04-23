import { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
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

const STATUS_ICON = {
  overdue: <AlertCircle size={14} className="text-red-500" />,
  pending: <Circle size={14} className="text-slate-400" />,
  in_progress: <Clock size={14} className="text-blue-500" />,
  completed: <CheckCircle2 size={14} className="text-emerald-500" />,
};

const PRIORITY_STYLE = {
  high: 'border-l-red-400',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-300',
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

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays size={22} className="text-blue-600" /> 智能日历
        </h1>
        <p className="text-sm text-slate-500 mt-1">AI 自动生成的服务日历，再也不漏事</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: '总待办', value: stats.total, color: 'text-slate-900' },
          { label: '已逾期', value: stats.overdue, color: 'text-red-600' },
          { label: '待处理', value: stats.pending, color: 'text-amber-600' },
          { label: '本周到期', value: stats.thisWeek, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 px-4 py-3">
            <p className={`text-[20px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {STATUS_TABS.map(s => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${
                tab === s.key ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">所有负责人</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-100">
            <p className="text-[14px] text-slate-400">暂无任务</p>
          </div>
        ) : filtered.map(t => (
          <div
            key={t.id}
            className={`bg-white rounded-lg border border-slate-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow border-l-[3px] ${PRIORITY_STYLE[t.priority]}`}
          >
            <div className="shrink-0">
              {STATUS_ICON[t.status]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-[13px] font-medium ${t.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{TYPE_LABEL[t.type]}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.customerName} · {t.assignedTo}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-[12px] font-medium ${
                t.status === 'overdue' ? 'text-red-600' : t.status === 'completed' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {t.status === 'overdue' ? '⚠ 已逾期' : t.deadline}
              </p>
              <p className={`text-[10px] mt-0.5 ${
                t.priority === 'high' ? 'text-red-500' : t.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {t.priority === 'high' ? '高优先' : t.priority === 'medium' ? '中优先' : '低优先'}
              </p>
            </div>
            <button
              onClick={() => advanceStatus(t.id)}
              className={`text-[11px] px-3 py-1.5 rounded-md transition-colors shrink-0 ${
                t.status === 'completed'
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              disabled={t.status === 'completed'}
            >
              {t.status === 'completed' ? '已完成' : t.status === 'in_progress' ? '完成' : '开始'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
