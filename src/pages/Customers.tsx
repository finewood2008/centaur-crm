import { useState, useMemo } from 'react';
import { Users, Search, Filter, ArrowUpDown } from 'lucide-react';
import { CUSTOMERS } from '../mock';

interface Props {
  onCustomerClick: (id: string) => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active: { label: '正常', color: 'bg-emerald-50 text-emerald-600' },
  attention: { label: '关注', color: 'bg-amber-50 text-amber-600' },
  risk: { label: '风险', color: 'bg-red-50 text-red-600' },
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

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> 客户管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">共 {CUSTOMERS.length} 个客户 · 筛选出 {filtered.length} 个</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索企业名、联系人、行业、标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {[{ key: 'all', label: '全部' }, { key: 'active', label: '正常' }, { key: 'attention', label: '关注' }, { key: 'risk', label: '风险' }].map(s => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${
                statusFilter === s.key ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
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

      {/* Table header */}
      <div className="bg-slate-50 rounded-t-lg border border-slate-200 px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
        <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-slate-700" onClick={() => handleSort('name')}>
          企业名称 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-2">行业 · 类型</div>
        <div className="col-span-1 text-center cursor-pointer hover:text-slate-700" onClick={() => handleSort('healthScore')}>
          健康分 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-1 text-center cursor-pointer hover:text-slate-700" onClick={() => handleSort('monthlyRevenue')}>
          月营收 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-2">服务项目</div>
        <div className="col-span-1 cursor-pointer hover:text-slate-700" onClick={() => handleSort('lastContact')}>
          最近联系 <ArrowUpDown size={10} />
        </div>
        <div className="col-span-1">状态</div>
      </div>

      {/* Customer rows */}
      <div className="border-x border-b border-slate-200 rounded-b-lg divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-slate-400">没有找到匹配的客户</p>
            <p className="text-[12px] text-slate-300 mt-1">试试调整搜索条件</p>
          </div>
        ) : (
          filtered.map(c => {
            const st = STATUS_LABEL[c.status];
            const daysSince = Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000);
            return (
              <div
                key={c.id}
                onClick={() => onCustomerClick(c.id)}
                className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-blue-50/30 cursor-pointer transition-colors items-center"
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold text-white shrink-0 ${
                    c.status === 'active' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    c.status === 'attention' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                    'bg-gradient-to-br from-red-500 to-rose-500'
                  }`}>
                    {c.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.contact} · {c.phone}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-[12px] text-slate-700">{c.industry}</p>
                  <p className="text-[10px] text-slate-400">{c.taxpayerType}</p>
                </div>
                <div className="col-span-1 text-center">
                  <span className={`text-[14px] font-bold ${
                    c.healthScore >= 80 ? 'text-emerald-600' : c.healthScore >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>{c.healthScore}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-[13px] text-slate-700">¥{c.monthlyRevenue}万</span>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {c.services.slice(0, 2).map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{s}</span>
                    ))}
                    {c.services.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400">+{c.services.length - 2}</span>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`text-[11px] ${daysSince > 30 ? 'text-red-500' : daysSince > 14 ? 'text-amber-500' : 'text-slate-500'}`}>
                    {daysSince}天前
                  </span>
                </div>
                <div className="col-span-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
