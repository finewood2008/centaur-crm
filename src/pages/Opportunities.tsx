import { useState } from 'react';
import { Sparkles, TrendingUp, MessageSquare, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
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

const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
  new:       { text: '新发现', cls: 'badge badge-info' },
  following: { text: '跟进中', cls: 'badge badge-warn' },
  won:       { text: '已成交', cls: 'badge badge-ok' },
  lost:      { text: '已失败', cls: 'badge badge-neutral' },
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

  return (
    <div className="p-6 max-w-[1100px] mx-auto anim-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-t1)' }}>
            <Sparkles size={22} style={{ color: 'var(--color-warn)' }} /> 商机引擎
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-t4)' }}>
            AI 基于客户画像自动发现销售机会
          </p>
        </div>
        {/* Total value card */}
        <div
          className="card px-5 py-3 text-center"
          style={{
            background: 'var(--color-surface-2)',
            boxShadow: '0 0 30px rgba(236,126,0,0.08)',
          }}
        >
          <p className="metric" style={{ color: 'var(--color-warn)', fontSize: '22px' }}>
            ¥{totalValue.toLocaleString()}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--color-t4)' }}>预估总价值</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group mb-5 w-fit">
        {STATUS_TABS.map(s => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`tab-item flex items-center gap-1 ${tab === s.key ? 'active' : ''}`}
          >
            {s.label}
            {s.key !== 'all' && (
              <span className="text-[10px]" style={{ color: 'var(--color-t4)', marginLeft: 4 }}>
                {opps.filter(o => o.status === s.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4 stagger">
        {filtered.length === 0 ? (
          <div className="py-16 text-center card">
            <p className="text-[14px]" style={{ color: 'var(--color-t4)' }}>暂无商机</p>
          </div>
        ) : filtered.map(o => {
          const sl = STATUS_BADGE[o.status] || STATUS_BADGE.lost;
          const expanded = expandedId === o.id;
          return (
            <div
              key={o.id}
              className="card overflow-hidden transition-all"
              style={{
                background: 'var(--color-surface-1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px rgba(94,106,210,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-b1)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[14px] font-bold" style={{ color: 'var(--color-t1)' }}>{o.customerName}</span>
                      <span className={sl.cls} style={{ fontSize: '10px' }}>{sl.text}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={14} style={{ color: 'var(--color-warn)' }} />
                      <span className="text-[14px] font-medium" style={{ color: 'var(--color-accent-bright)' }}>{o.service}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-t3)' }}>{o.reason}</p>
                  </div>
                  <div className="text-right ml-6 shrink-0">
                    <p className="mono text-[22px] font-bold" style={{ color: 'var(--color-warn)' }}>
                      ¥{o.estimatedValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-t4)' }}>预估年增收</p>
                  </div>
                </div>

                {/* Confidence bar with gradient fill */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} style={{ color: 'var(--color-t4)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--color-t4)' }}>AI置信度</span>
                  </div>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden max-w-[200px]"
                    style={{ background: 'var(--color-b1)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${o.confidence}%`,
                        background: o.confidence >= 85
                          ? 'linear-gradient(90deg, var(--color-ok), #34d399)'
                          : 'linear-gradient(90deg, var(--color-warn), var(--color-accent-bright))',
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-medium mono" style={{ color: 'var(--color-t2)' }}>{o.confidence}%</span>
                  <div className="flex-1" />

                  {/* Expand talk script */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : o.id)}
                    className="flex items-center gap-1 text-[12px] transition-colors"
                    style={{ color: 'var(--color-accent-bright)' }}
                  >
                    <MessageSquare size={13} />
                    {expanded ? '收起话术' : '查看话术'}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Status progression button */}
                  {o.status === 'won' ? (
                    <span className="flex items-center gap-1 text-[12px]" style={{ color: 'var(--color-ok)' }}>
                      <CheckCircle2 size={14} /> 已成交
                    </span>
                  ) : (
                    <button
                      onClick={() => advanceStatus(o.id)}
                      className="text-[12px] px-4 py-1.5 rounded-lg transition-all"
                      style={{
                        background: 'var(--color-accent)',
                        color: '#fff',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
                    >
                      {o.status === 'new' ? '开始跟进' : '标记成交'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable talk script */}
              {expanded && (
                <div className="px-5 pb-5 anim-fade-in">
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-b1)',
                    }}
                  >
                    <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--color-accent-bright)' }}>
                      💡 AI建议话术
                    </p>
                    <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--color-t2)' }}>
                      "{o.suggestedTalk}"
                    </p>
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
