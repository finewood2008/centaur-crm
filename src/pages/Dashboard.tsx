import {
  Users, AlertTriangle, CalendarClock, Lightbulb, TrendingUp,
  Radar, ArrowRight, Clock, Sparkles, ShieldAlert, ArrowUpRight,
  ArrowDownRight, Activity, Zap,
} from 'lucide-react';
import { DASHBOARD_STATS, TASKS, OPPORTUNITIES, POLICIES, CUSTOMERS, CUSTOMER_EVENTS } from '../mock';
import type { NavItem } from '../types';

interface Props {
  onNavigate: (tab: NavItem) => void;
}

/* ── helpers ─────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早上好';
  if (h < 18) return '下午好';
  return '晚上好';
}

function getSummary(): string {
  const parts: string[] = [];
  if (DASHBOARD_STATS.overdueTasks > 0) {
    parts.push(`${DASHBOARD_STATS.overdueTasks}项逾期待办需要立即处理`);
  }
  if (DASHBOARD_STATS.newOpportunities > 0) {
    parts.push(`AI发现${DASHBOARD_STATS.newOpportunities}个新商机`);
  }
  if (DASHBOARD_STATS.unreadPolicies > 0) {
    parts.push(`${DASHBOARD_STATS.unreadPolicies}条未读政策`);
  }
  return parts.join('，') + '。';
}

/* ── KPI card ────────────────────────────────── */

function KPICard({ icon: Icon, label, value, trend, trendLabel, accentColor }: {
  icon: typeof Users;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accentColor: string;
}) {
  const trendColor = trend === 'up'
    ? 'var(--color-ok)'
    : trend === 'down'
      ? 'var(--color-bad)'
      : 'var(--color-t4)';

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;

  return (
    <div className="card p-5 flex flex-col gap-3 group cursor-default">
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accentColor, opacity: 0.9 }}
        >
          <Icon size={16} style={{ color: 'var(--color-t1)' }} />
        </div>
        {trend && trendLabel && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon size={13} />
            <span className="text-[11px] font-medium">{trendLabel}</span>
          </div>
        )}
      </div>
      <div>
        <p className="metric" style={{ color: 'var(--color-t1)' }}>{value}</p>
        <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-t3)' }}>{label}</p>
      </div>
    </div>
  );
}

/* ── section header ──────────────────────────── */

function SectionHeader({ icon: Icon, title, actionLabel, onAction, iconColor }: {
  icon: typeof Users;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: iconColor }} />
        <h2 className="text-[13px] font-semibold" style={{ color: 'var(--color-t1)' }}>{title}</h2>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--color-accent-hover)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-bright)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
        >
          {actionLabel} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

/* ── main dashboard ──────────────────────────── */

export default function Dashboard({ onNavigate }: Props) {
  const urgentTasks = TASKS.filter(
    t => t.status === 'overdue' || (t.status !== 'completed' && t.priority === 'high'),
  ).slice(0, 5);

  const newOpps = OPPORTUNITIES.filter(o => o.status === 'new').slice(0, 3);
  const unreadPolicies = POLICIES.filter(p => !p.isRead).slice(0, 2);
  const riskCustomers = CUSTOMERS.filter(c => c.status === 'risk');

  const recentEvents = CUSTOMER_EVENTS
    .filter(e => e.type === 'risk' || e.type === 'change')
    .slice(0, 3);

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="p-6 max-w-[1280px] mx-auto anim-fade-in">

      {/* ── Greeting ────────────────────────── */}
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-t1)' }}>
            {getGreeting()}，李会计
          </h1>
          <div className="anim-breathe">
            <Sparkles size={18} style={{ color: 'var(--color-accent-bright)' }} />
          </div>
        </div>
        <p className="text-[13px]" style={{ color: 'var(--color-t3)' }}>
          {dateStr} · {getSummary()}
        </p>
      </div>

      {/* ── KPI row ─────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger">
        <KPICard
          icon={Users}
          label="服务客户"
          value={DASHBOARD_STATS.totalCustomers}
          trend="up"
          trendLabel={`${DASHBOARD_STATS.activeCustomers}活跃`}
          accentColor="var(--color-accent)"
        />
        <KPICard
          icon={CalendarClock}
          label="待办事项"
          value={DASHBOARD_STATS.pendingTasks}
          trend={DASHBOARD_STATS.overdueTasks > 0 ? 'down' : 'neutral'}
          trendLabel={DASHBOARD_STATS.overdueTasks > 0 ? `${DASHBOARD_STATS.overdueTasks}逾期` : '按时'}
          accentColor={DASHBOARD_STATS.overdueTasks > 0 ? 'var(--color-bad)' : 'var(--color-ok)'}
        />
        <KPICard
          icon={Lightbulb}
          label="新商机"
          value={DASHBOARD_STATS.newOpportunities}
          trend="up"
          trendLabel={`¥${(DASHBOARD_STATS.totalOpportunityValue / 10000).toFixed(1)}万`}
          accentColor="var(--color-warn)"
        />
        <KPICard
          icon={TrendingUp}
          label="平均健康度"
          value={`${DASHBOARD_STATS.avgHealthScore}`}
          trend={DASHBOARD_STATS.avgHealthScore >= 70 ? 'up' : 'down'}
          trendLabel={DASHBOARD_STATS.avgHealthScore >= 70 ? '良好' : '需关注'}
          accentColor="var(--color-ok)"
        />
      </div>

      {/* ── 3-column grid ───────────────────── */}
      <div className="grid grid-cols-3 gap-5 stagger">

        {/* ── Left: urgent tasks ──────────── */}
        <div className="card p-5">
          <SectionHeader
            icon={AlertTriangle}
            title="紧急待办"
            actionLabel="查看全部"
            onAction={() => onNavigate('calendar')}
            iconColor="var(--color-bad)"
          />
          <div className="space-y-1">
            {urgentTasks.map(t => {
              const isOverdue = t.status === 'overdue';
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors"
                  style={{
                    borderLeft: isOverdue ? '2px solid var(--color-bad)' : '2px solid transparent',
                    background: isOverdue ? 'rgba(226,59,74,0.06)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isOverdue
                      ? 'rgba(226,59,74,0.10)'
                      : 'var(--color-surface-2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isOverdue
                      ? 'rgba(226,59,74,0.06)'
                      : 'transparent';
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{
                      background: isOverdue ? 'var(--color-bad)' : 'var(--color-warn)',
                      boxShadow: isOverdue ? '0 0 6px rgba(226,59,74,0.5)' : 'none',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate" style={{ color: 'var(--color-t1)' }}>
                      {t.title}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-t4)' }}>
                      {t.customerName}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isOverdue ? (
                      <span className="badge badge-bad">已逾期</span>
                    ) : (
                      <span
                        className="text-[10px] mono px-1.5 py-0.5 rounded"
                        style={{
                          color: 'var(--color-t3)',
                          background: 'var(--color-surface-2)',
                        }}
                      >
                        {t.deadline.slice(5)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: AI opportunities ────── */}
        <div className="card p-5">
          <SectionHeader
            icon={Zap}
            title="AI商机推荐"
            actionLabel="查看全部"
            onAction={() => onNavigate('opportunities')}
            iconColor="var(--color-accent-bright)"
          />
          <div className="space-y-3">
            {newOpps.map(o => (
              <div
                key={o.id}
                className="p-3.5 rounded-lg transition-all cursor-pointer"
                style={{
                  background: 'var(--color-accent-muted)',
                  border: '1px solid rgba(94,106,210,0.2)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(94,106,210,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(94,106,210,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(94,106,210,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--color-t1)' }}>
                    {o.customerName}
                  </span>
                  <span className="mono text-[12px] font-semibold" style={{ color: 'var(--color-accent-bright)' }}>
                    ¥{o.estimatedValue.toLocaleString()}
                  </span>
                </div>
                <p className="text-[12px] font-medium" style={{ color: 'var(--color-accent-hover)' }}>
                  {o.service}
                </p>
                <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--color-t4)' }}>
                  {o.reason.slice(0, 60)}…
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <div
                    className="flex-1 h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${o.confidence}%`,
                        background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))',
                      }}
                    />
                  </div>
                  <span className="mono text-[10px]" style={{ color: 'var(--color-t3)' }}>
                    {o.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: policy + churn ─────── */}
        <div className="card p-5 flex flex-col">
          <SectionHeader
            icon={Radar}
            title="政策动态"
            actionLabel="查看全部"
            onAction={() => onNavigate('policies')}
            iconColor="var(--color-info)"
          />
          <div className="space-y-3">
            {unreadPolicies.map(p => (
              <div
                key={p.id}
                className="p-3 rounded-lg transition-colors"
                style={{
                  background: 'rgba(0,123,194,0.06)',
                  border: '1px solid rgba(0,123,194,0.12)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,123,194,0.10)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,123,194,0.06)';
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: p.impact === 'high' ? 'var(--color-bad)' : 'var(--color-warn)',
                      boxShadow: p.impact === 'high' ? '0 0 6px rgba(226,59,74,0.4)' : 'none',
                    }}
                  />
                  <span className="text-[12px] font-medium line-clamp-1" style={{ color: 'var(--color-t1)' }}>
                    {p.title}
                  </span>
                </div>
                <p className="text-[11px] line-clamp-2 mt-1" style={{ color: 'var(--color-t4)' }}>
                  {p.summary.slice(0, 60)}…
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>{p.source}</span>
                  <span className="badge badge-info">
                    影响{p.affectedCount}个客户
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Churn warning ─────────────── */}
          <div
            className="mt-4 pt-4 flex-1"
            style={{ borderTop: '1px solid var(--color-b0)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={14} style={{ color: 'var(--color-bad)' }} />
              <h3 className="text-[12px] font-semibold" style={{ color: 'var(--color-t1)' }}>
                流失预警
              </h3>
              {riskCustomers.length > 0 && (
                <span className="badge badge-bad">{riskCustomers.length}</span>
              )}
            </div>
            <div className="space-y-1">
              {riskCustomers.map(c => {
                const daysSince = Math.round(
                  (Date.now() - new Date(c.lastContact).getTime()) / 86400000,
                );
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 py-2 px-2.5 rounded-lg transition-colors"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(226,59,74,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 anim-breathe"
                      style={{ background: 'var(--color-bad)' }}
                    />
                    <span className="text-[12px] flex-1" style={{ color: 'var(--color-t2)' }}>
                      {c.name}
                    </span>
                    <span className="mono text-[10px]" style={{ color: 'var(--color-bad)' }}>
                      {daysSince}天
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent signals ──────────────────── */}
      {recentEvents.length > 0 && (
        <div className="mt-6 anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="card p-5">
            <SectionHeader
              icon={Activity}
              title="最新信号"
              iconColor="var(--color-t3)"
            />
            <div className="grid grid-cols-3 gap-3">
              {recentEvents.map(ev => {
                const isRisk = ev.type === 'risk';
                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg flex items-start gap-3"
                    style={{
                      background: isRisk ? 'rgba(226,59,74,0.05)' : 'var(--color-surface-1)',
                      border: `1px solid ${isRisk ? 'rgba(226,59,74,0.12)' : 'var(--color-b0)'}`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isRisk ? 'rgba(226,59,74,0.15)' : 'var(--color-surface-3)',
                      }}
                    >
                      {isRisk
                        ? <AlertTriangle size={12} style={{ color: 'var(--color-bad)' }} />
                        : <Activity size={12} style={{ color: 'var(--color-t3)' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate" style={{ color: 'var(--color-t1)' }}>
                        {ev.customerName} · {ev.title}
                      </p>
                      <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--color-t4)' }}>
                        {ev.description}
                      </p>
                      <p className="text-[10px] mt-1 mono" style={{ color: 'var(--color-t4)' }}>
                        {ev.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
