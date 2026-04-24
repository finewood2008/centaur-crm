import {
  Users, AlertTriangle, CalendarClock, Lightbulb, TrendingUp,
  Radar, Sparkles, ShieldAlert, ArrowUpRight, ArrowDownRight, Activity, Zap,
} from 'lucide-react';
import { Card, Badge, SectionHeader } from '../components/ui';
import { DASHBOARD_STATS, TASKS, OPPORTUNITIES, POLICIES, CUSTOMERS, CUSTOMER_EVENTS } from '../mock';
import type { NavItem } from '../types';

interface Props {
  onNavigate: (tab: NavItem) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早上好';
  if (h < 18) return '下午好';
  return '晚上好';
}

function getSummary(): string {
  const parts: string[] = [];
  if (DASHBOARD_STATS.overdueTasks > 0) parts.push(`${DASHBOARD_STATS.overdueTasks}项逾期待办需要立即处理`);
  if (DASHBOARD_STATS.newOpportunities > 0) parts.push(`AI发现${DASHBOARD_STATS.newOpportunities}个新商机`);
  if (DASHBOARD_STATS.unreadPolicies > 0) parts.push(`${DASHBOARD_STATS.unreadPolicies}条未读政策`);
  return parts.join('，') + '。';
}

function KPICard({ icon: Icon, label, value, trend, trendLabel, accent }: {
  icon: typeof Users; label: string; value: string | number;
  trend?: 'up' | 'down'; trendLabel?: string; accent: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Activity;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-[var(--color-t4)]';

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: accent, opacity: 0.9 }}
        >
          <Icon size={16} className="text-white" />
        </div>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={13} />
            <span className="text-[11px] font-medium">{trendLabel}</span>
          </div>
        )}
      </div>
      <p className="mono text-[28px] font-semibold tracking-tight leading-none text-[var(--color-t1)]">
        {value}
      </p>
      <p className="text-[12px] mt-1.5 text-[var(--color-t3)]">{label}</p>
    </Card>
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const urgentTasks = TASKS.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.priority === 'high')).slice(0, 5);
  const newOpps = OPPORTUNITIES.filter(o => o.status === 'new').slice(0, 3);
  const unreadPolicies = POLICIES.filter(p => !p.isRead).slice(0, 2);
  const riskCustomers = CUSTOMERS.filter(c => c.status === 'risk');
  const recentEvents = CUSTOMER_EVENTS.filter(e => e.type === 'risk' || e.type === 'change').slice(0, 3);

  const dateStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="p-6 max-w-[1280px] mx-auto anim-fade-in">
      {/* Greeting */}
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-[var(--color-t1)]">{getGreeting()}，李会计</h1>
          <Sparkles size={18} className="text-[var(--color-accent)] opacity-60" />
        </div>
        <p className="text-[13px] text-[var(--color-t3)]">{dateStr} · {getSummary()}</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger">
        <KPICard icon={Users} label="服务客户" value={DASHBOARD_STATS.totalCustomers} trend="up" trendLabel={`${DASHBOARD_STATS.activeCustomers}活跃`} accent="var(--color-accent)" />
        <KPICard icon={CalendarClock} label="待办事项" value={DASHBOARD_STATS.pendingTasks} trend={DASHBOARD_STATS.overdueTasks > 0 ? 'down' : undefined} trendLabel={DASHBOARD_STATS.overdueTasks > 0 ? `${DASHBOARD_STATS.overdueTasks}逾期` : '按时'} accent={DASHBOARD_STATS.overdueTasks > 0 ? 'var(--color-bad)' : 'var(--color-ok)'} />
        <KPICard icon={Lightbulb} label="新商机" value={DASHBOARD_STATS.newOpportunities} trend="up" trendLabel={`¥${(DASHBOARD_STATS.totalOpportunityValue / 10000).toFixed(1)}万`} accent="var(--color-amber)" />
        <KPICard icon={TrendingUp} label="平均健康度" value={`${DASHBOARD_STATS.avgHealthScore}`} trend={DASHBOARD_STATS.avgHealthScore >= 70 ? 'up' : 'down'} trendLabel={DASHBOARD_STATS.avgHealthScore >= 70 ? '良好' : '需关注'} accent="var(--color-ok)" />
      </div>

      {/* 3-column content */}
      <div className="grid grid-cols-3 gap-5 stagger">
        {/* Left: Urgent tasks */}
        <Card>
          <SectionHeader
            icon={<AlertTriangle size={15} className="text-red-400" />}
            title="紧急待办"
            action={{ label: '查看全部', onClick: () => onNavigate('calendar') }}
          />
          <div className="space-y-1">
            {urgentTasks.map(t => {
              const isOverdue = t.status === 'overdue';
              return (
                <div
                  key={t.id}
                  className={[
                    'flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors',
                    isOverdue ? 'bg-red-500/5 border-l-2 border-red-500' : 'border-l-2 border-transparent',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      isOverdue ? 'bg-red-400' : 'bg-amber-400',
                    ].join(' ')}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate text-[var(--color-t1)]">{t.title}</p>
                    <p className="text-[11px] mt-0.5 text-[var(--color-t4)]">{t.customerName}</p>
                  </div>
                  {isOverdue ? (
                    <Badge variant="bad">已逾期</Badge>
                  ) : (
                    <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-t3)]">
                      {t.deadline.slice(5)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Center: AI opportunities */}
        <Card>
          <SectionHeader
            icon={<Zap size={15} className="text-[var(--color-accent)]" />}
            title="AI 商机推荐"
            action={{ label: '查看全部', onClick: () => onNavigate('opportunities') }}
          />
          <div className="space-y-3">
            {newOpps.map(o => (
              <div
                key={o.id}
                className="p-3.5 rounded-lg transition-all cursor-pointer"
                style={{
                  background: 'var(--color-accent-subtle)',
                  border: '1px solid rgba(79,140,255,0.15)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(79,140,255,0.3)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(79,140,255,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(79,140,255,0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-[var(--color-t1)]">{o.customerName}</span>
                  <span className="mono text-[12px] font-semibold text-[var(--color-accent)]">
                    ¥{o.estimatedValue.toLocaleString()}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-[var(--color-accent-hover)]">{o.service}</p>
                <p className="text-[11px] mt-1 line-clamp-2 text-[var(--color-t4)]">{o.reason.slice(0, 60)}…</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${o.confidence}%`,
                        background: 'linear-gradient(90deg, var(--color-accent), #6ba0ff)',
                      }}
                    />
                  </div>
                  <span className="mono text-[10px] text-[var(--color-t3)]">{o.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Policy + Churn */}
        <div className="flex flex-col gap-5">
          <Card>
            <SectionHeader
              icon={<Radar size={15} className="text-blue-400" />}
              title="政策动态"
              action={{ label: '查看全部', onClick: () => onNavigate('policies') }}
            />
            <div className="space-y-3">
              {unreadPolicies.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg transition-colors bg-blue-500/5 border border-blue-500/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={[
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        p.impact === 'high' ? 'bg-red-400' : 'bg-amber-400',
                      ].join(' ')}
                    />
                    <span className="text-[12px] font-medium line-clamp-1 text-[var(--color-t1)]">{p.title}</span>
                  </div>
                  <p className="text-[11px] line-clamp-2 mt-1 text-[var(--color-t4)]">{p.summary.slice(0, 60)}…</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--color-t4)]">{p.source}</span>
                    <Badge variant="info">影响{p.affectedCount}个客户</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1">
            <SectionHeader
              icon={<ShieldAlert size={15} className="text-red-400" />}
              title="流失预警"
            />
            {riskCustomers.length > 0 ? (
              <div className="space-y-1">
                {riskCustomers.map(c => {
                  const daysSince = Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 py-2 px-2.5 rounded-lg transition-colors hover:bg-red-500/5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-400" />
                      <span className="text-[12px] flex-1 text-[var(--color-t2)]">{c.name}</span>
                      <span className="mono text-[10px] text-red-400">{daysSince}天</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-[var(--color-t4)] text-center py-4">暂无流失预警</p>
            )}
          </Card>
        </div>
      </div>

      {/* Recent signals */}
      {recentEvents.length > 0 && (
        <div className="mt-6 anim-fade-up">
          <Card>
            <SectionHeader icon={<Activity size={15} className="text-[var(--color-t3)]" />} title="最新信号" />
            <div className="grid grid-cols-3 gap-3">
              {recentEvents.map(ev => {
                const isRisk = ev.type === 'risk';
                return (
                  <div
                    key={ev.id}
                    className={[
                      'p-3 rounded-lg flex items-start gap-3',
                      isRisk ? 'bg-red-500/5 border border-red-500/10' : 'bg-[var(--color-surface-1)] border border-[var(--color-b0)]',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5',
                        isRisk ? 'bg-red-500/15' : 'bg-[var(--color-surface-3)]',
                      ].join(' ')}
                    >
                      {isRisk
                        ? <AlertTriangle size={12} className="text-red-400" />
                        : <Activity size={12} className="text-[var(--color-t3)]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate text-[var(--color-t1)]">{ev.customerName} · {ev.title}</p>
                      <p className="text-[11px] mt-0.5 line-clamp-1 text-[var(--color-t4)]">{ev.description}</p>
                      <p className="mono text-[10px] mt-1 text-[var(--color-t4)]">{ev.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
