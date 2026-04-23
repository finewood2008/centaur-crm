import { useState, useMemo } from 'react';
import { Users, Search, ArrowUpDown } from 'lucide-react';
import { CUSTOMERS } from '../mock';

interface Props {
  onCustomerClick: (id: string) => void;
}

const STATUS_CFG: Record<string, { label: string; badge: string; glow: string }> = {
  active:    { label: '正常', badge: 'badge badge-ok',   glow: 'var(--color-ok)' },
  attention: { label: '关注', badge: 'badge badge-warn', glow: 'var(--color-warn)' },
  risk:      { label: '风险', badge: 'badge badge-bad',  glow: 'var(--color-bad)' },
};

type SortKey = 'name' | 'healthScore' | 'monthlyRevenue' | 'lastContact';

export default function Customers({ onCustomerClick }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('healthScore');
  const [sortAsc, setSortAsc] = useState(false);

  const assignees = [...new Set(CUSTOMERS.map(c => c.assignedTo))];

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
    score >= 80 ? 'var(--color-ok)' : score >= 60 ? 'var(--color-warn)' : 'var(--color-bad)';

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '正常' },
    { key: 'attention', label: '关注' },
    { key: 'risk', label: '风险' },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto anim-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-t1)' }}>
            <Users size={22} style={{ color: 'var(--color-accent-bright)' }} /> 客户管理
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-t4)' }}>
            共 {CUSTOMERS.length} 个客户 · 筛选出 {filtered.length} 个
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-t4)' }} />
          <input
            type="text"
            placeholder="搜索企业名、联系人、行业、标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg focus:outline-none transition-all"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-b1)',
              color: 'var(--color-t1)',
            }}
          />
        </div>

        {/* Status tabs */}
        <div className="tab-group">
          {statusTabs.map(s => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`tab-item ${statusFilter === s.key ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Assignee select */}
        <select
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          className="text-[12px] px-3 py-1.5 rounded-lg focus:outline-none transition-colors cursor-pointer"
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

      {/* Table header */}
      <div
        className="rounded-t-xl px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-medium uppercase tracking-wider"
        style={{
          background: 'var(--color-surface-2)',
          borderBottom: '1px solid var(--color-b0)',
          color: 'var(--color-t4)',
        }}
      >
        <div
          className="col-span-4 flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-100"
          style={{ opacity: sortKey === 'name' ? 1 : 0.6 }}
          onClick={() => handleSort('name')}
        >
          企业名称 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-2" style={{ opacity: 0.6 }}>行业 · 类型</div>
        <div
          className="col-span-1 text-center cursor-pointer transition-opacity hover:opacity-100"
          style={{ opacity: sortKey === 'healthScore' ? 1 : 0.6 }}
          onClick={() => handleSort('healthScore')}
        >
          健康分 <ArrowUpDown size={10} />
        </div>
        <div
          className="col-span-1 text-center cursor-pointer transition-opacity hover:opacity-100"
          style={{ opacity: sortKey === 'monthlyRevenue' ? 1 : 0.6 }}
          onClick={() => handleSort('monthlyRevenue')}
        >
          月营收 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-2" style={{ opacity: 0.6 }}>服务项目</div>
        <div
          className="col-span-1 cursor-pointer transition-opacity hover:opacity-100"
          style={{ opacity: sortKey === 'lastContact' ? 1 : 0.6 }}
          onClick={() => handleSort('lastContact')}
        >
          最近联系 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-1" style={{ opacity: 0.6 }}>状态</div>
      </div>

      {/* Customer rows */}
      <div
        className="rounded-b-xl stagger"
        style={{
          border: '1px solid var(--color-b0)',
          borderTop: 'none',
        }}
      >
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px]" style={{ color: 'var(--color-t4)' }}>没有找到匹配的客户</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--color-t4)', opacity: 0.5 }}>试试调整搜索条件</p>
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
                className="grid grid-cols-12 gap-3 px-4 py-3 cursor-pointer transition-all items-center"
                style={{
                  borderBottom: '1px solid var(--color-b0)',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-2)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 0 60px ${st.glow}08`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Name + contact */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0"
                    style={{
                      background: `${st.glow}20`,
                      color: st.glow,
                      border: `1px solid ${st.glow}30`,
                    }}
                  >
                    {c.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-t1)' }}>{c.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--color-t4)' }}>{c.contact} · {c.phone}</p>
                  </div>
                </div>

                {/* Industry */}
                <div className="col-span-2">
                  <p className="text-[12px]" style={{ color: 'var(--color-t2)' }}>{c.industry}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-t4)' }}>{c.taxpayerType}</p>
                </div>

                {/* Health score with glow dot */}
                <div className="col-span-1 text-center flex items-center justify-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: hc,
                      boxShadow: `0 0 6px ${hc}80`,
                    }}
                  />
                  <span className="text-[14px] font-bold mono" style={{ color: hc }}>{c.healthScore}</span>
                </div>

                {/* Revenue */}
                <div className="col-span-1 text-center">
                  <span className="text-[13px] mono" style={{ color: 'var(--color-t2)' }}>¥{c.monthlyRevenue}万</span>
                </div>

                {/* Services */}
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {c.services.slice(0, 2).map(s => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: 'var(--color-accent-muted)',
                          color: 'var(--color-accent-hover)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                    {c.services.length > 2 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--color-surface-3)', color: 'var(--color-t4)' }}
                      >
                        +{c.services.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Last contact */}
                <div className="col-span-1">
                  <span
                    className="text-[11px]"
                    style={{
                      color: daysSince > 30 ? 'var(--color-bad)' : daysSince > 14 ? 'var(--color-warn)' : 'var(--color-t3)',
                    }}
                  >
                    {daysSince}天前
                  </span>
                </div>

                {/* Status badge */}
                <div className="col-span-1">
                  <span className={st.badge} style={{ fontSize: '10px' }}>{st.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
