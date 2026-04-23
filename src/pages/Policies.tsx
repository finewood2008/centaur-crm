import { useState } from 'react';
import { Radar, AlertTriangle, ChevronDown, ChevronUp, Users, ExternalLink } from 'lucide-react';
import { POLICIES, CUSTOMERS } from '../mock';

const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
  tax: { label: '税务', color: 'bg-blue-50 text-blue-600' },
  social_security: { label: '社保', color: 'bg-purple-50 text-purple-600' },
  business: { label: '工商', color: 'bg-emerald-50 text-emerald-600' },
  subsidy: { label: '补贴', color: 'bg-amber-50 text-amber-600' },
};

const IMPACT_STYLE = {
  high: { label: '高影响', color: 'bg-red-50 text-red-600 border-red-100' },
  medium: { label: '中影响', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  low: { label: '低影响', color: 'bg-slate-50 text-slate-600 border-slate-100' },
};

export default function Policies() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Radar size={22} className="text-cyan-600" /> 政策雷达
        </h1>
        <p className="text-sm text-slate-500 mt-1">AI 实时监控财税政策变化，自动匹配受影响客户</p>
      </div>

      {/* Stats bar */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100/50 p-4 mb-6 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Radar size={16} className="text-cyan-600" />
          <span className="text-[13px] text-slate-700">正在监控</span>
          <span className="text-[13px] font-bold text-cyan-600">4个政策源</span>
        </div>
        <div className="w-px h-5 bg-cyan-200" />
        <span className="text-[13px] text-slate-700">未读 <span className="font-bold text-red-500">{POLICIES.filter(p => !p.isRead).length}</span> 条</span>
        <div className="w-px h-5 bg-cyan-200" />
        <span className="text-[13px] text-slate-700">共 <span className="font-bold text-slate-900">{POLICIES.length}</span> 条政策更新</span>
      </div>

      {/* Policy list */}
      <div className="space-y-4">
        {POLICIES.map(p => {
          const expanded = expandedId === p.id;
          const cat = CATEGORY_LABEL[p.category];
          const impact = IMPACT_STYLE[p.impact];
          const affectedCustomers = CUSTOMERS.filter(c => p.affectedCustomerIds.includes(c.id));

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                !p.isRead ? 'border-cyan-200 ring-1 ring-cyan-100' : 'border-slate-100'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {!p.isRead && <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shrink-0" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${impact.color}`}>{impact.label}</span>
                      <span className="text-[11px] text-slate-400 ml-auto">{p.source} · {p.publishDate}</span>
                    </div>
                    <h2 className="text-[14px] font-bold text-slate-900 mb-2">{p.title}</h2>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{p.summary}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[12px] text-cyan-600 font-medium flex items-center gap-1">
                        <Users size={13} />
                        影响 {p.affectedCount} 个客户
                      </span>
                      <button
                        onClick={() => setExpandedId(expanded ? null : p.id)}
                        className="text-[12px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                      >
                        {expanded ? '收起' : '查看详情'}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {expanded && (
                <div className="px-5 pb-5 border-t border-slate-50 pt-4">
                  {/* Action suggestion */}
                  <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100/50 mb-4">
                    <p className="text-[11px] text-amber-600 font-medium mb-1">🤖 AI 建议行动</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{p.actionSuggestion}</p>
                  </div>

                  {/* Affected customers */}
                  <div>
                    <p className="text-[12px] font-medium text-slate-700 mb-2">受影响客户</p>
                    <div className="grid grid-cols-2 gap-2">
                      {affectedCustomers.map(c => (
                        <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white
                            ${c.status === 'active' ? 'bg-blue-500' : c.status === 'attention' ? 'bg-amber-500' : 'bg-red-500'}`}>
                            {c.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-slate-700 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.contact} · {c.taxpayerType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button className="text-[12px] px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                      标记已读
                    </button>
                    <button className="text-[12px] px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      一键通知客户
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
