import { useState } from 'react';
import { ArrowLeft, Building2, Phone, MapPin, Calendar, TrendingUp, Lightbulb, Clock, FileText, Users, Activity, Zap, AlertTriangle } from 'lucide-react';
import { Card, Badge, Button, SectionHeader, TabGroup } from '../components/ui';
import { CUSTOMERS, TASKS, OPPORTUNITIES, CUSTOMER_EVENTS, MONITOR_ALERTS } from '../mock';

interface Props {
  customerId: string;
  onBack: () => void;
}

const EVENT_STYLE_MAP: Record<string, { label: string; variant: 'info' | 'accent' | 'bad' | 'ok' | 'warn' | 'default'; dotColor: string }> = {
  contact:     { label: '沟通', variant: 'info',    dotColor: 'var(--color-info)' },
  change:      { label: '变更', variant: 'accent',  dotColor: 'var(--color-accent-bright)' },
  risk:        { label: '风险', variant: 'bad',     dotColor: 'var(--color-bad)' },
  service:     { label: '服务', variant: 'ok',      dotColor: 'var(--color-ok)' },
  opportunity: { label: '商机', variant: 'warn',    dotColor: 'var(--color-warn)' },
  policy:      { label: '政策', variant: 'default', dotColor: 'var(--color-t3)' },
};

function HealthRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? 'var(--color-ok)' : score >= 60 ? 'var(--color-warn)' : 'var(--color-bad)';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" strokeWidth="4"
          stroke="var(--color-b1)" />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" strokeWidth="4"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono text-[22px] font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px]" style={{ color: 'var(--color-t4)' }}>健康分</span>
      </div>
    </div>
  );
}

function TaskBadge({ status, deadline }: { status: string; deadline: string }) {
  if (status === 'overdue') return <Badge variant="bad">已逾期</Badge>;
  if (status === 'completed') return <Badge variant="ok">已完成</Badge>;
  return <Badge variant="warn">{deadline.slice(5)}</Badge>;
}

function AlertBadge({ severity }: { severity: string }) {
  if (severity === 'critical') return <Badge variant="bad">严重</Badge>;
  if (severity === 'warning') return <Badge variant="warn">警告</Badge>;
  return <Badge variant="info">信息</Badge>;
}

export default function CustomerDetail({ customerId, onBack }: Props) {
  const c = CUSTOMERS.find(c => c.id === customerId);
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!c) return (
    <div className="p-6" style={{ color: 'var(--color-t3)' }}>客户不存在</div>
  );

  const tasks = TASKS.filter(t => t.customerId === customerId);
  const opps = OPPORTUNITIES.filter(o => o.customerId === customerId);
  const events = CUSTOMER_EVENTS.filter(e => e.customerId === customerId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const alerts = MONITOR_ALERTS.filter(a => a.customerId === customerId)
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
  const daysSinceContact = Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000);

  const statusVariant = c.status === 'active' ? 'ok' : c.status === 'attention' ? 'warn' : 'bad';
  const statusColor = c.status === 'active' ? 'var(--color-ok)' : c.status === 'attention' ? 'var(--color-warn)' : 'var(--color-bad)';
  const statusLabel = c.status === 'active' ? '正常' : c.status === 'attention' ? '需关注' : '有风险';

  const tabItems = [
    { key: 'overview', label: '概览' },
    { key: 'timeline', label: '动态', badge: events.length },
    { key: 'alerts', label: '预警', badge: alerts.filter(a => !a.isHandled).length || undefined },
  ];

  return (
    <div className="p-6 max-w-[1100px] mx-auto anim-fade-in">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft size={16} /> 返回客户列表
      </Button>

      {/* Header card — intelligence briefing style */}
      <Card padding="lg" className="mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{
                background: `${statusColor}20`,
                color: statusColor,
                border: `1px solid ${statusColor}30`,
                boxShadow: `0 0 20px ${statusColor}15`,
              }}
            >
              {c.name.slice(0, 1)}
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-t1)' }}>{c.name}</h1>
              <div className="flex items-center gap-4 mt-1.5 text-[12px]" style={{ color: 'var(--color-t3)' }}>
                <span className="flex items-center gap-1"><Building2 size={12} />{c.industry} · {c.taxpayerType}</span>
                <span className="flex items-center gap-1"><Users size={12} />{c.employeeCount}人</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{c.address}</span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {c.tags.map(tag => (
                  <Badge key={tag} variant="accent" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <HealthRing score={c.healthScore} />
            <Badge variant={statusVariant} className="text-[10px]">{statusLabel}</Badge>
          </div>
        </div>

        {/* Info grid */}
        <div
          className="grid grid-cols-5 gap-4 mt-6 pt-5"
          style={{ borderTop: '1px solid var(--color-b0)' }}
        >
          {[
            { label: '联系人', value: `${c.contact}  ${c.phone}`, icon: Phone },
            { label: '注册资本', value: c.registeredCapital, icon: FileText },
            { label: '月均营收', value: `¥${c.monthlyRevenue}万`, icon: TrendingUp },
            { label: '成立日期', value: c.establishedDate, icon: Calendar },
            { label: '最近联系', value: `${daysSinceContact}天前`, icon: Clock },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-t4)' }}>
                <item.icon size={11} />{item.label}
              </p>
              <p className="text-[13px] font-medium mt-1" style={{ color: 'var(--color-t1)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tab navigation */}
      <TabGroup
        items={tabItems}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-5"
      />

      {/* ====================== OVERVIEW TAB ====================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-5 stagger">
          {/* Left column: services + tasks */}
          <div className="space-y-5">
            <Card padding="lg">
              <SectionHeader
                icon={<Zap size={14} />}
                title="当前服务"
              />
              <div className="flex flex-wrap gap-2">
                {c.services.map(s => (
                  <Badge key={s} variant="accent" className="text-[12px] px-3 py-1 rounded-lg">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card padding="lg">
              <SectionHeader
                icon={<FileText size={14} />}
                title="待办事项"
              />
              {tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {tasks.map(t => {
                    const dotColor = t.status === 'overdue' ? 'var(--color-bad)' : t.status === 'completed' ? 'var(--color-ok)' : 'var(--color-warn)';
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg"
                        style={{ background: 'var(--color-surface-1)' }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: dotColor, boxShadow: `0 0 4px ${dotColor}` }}
                          />
                          <span className="text-[13px]" style={{ color: 'var(--color-t2)' }}>{t.title}</span>
                        </div>
                        <TaskBadge status={t.status} deadline={t.deadline} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[12px] py-4 text-center" style={{ color: 'var(--color-t4)' }}>暂无待办</p>
              )}
            </Card>
          </div>

          {/* Right column: AI opportunities */}
          <Card padding="lg">
            <SectionHeader
              icon={<Lightbulb size={14} className="text-amber-400" />}
              title="AI 商机推荐"
            />
            {opps.length > 0 ? (
              <div className="space-y-4">
                {opps.map(o => (
                  <div
                    key={o.id}
                    className="p-4 rounded-lg"
                    style={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-b1)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent-bright)' }}>{o.service}</span>
                      <span className="text-[14px] font-bold mono" style={{ color: 'var(--color-warn)' }}>¥{o.estimatedValue.toLocaleString()}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--color-t3)' }}>{o.reason}</p>
                    <div
                      className="rounded-lg p-3"
                      style={{
                        background: 'var(--color-surface-1)',
                        border: '1px solid var(--color-b0)',
                      }}
                    >
                      <p className="text-[11px] mb-1" style={{ color: 'var(--color-t4)' }}>💡 建议话术</p>
                      <p className="text-[12px] leading-relaxed italic" style={{ color: 'var(--color-t2)' }}>"{o.suggestedTalk}"</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>AI置信度</span>
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-b1)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${o.confidence}%`,
                              background: `linear-gradient(90deg, var(--color-warn), var(--color-accent-bright))`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium mono" style={{ color: 'var(--color-warn)' }}>{o.confidence}%</span>
                      </div>
                      <Button variant="primary" size="sm">开始跟进</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] py-8 text-center" style={{ color: 'var(--color-t4)' }}>暂无AI推荐的商机</p>
            )}
          </Card>
        </div>
      )}

      {/* ====================== TIMELINE TAB ====================== */}
      {activeTab === 'timeline' && (
        <Card padding="lg" className="anim-fade-in">
          <SectionHeader
            icon={<Activity size={14} style={{ color: 'var(--color-accent-bright)' }} />}
            title="客户动态"
            action={{ label: '添加记录', onClick: () => {} }}
          />
          {events.length > 0 ? (
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-[11px] top-2 bottom-2 w-px"
                style={{ background: 'var(--color-b1)' }}
              />
              <div className="space-y-4">
                {events.map(e => {
                  const style = EVENT_STYLE_MAP[e.type] || EVENT_STYLE_MAP.contact;
                  return (
                    <div key={e.id} className="flex gap-4 relative">
                      {/* Colored dot */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                        style={{
                          background: `${style.dotColor}25`,
                          border: `2px solid ${style.dotColor}`,
                          boxShadow: `0 0 8px ${style.dotColor}30`,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: style.dotColor }} />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={style.variant} className="text-[10px]">{style.label}</Badge>
                          <span className="text-[11px]" style={{ color: 'var(--color-t4)' }}>{e.timestamp}</span>
                          {e.source && <span className="text-[10px]" style={{ color: 'var(--color-t4)', opacity: 0.6 }}>· {e.source}</span>}
                        </div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--color-t1)' }}>{e.title}</p>
                        <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-t3)' }}>{e.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[12px] py-8 text-center" style={{ color: 'var(--color-t4)' }}>暂无动态记录</p>
          )}
        </Card>
      )}

      {/* ====================== ALERTS TAB ====================== */}
      {activeTab === 'alerts' && (
        <Card padding="lg" className="anim-fade-in">
          <SectionHeader
            icon={<AlertTriangle size={14} style={{ color: 'var(--color-bad)' }} />}
            title="监控预警"
          />
          {alerts.length > 0 ? (
            <div className="space-y-3 stagger">
              {alerts.map(a => {
                const severityColor = a.severity === 'critical' ? 'var(--color-bad)' : a.severity === 'warning' ? 'var(--color-warn)' : 'var(--color-info)';
                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-lg"
                    style={{
                      background: 'var(--color-surface-1)',
                      borderLeft: `3px solid ${severityColor}`,
                      border: '1px solid var(--color-b0)',
                      borderLeftWidth: '3px',
                      borderLeftColor: severityColor,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertBadge severity={a.severity} />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--color-t1)' }}>{a.title}</span>
                      {a.isHandled
                        ? <span className="text-[10px] ml-auto" style={{ color: 'var(--color-ok)' }}>✓ 已处理</span>
                        : <span className="text-[10px] ml-auto" style={{ color: 'var(--color-bad)' }}>待处理</span>
                      }
                    </div>
                    <p className="text-[12px] leading-relaxed mt-1" style={{ color: 'var(--color-t3)' }}>{a.detail}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>{a.source}</span>
                      <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>{a.discoveredAt}</span>
                      {!a.isHandled && (
                        <Button variant="ghost" size="sm" className="ml-auto text-[var(--color-accent)]">标记已处理</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[12px] py-8 text-center" style={{ color: 'var(--color-t4)' }}>暂无预警信息</p>
          )}
        </Card>
      )}
    </div>
  );
}
