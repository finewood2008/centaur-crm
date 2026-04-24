import { useState } from 'react';
import { Radar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Card, Badge, Button, SectionHeader } from '../components/ui';
import { POLICIES, CUSTOMERS } from '../mock';

/* ── category mapping ──────────────────────────── */

const CATEGORY_META: Record<string, { label: string; variant: 'accent' | 'ok' | 'warn' | 'info' }> = {
  tax:             { label: '税务', variant: 'info' },
  social_security: { label: '社保', variant: 'accent' },
  business:        { label: '工商', variant: 'ok' },
  subsidy:         { label: '补贴', variant: 'warn' },
};

const IMPACT_META: Record<string, { label: string; variant: 'bad' | 'warn' | 'default' }> = {
  high:   { label: '高影响', variant: 'bad' },
  medium: { label: '中影响', variant: 'warn' },
  low:    { label: '低影响', variant: 'default' },
};

/* ── component ─────────────────────────────────── */

export default function Policies() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = POLICIES.filter(p => !p.isRead).length;

  return (
    <div className="anim-fade-in p-6 max-w-[1100px] mx-auto">
      {/* ── Header ── */}
      <SectionHeader
        icon={<Radar size={18} className="text-[var(--color-accent)]" />}
        title="政策雷达"
        className="mb-1"
      />
      <p className="text-sm mt-1 mb-6 text-[var(--color-t3)]">
        AI 实时监控财税政策变化，自动匹配受影响客户
      </p>

      {/* ── Stats Banner ── */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-6 flex-wrap"
        style={{
          background: 'linear-gradient(135deg, rgba(250,165,55,0.10) 0%, rgba(250,165,55,0.03) 100%)',
          border: '1px solid var(--color-b1)',
        }}
      >
        <div className="flex items-center gap-2">
          <Radar size={16} className="text-[var(--color-accent)]" />
          <span className="text-[13px] text-[var(--color-t2)]">正在监控</span>
          <span className="text-[13px] font-bold text-[var(--color-accent)]">4个政策源</span>
        </div>
        <div className="w-px h-5 bg-[var(--color-b1)]" />
        <span className="text-[13px] text-[var(--color-t2)]">
          未读{' '}
          <span className="font-bold text-red-400">{unreadCount}</span>
          {' '}条
        </span>
        <div className="w-px h-5 bg-[var(--color-b1)]" />
        <span className="text-[13px] text-[var(--color-t2)]">
          共{' '}
          <span className="font-bold text-[var(--color-t1)]">{POLICIES.length}</span>
          {' '}条政策更新
        </span>
      </div>

      {/* ── Policy List ── */}
      <div className="stagger space-y-4">
        {POLICIES.map(p => {
          const expanded = expandedId === p.id;
          const cat = CATEGORY_META[p.category];
          const impact = IMPACT_META[p.impact];
          const affectedCustomers = CUSTOMERS.filter(c => p.affectedCustomerIds.includes(c.id));

          return (
            <Card
              key={p.id}
              padding="none"
              className="overflow-hidden"
              style={{
                borderColor: !p.isRead ? 'var(--color-accent)' : undefined,
                boxShadow: !p.isRead ? '0 0 20px rgba(250,165,55,0.08)' : undefined,
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  {!p.isRead && (
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0 anim-breathe"
                      style={{
                        background: 'var(--color-accent)',
                        boxShadow: '0 0 6px var(--color-accent)',
                      }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={cat.variant}>{cat.label}</Badge>
                      <Badge variant={impact.variant}>{impact.label}</Badge>
                      <span className="mono text-[11px] ml-auto flex items-center gap-1 text-[var(--color-t4)]">
                        {p.source} · {p.publishDate}
                      </span>
                    </div>

                    {/* Title + summary */}
                    <h2 className="text-[14px] font-bold mb-2 text-[var(--color-t1)]">
                      {p.title}
                    </h2>
                    <p className="text-[13px] leading-relaxed text-[var(--color-t3)]">
                      {p.summary}
                    </p>

                    {/* Bottom actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[12px] font-medium flex items-center gap-1 text-[var(--color-accent)]">
                        <Users size={13} />
                        影响 {p.affectedCount} 个客户
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(expanded ? null : p.id)}
                        className="ml-auto"
                      >
                        {expanded ? '收起' : '查看详情'}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="px-5 pb-5 pt-3 border-t border-[var(--color-b0)] anim-fade-in">
                  {/* AI suggestion */}
                  <Card padding="md" hover={false} className="mb-4">
                    <p className="text-[11px] font-medium mb-1 flex items-center gap-1 text-[var(--color-amber)]">
                      <span role="img" aria-label="robot">🤖</span> AI 建议行动
                    </p>
                    <p className="text-[13px] leading-relaxed text-[var(--color-t2)]">
                      {p.actionSuggestion}
                    </p>
                  </Card>

                  {/* Affected customers */}
                  <div className="mb-4">
                    <SectionHeader
                      icon={<Users size={13} className="text-[var(--color-t3)]" />}
                      title="受影响客户"
                      className="mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {affectedCustomers.map(c => {
                        const avatarColor =
                          c.status === 'active'
                            ? 'var(--color-accent)'
                            : c.status === 'attention'
                              ? 'var(--color-warn)'
                              : 'var(--color-bad)';

                        return (
                          <Card
                            key={c.id}
                            padding="sm"
                            hover={false}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                              style={{
                                background: `color-mix(in srgb, ${avatarColor} 20%, transparent)`,
                                color: avatarColor,
                                border: `1px solid color-mix(in srgb, ${avatarColor} 30%, transparent)`,
                              }}
                            >
                              {c.name.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] truncate text-[var(--color-t2)]">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-[var(--color-t4)]">
                                {c.contact} · {c.taxpayerType}
                              </p>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm">
                      标记已读
                    </Button>
                    <Button variant="primary" size="sm">
                      一键通知客户
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
