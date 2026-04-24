import { useState, useMemo } from 'react';
import { Users, ArrowUpDown } from 'lucide-react';
import { Input, Badge, TabGroup } from '../components/ui';
import { CUSTOMERS } from '../mock';

interface Props {
  onCustomerClick: (id: string) => void;
}

const STATUS_CFG: Record<string, { label: string; variant: 'ok' | 'warn' | 'bad' }> = {
  active:    { label: '正常', variant: 'ok' },
  attention: { label: '关注', variant: 'warn' },
  risk:      { label: '风险', variant: 'bad' },
};

type SortKey = 'name' | 'healthScore' | 'monthlyRevenue' | 'lastContact';

export default function Customers({ onCustomerClick }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('healthScore');
  const [sortAsc, setSortAsc] = useState(false);

  const assignees = useMemo(() => [...new Set(CUSTOMERS.map(c => c.assignedTo))], []);

  const filtered = useMemo(() => {
    return CUSTOMERS
      .filter(c => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (assigneeFilter !== 'all' && c.assignedTo !== assigneeFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return c.name.toLowerCase().includes(q) ||
            c.contact.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.tags.some(t => t.toLowerCase().includes(q));
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortKey === 'name') diff = a.name.localeCompare(b.name);
        else if (sortKey === 'healthScore') diff = a.healthScore - b.healthScore;
        else if (sortKey === 'monthlyRevenue') diff = a.monthlyRevenue - b.monthlyRevenue;
        else if (sortKey === 'lastContact') diff = new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
        return sortAsc ? diff : -diff;
      });
  }, [search, statusFilter, assigneeFilter, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const healthColor = (score: number) =>
    score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '正常' },
    { key: 'attention', label: '关注' },
    { key: 'risk', label: '风险' },
  ];

  const SortHeader = ({ label, sortKey: sk, className = '' }: { label: string; sortKey: SortKey; className?: string }) => (
    <div
      className={[
        'flex items-center gap-1 cursor-pointer transition-colors',
        sortKey === sk ? 'text-[var(--color-t2)]' : 'text-[var(--color-t4)] hover:text-[var(--color-t3)]',
        className,
      ].join(' ')}
      onClick={() => handleSort(sk)}
    >
      {label} <ArrowUpDown size={10} />
    </div>
  );

  return (
    <div className="p-6 max-w-[1200px] mx-auto anim-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-[var(--color-t1)]">
            <Users size={22} className="text-[var(--color-accent)]" /> 客户管理
          </h1>
          <p className="text-sm mt-1 text-[var(--color-t4)]">
            共 {CUSTOMERS.length} 个客户 · 筛选出 {filtered.length} 个
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <Input
          search
          placeholder="搜索企业名、联系人、行业、标签..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs"
        />
        <TabGroup items={statusTabs} active={statusFilter} onChange={setStatusFilter} />
        <select
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          className="text-[12px] px-3 py-1.5 rounded-lg cursor-pointer bg-[var(--color-surface-2)] border border-[var(--color-b0)] text-[var(--color-t2)] focus:outline-none"
        >
          <option value="all">所有负责人</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Table header */}
      <div
        className="grid grid-cols-12 gap-3 px-4 py-2.5 rounded-t-xl text-[11px] font-medium uppercase tracking-wider"
        style={{
          background: 'var(--color-surface-2)',
          borderBottom: '1px solid var(--color-b0)',
          gridTemplateColumns: '4fr 2fr 1fr 1fr 2fr 1fr 1fr',
        }}
      >
        <SortHeader label="企业名称" sortKey="name" />
        <div className="text-[var(--color-t4)]">行业 · 类型</div>
        <SortHeader label="健康分" sortKey="healthScore" className="justify-center" />
        <SortHeader label="月营收" sortKey="monthlyRevenue" className="justify-center" />
        <div className="text-[var(--color-t4)]">服务项目</div>
        <SortHeader label="最近联系" sortKey="lastContact" className="justify-center" />
        <div className="text-[var(--color-t4)]">状态</div>
      </div>

      {/* Body */}
      <div className="rounded-b-xl border border-[var(--color-b0)] border-t-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-[var(--color-t4)]">没有找到匹配的客户</p>
            <p className="text-[12px] mt-1 text-[var(--color-t4)] opacity-50">试试调整搜索条件</p>
          </div>
        ) : (
          filtered.map(c => {
            const st = STATUS_CFG[c.status];
            const daysSince = Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000);
            const hc = healthColor(c.healthScore);
            return (
              <div
                key={c.id}
                onClick={() => onCustomerClick(c.id)}
                className="grid grid-cols-12 gap-3 px-4 py-3 cursor-pointer transition-colors items-center hover:bg-[var(--color-surface-2)]"
                style={{
                  borderBottom: '1px solid var(--color-b0)',
                  gridTemplateColumns: '4fr 2fr 1fr 1fr 2fr 1fr 1fr',
                }}
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0"
                    style={{
                      background: st.variant === 'ok' ? 'rgba(34,197,94,0.15)' : st.variant === 'warn' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: st.variant === 'ok' ? '#22c55e' : st.variant === 'warn' ? '#f59e0b' : '#ef4444',
                      border: '1px solid',
                      borderColor: st.variant === 'ok' ? 'rgba(34,197,94,0.25)' : st.variant === 'warn' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)',
                    }}
                  >
                    {c.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate text-[var(--color-t1)]">{c.name}</p>
                    <p className="text-[11px] truncate text-[var(--color-t4)]">{c.contact} · {c.phone}</p>
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <p className="text-[12px] text-[var(--color-t2)]">{c.industry}</p>
                  <p className="text-[10px] text-[var(--color-t4)]">{c.taxpayerType}</p>
                </div>

                {/* Health score */}
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${hc}`} />
                  <span className={`text-[14px] font-bold mono ${hc}`}>{c.healthScore}</span>
                </div>

                {/* Revenue */}
                <div className="text-center">
                  <span className="text-[13px] mono text-[var(--color-t2)]">¥{c.monthlyRevenue}万</span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1">
                  {c.services.slice(0, 2).map(s => (
                    <span
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}
                    >
                      {s}
                    </span>
                  ))}
                  {c.services.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-t4)]">
                      +{c.services.length - 2}
                    </span>
                  )}
                </div>

                {/* Last contact */}
                <div className="text-center">
                  <span
                    className={[
                      'text-[11px]',
                      daysSince > 30 ? 'text-red-400' : daysSince > 14 ? 'text-amber-400' : 'text-[var(--color-t3)]',
                    ].join(' ')}
                  >
                    {daysSince}天前
                  </span>
                </div>

                {/* Status */}
                <div><Badge variant={st.variant}>{st.label}</Badge></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
