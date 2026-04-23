import { useState } from 'react';
import { Lightbulb, Sparkles, TrendingUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import { OPPORTUNITIES as INIT_OPPS } from '../mock';
import type { Opportunity } from '../types';

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'new', label: '新发现' },
  { key: 'following', label: '跟进中' },
  { key: 'won', label: '已成交' },
];

const STATUS_FLOW: Record<string, Opportunity['status']> = {
  new: 'following',
  following: 'won',
};

export default function Opportunities() {
  const [opps, setOpps] = useState<Opportunity[]>([...INIT_OPPS]);
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const advanceStatus = (id: string) => {
    setOpps(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = STATUS_FLOW[o.status];
      return next ? { ...o, status: next } : o;
    }));
  };

  const filtered = opps.filter(o => tab === 'all' || o.status === tab);
  const totalValue = filtered.reduce((s, o) => s + o.estimatedValue, 0);

  const statusLabel = (s: string) => {
    if (s === 'new') return { text: '新发现', color: 'bg-blue-50 text-blue-600' };
    if (s === 'following') return { text: '跟进中', color: 'bg-amber-50 text-amber-600' };
    if (s === 'won') return { text: '已成交', color: 'bg-emerald-50 text-emerald-600' };
    return { text: '已失败', color: 'bg-slate-50 text-slate-600' };
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={22} className="text-amber-500" /> 商机引擎
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI 基于客户画像自动发现销售机会</p>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl px-5 py-3 text-center">
          <p className="text-[20px] font-bold text-amber-600">¥{totalValue.toLocaleString()}</p>
          <p className="text-[11px] text-amber-500">预估总价值</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 mb-5 w-fit">
        {STATUS_TABS.map(s => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`px-4 py-1.5 text-[12px] rounded-md transition-all ${
              tab === s.key ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {s.label}
            {s.key !== 'all' && (
              <span className="ml-1.5 text-[10px] text-slate-400">
                {opps.filter(o => o.status === s.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-100">
            <p className="text-[14px] text-slate-400">暂无商机</p>
          </div>
        ) : filtered.map(o => {
          const sl = statusLabel(o.status);
          return (
            <div
              key={o.id}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[14px] font-bold text-slate-900">{o.customerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${sl.color}`}>{sl.text}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={14} className="text-amber-500" />
                      <span className="text-[14px] font-medium text-blue-600">{o.service}</span>
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{o.reason}</p>
                  </div>
                  <div className="text-right ml-6 shrink-0">
                    <p className="text-[22px] font-bold text-amber-600">¥{o.estimatedValue.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-1">预估年增收</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-slate-400" />
                    <span className="text-[11px] text-slate-400">AI置信度</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden max-w-[200px]">
                    <div
                      className={`h-full rounded-full ${o.confidence >= 85 ? 'bg-gradient-to-r from-emerald-400 to-green-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                      style={{ width: `${o.confidence}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-slate-600">{o.confidence}%</span>
                  <div className="flex-1" />
                  <button
                    onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-700"
                  >
                    <MessageSquare size={13} />
                    {expandedId === o.id ? '收起话术' : '查看话术'}
                  </button>
                  {o.status === 'won' ? (
                    <span className="flex items-center gap-1 text-[12px] text-emerald-600">
                      <CheckCircle2 size={14} /> 已成交
                    </span>
                  ) : (
                    <button
                      onClick={() => advanceStatus(o.id)}
                      className="text-[12px] px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      {o.status === 'new' ? '开始跟进' : '标记成交'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded talk script */}
              {expandedId === o.id && (
                <div className="px-5 pb-5">
                  <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/30 rounded-lg p-4 border border-blue-100/50">
                    <p className="text-[11px] text-blue-500 font-medium mb-2">💡 AI建议话术</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed italic">"{o.suggestedTalk}"</p>
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
