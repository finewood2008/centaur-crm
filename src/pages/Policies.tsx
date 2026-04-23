import { useState } from 'react';
import { Radar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { POLICIES, CUSTOMERS } from '../mock';

const CATEGORY_BADGE: Record<string, { label: string; cls: string }> = {
  tax:             { label: '税务', cls: 'badge badge-info' },
  social_security: { label: '社保', cls: 'badge badge-accent' },
  business:        { label: '工商', cls: 'badge badge-ok' },
  subsidy:         { label: '补贴', cls: 'badge badge-warn' },
};

const IMPACT_CFG: Record<string, { label: string; cls: string; color: string }> = {
  high:   { label: '高影响', cls: 'badge badge-bad',     color: 'var(--color-bad)' },
  medium: { label: '中影响', cls: 'badge badge-warn',    color: 'var(--color-warn)' },
  low:    { label: '低影响', cls: 'badge badge-neutral',  color: 'var(--color-t4)' },
};

export default function Policies() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = POLICIES.filter(p => !p.isRead).length;

  return (
    <div className="p-6 max-w-[1100px] mx-auto anim-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-t1)' }}>
          <Radar size={22} style={{ color: 'var(--color-info)' }} /> 政策雷达
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-t4)' }}>
          AI 实时监控财税政策变化，自动匹配受影响客户
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="card p-4 mb-6 flex items-center gap-6"
        style={{
          background: 'var(--color-surface-2)',
          boxShadow: '0 0 30px rgba(0,123,194,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <Radar size={16} style={{ color: 'var(--color-info)' }} />
          <span className="text-[13px]" style={{ color: 'var(--color-t2)' }}>正在监控</span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--color-info)' }}>4个政策源</span>
        </div>
        <div className="w-px h-5" style={{ background: 'var(--color-b1)' }} />
        <span className="text-[13px]" style={{ color: 'var(--color-t2)' }}>
          未读 <span className="font-bold" style={{ color: 'var(--color-bad)' }}>{unreadCount}</span> 条
        </span>
        <div className="w-px h-5" style={{ background: 'var(--color-b1)' }} />
        <span className="text-[13px]" style={{ color: 'var(--color-t2)' }}>
          共 <span className="font-bold" style={{ color: 'var(--color-t1)' }}>{POLICIES.length}</span> 条政策更新
        </span>
      </div>

      {/* Policy list */}
      <div className="space-y-4 stagger">
        {POLICIES.map(p => {
          const expanded = expandedId === p.id;
          const cat = CATEGORY_BADGE[p.category];
          const impact = IMPACT_CFG[p.impact];
          const affectedCustomers = CUSTOMERS.filter(c => p.affectedCustomerIds.includes(c.id));

          return (
            <div
              key={p.id}
              className="card overflow-hidden transition-all"
              style={{
                borderColor: !p.isRead ? 'var(--color-info)' : undefined,
                boxShadow: !p.isRead ? '0 0 20px rgba(0,123,194,0.08)' : undefined,
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  {!p.isRead && (
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0 anim-breathe"
                      style={{
                        background: 'var(--color-info)',
                        boxShadow: '0 0 6px var(--color-info)',
                      }}
                    />
                  )}

                  <div className="flex-1">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={cat.cls} style={{ fontSize: '10px' }}>{cat.label}</span>
                      {/* Impact severity indicator */}
                      <span className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: impact.color,
                            boxShadow: `0 0 4px ${impact.color}`,
                          }}
                        />
                        <span className={impact.cls} style={{ fontSize: '10px' }}>{impact.label}</span>
                      </span>
                      <span className="text-[11px] ml-auto" style={{ color: 'var(--color-t4)' }}>
                        {p.source} · {p.publishDate}
                      </span>
                    </div>

                    {/* Title + summary */}
                    <h2 className="text-[14px] font-bold mb-2" style={{ color: 'var(--color-t1)' }}>{p.title}</h2>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-t3)' }}>{p.summary}</p>

                    {/* Bottom actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--color-info)' }}>
                        <Users size={13} />
                        影响 {p.affectedCount} 个客户
                      </span>
                      <button
                        onClick={() => setExpandedId(expanded ? null : p.id)}
                        className="text-[12px] flex items-center gap-0.5 transition-colors"
                        style={{ color: 'var(--color-accent-bright)' }}
                      >
                        {expanded ? '收起' : '查看详情'}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="px-5 pb-5 anim-fade-in" style={{ borderTop: '1px solid var(--color-b0)' }}>
                  <div className="pt-4">
                    {/* AI suggestion */}
                    <div
                      className="rounded-lg p-4 mb-4"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-b1)',
                      }}
                    >
                      <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--color-warn)' }}>
                        🤖 AI 建议行动
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-t2)' }}>
                        {p.actionSuggestion}
                      </p>
                    </div>

                    {/* Affected customers with avatars */}
                    <div>
                      <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--color-t2)' }}>受影响客户</p>
                      <div className="grid grid-cols-2 gap-2">
                        {affectedCustomers.map(c => {
                          const avatarColor = c.status === 'active' ? 'var(--color-accent)' : c.status === 'attention' ? 'var(--color-warn)' : 'var(--color-bad)';
                          return (
                            <div
                              key={c.id}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                              style={{
                                background: 'var(--color-surface-1)',
                                border: '1px solid var(--color-b0)',
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{
                                  background: `${avatarColor}20`,
                                  color: avatarColor,
                                  border: `1px solid ${avatarColor}30`,
                                }}
                              >
                                {c.name.slice(0, 1)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] truncate" style={{ color: 'var(--color-t2)' }}>{c.name}</p>
                                <p className="text-[10px]" style={{ color: 'var(--color-t4)' }}>{c.contact} · {c.taxpayerType}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        className="text-[12px] px-4 py-1.5 rounded-lg transition-colors"
                        style={{
                          border: '1px solid var(--color-b1)',
                          color: 'var(--color-t3)',
                          background: 'transparent',
                        }}
                      >
                        标记已读
                      </button>
                      <button
                        className="text-[12px] px-4 py-1.5 rounded-lg transition-all"
                        style={{
                          background: 'var(--color-accent)',
                          color: '#fff',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
                      >
                        一键通知客户
                      </button>
                    </div>
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
