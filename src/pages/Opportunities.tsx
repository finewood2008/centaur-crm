import { useState } from 'react';
import { Sparkles, TrendingUp, MessageSquare, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge, SectionHeader, Button, TabGroup } from '../components/ui';
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

const STATUS_BADGE: Record<string, { text: string; variant: 'info' | 'warn' | 'ok' | 'bad' }> = {
  new:       { text: '新发现', variant: 'info' },
  following: { text: '跟进中', variant: 'warn' },
  won:       { text: '已成交', variant: 'ok' },
  lost:      { text: '已失败', variant: 'bad' },
};

function ConfidenceBar({ value }: { value: number }) {
  const gradient = value >= 85
    ? 'linear-gradient(90deg, var(--color-ok), #34d399)'
    : 'linear-gradient(90deg, var(--color-warn), var(--color-accent-bright))';
  return (
    <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--color-b0)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, background: gradient }}
        />
      </div>
    </div>
  );
}

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

  const tabItems = STATUS_TABS.map(t => ({
    key: t.key,
    label: t.label,
    badge: t.key !== 'all' ? opps.filter(o => o.status === t.key).length : undefined,
  }));

  return (
    <div className="p-6 max-w-[1100px] mx-auto anim-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <SectionHeader
          icon={<Sparkles size={18} className="text-[var(--color-warn)]" />}
          title="商机引擎 — AI 基于客户画像自动发现销售机会"
          className="mb-0"
        />
        {/* Total value card */}
        <Card padding="md" hover={false} className="text-center shrink-0 ml-6"
          style={{ boxShadow: '0 0 30px rgba(236,126,0,0.08)' }}>
          <p className="mono text-[22px] font-bold text-[var(--color-warn)]">
            ¥{totalValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--color-t4)] mt-0.5">预估总价值</p>
        </Card>
      </div>

      {/* Tabs */}
      <TabGroup
        items={tabItems}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      {/* Cards */}
      <div className="space-y-3 stagger">
        {filtered.length === 0 ? (
          <Card padding="lg" hover={false} className="py-16 text-center">
            <p className="text-[14px] text-[var(--color-t4)]">暂无商机</p>
          </Card>
        ) : filtered.map(o => {
          const sl = STATUS_BADGE[o.status] || STATUS_BADGE.lost;
          const expanded = expandedId === o.id;
          return (
            <div
              key={o.id}
              className="relative transition-all duration-150"
            >
              <Card padding="md" className="block">
                <div className="flex items-start justify-between">
                  {/* Left content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[14px] font-bold text-[var(--color-t1)] truncate">
                        {o.customerName}
                      </span>
                      <Badge variant={sl.variant}>{sl.text}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-[var(--color-warn)] shrink-0" />
                      <span className="text-[14px] font-medium text-[var(--color-accent-bright)]">
                        {o.service}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-[var(--color-t3)] line-clamp-2">
                      {o.reason}
                    </p>
                  </div>
                  {/* Value */}
                  <div className="text-right ml-6 shrink-0">
                    <p className="mono text-[22px] font-bold text-[var(--color-warn)]">
                      ¥{o.estimatedValue.toLocaleString()}
                    </p>
                    <p className="text-[11px] mt-0.5 text-[var(--color-t4)]">预估年增收</p>
                  </div>
                </div>

                {/* Bottom row: confidence + actions */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--color-b0)]">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <TrendingUp size={12} className="text-[var(--color-t4)]" />
                    <span className="text-[11px] text-[var(--color-t4)]">AI置信度</span>
                  </div>
                  <ConfidenceBar value={o.confidence} />
                  <span className="text-[12px] font-medium mono text-[var(--color-t2)] shrink-0">
                    {o.confidence}%
                  </span>

                  <div className="flex-1" />

                  {/* Expand talk script button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expanded ? null : o.id)}
                    className="gap-1"
                  >
                    <MessageSquare size={13} />
                    {expanded ? '收起话术' : '查看话术'}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>

                  {/* Status progression button */}
                  {o.status === 'won' ? (
                    <span className="flex items-center gap-1 text-[12px] text-[var(--color-ok)]">
                      <CheckCircle2 size={14} /> 已成交
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => advanceStatus(o.id)}
                    >
                      {o.status === 'new' ? '开始跟进' : '标记成交'}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Expandable talk script */}
              {expanded && (
                <div className="px-5 pb-4 anim-fade-in">
                  <div className="rounded-lg p-4 bg-[var(--color-surface-2)] border border-[var(--color-b0)]">
                    <p className="text-[11px] font-medium mb-2 text-[var(--color-accent-bright)]">
                      💡 AI建议话术
                    </p>
                    <p className="text-[13px] leading-relaxed italic text-[var(--color-t2)]">
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
