import { useState } from 'react';
import {
  BarChart3, Users, TrendingUp, AlertTriangle, Activity,
  ArrowUp, ArrowDown, Minus, Shield, Lightbulb, Calendar, Zap,
  Target, Radio, ChevronRight
} from 'lucide-react';
import { Card, Badge, SectionHeader } from '../components/ui';
import { CUSTOMERS, TASKS, OPPORTUNITIES, POLICIES, MONITOR_ALERTS, CUSTOMER_EVENTS } from '../mock';

/* ── SVG Ring Chart ─────────────────────────────── */
function Ring({ value, max, size = 72, strokeW = 5, color, glowColor, label, count }: {
  value: number; max: number; size?: number; strokeW?: number;
  color: string; glowColor: string; label: string; count: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = (size - strokeW * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--color-b0)" strokeWidth={strokeW} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeW} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})`, transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="text-center" style={{ marginTop: -(size / 2 + 10) + 'px', marginBottom: (size / 2 - 18) + 'px' }}>
        <p className="mono text-[18px]" style={{ color }}>{pct}%</p>
      </div>
      <div className="text-center">
        <p className="text-[11px]" style={{ color: 'var(--color-t3)' }}>{label}</p>
        <p className="mono text-[13px] font-semibold" style={{ color: 'var(--color-t2)' }}>{count}</p>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────── */
export default function Cockpit() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // ── Computed stats ────────────────────────────
  const total = CUSTOMERS.length;
  const activeCount = CUSTOMERS.filter(c => c.status === 'active').length;
  const attentionCount = CUSTOMERS.filter(c => c.status === 'attention').length;
  const riskCount = CUSTOMERS.filter(c => c.status === 'risk').length;
  const avgHealth = Math.round(CUSTOMERS.reduce((s, c) => s + c.healthScore, 0) / total);

  const overdueTasks = TASKS.filter(t => t.status === 'overdue').length;
  const pendingTasks = TASKS.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasks = TASKS.filter(t => t.status === 'completed').length;
  const inProgressTasks = TASKS.filter(t => t.status === 'in_progress').length;
  const pendingOnlyTasks = TASKS.filter(t => t.status === 'pending').length;

  const newOpps = OPPORTUNITIES.filter(o => o.status === 'new').length;
  const totalOppValue = OPPORTUNITIES.reduce((s, o) => s + o.estimatedValue, 0);
  const unreadPolicies = POLICIES.filter(p => !p.isRead).length;

  const criticalAlerts = MONITOR_ALERTS.filter(a => a.severity === 'critical' && !a.isHandled).length;
  const unhandledAlerts = MONITOR_ALERTS.filter(a => !a.isHandled).length;

  // Revenue ranking
  const revenueData = CUSTOMERS.map(c => ({
    label: c.name.replace(/有限公司|股份有限公司/g, '').slice(0, 5),
    value: c.monthlyRevenue,
    status: c.status,
  })).sort((a, b) => b.value - a.value);
  const maxRev = Math.max(...revenueData.map(d => d.value));

  // Recent events
  const recentEvents = [...CUSTOMER_EVENTS].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 7);

  const eventBadgeVariant: Record<string, 'info' | 'accent' | 'bad' | 'ok' | 'warn' | 'info'> = {
    contact:     'info',
    change:      'accent',
    risk:        'bad',
    service:     'ok',
    opportunity: 'warn',
    policy:      'info',
  };

  const eventDotColor: Record<string, string> = {
    contact:     'var(--color-info)',
    change:      'var(--color-accent)',
    risk:        'var(--color-bad)',
    service:     'var(--color-ok)',
    opportunity: 'var(--color-warn)',
    policy:      'var(--color-info)',
  };

  const eventLabel: Record<string, string> = {
    contact:     '沟通',
    change:      '变更',
    risk:        '风险',
    service:     '服务',
    opportunity: '商机',
    policy:      '政策',
  };

  // Risk alerts
  const riskAlerts = MONITOR_ALERTS.filter(a => !a.isHandled)
    .sort((a, b) => {
      const o = { critical: 0, warning: 1, info: 2 };
      return o[a.severity] - o[b.severity];
    }).slice(0, 5);

  // Top opps
  const topOpps = OPPORTUNITIES.filter(o => o.status === 'new')
    .sort((a, b) => b.confidence - a.confidence).slice(0, 4);

  // Task pipeline segments
  const taskTotal = TASKS.length;
  const taskSegs = [
    { label: '已完成', count: completedTasks, color: 'var(--color-ok)', pct: (completedTasks / taskTotal) * 100 },
    { label: '进行中', count: inProgressTasks, color: 'var(--color-info)', pct: (inProgressTasks / taskTotal) * 100 },
    { label: '待处理', count: pendingOnlyTasks, color: 'var(--color-warn)', pct: (pendingOnlyTasks / taskTotal) * 100 },
    { label: '逾期', count: overdueTasks, color: 'var(--color-bad)', pct: (overdueTasks / taskTotal) * 100 },
  ];

  // KPI cards data
  const kpis = [
    { icon: Users, label: '服务客户', value: total.toString(), trend: '+2', up: true, color: 'var(--color-accent-bright)', glow: false, badgeVariant: undefined as 'ok' | 'bad' | undefined },
    { icon: Activity, label: '健康度', value: `${avgHealth}`, trend: '+3', up: true, color: 'var(--color-ok)', glow: false, badgeVariant: undefined },
    { icon: Calendar, label: '待办事项', value: pendingTasks.toString(), trend: overdueTasks > 0 ? `${overdueTasks}逾期` : '按时', up: overdueTasks > 0 ? false : true, color: overdueTasks > 0 ? 'var(--color-bad)' : 'var(--color-ok)', glow: overdueTasks > 0, badgeVariant: overdueTasks > 0 ? 'bad' : 'ok' as 'ok' | 'bad' | undefined },
    { icon: Lightbulb, label: '新商机', value: newOpps.toString(), trend: '稳定', up: null, color: 'var(--color-warn)', glow: false, badgeVariant: undefined },
    { icon: TrendingUp, label: '商机价值', value: `¥${(totalOppValue / 10000).toFixed(1)}万`, trend: '+12%', up: true, color: 'var(--color-ok)', glow: false, badgeVariant: undefined },
    { icon: Shield, label: '待处理预警', value: unhandledAlerts.toString(), trend: criticalAlerts > 0 ? `${criticalAlerts}严重` : '无', up: false, color: unhandledAlerts > 0 ? 'var(--color-bad)' : 'var(--color-t3)', glow: criticalAlerts > 0, badgeVariant: criticalAlerts > 0 ? 'bad' : undefined },
  ];

  const sevConfig = (sev: string) => {
    if (sev === 'critical') return { borderColor: 'var(--color-bad)', badgeVariant: 'bad' as const, label: '严重' };
    if (sev === 'warning') return { borderColor: 'var(--color-warn)', badgeVariant: 'warn' as const, label: '警告' };
    return { borderColor: 'var(--color-info)', badgeVariant: 'info' as const, label: '信息' };
  };

  return (
    <div className="relative min-h-screen bg-[var(--color-base)]">
      {/* Dot pattern background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

      <div className="relative z-10 px-5 py-4 max-w-[1600px] mx-auto anim-fade-in">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-accent-muted)]">
              <Zap size={16} style={{ color: 'var(--color-accent-bright)' }} />
            </div>
            <div>
              <h1 className="text-[17px] font-bold flex items-center gap-2 text-[var(--color-t1)]">
                AI 指挥中心
                <span className="anim-breathe inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-ok)]" />
              </h1>
              <p className="text-[11px] mono text-[var(--color-t4)]">
                {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
                {' · '}SYSTEM OPERATIONAL
              </p>
            </div>
          </div>
          <div className="tab-group">
            {(['today', 'week', 'month'] as const).map(t => (
              <button key={t}
                className={`tab-item ${timeRange === t ? 'active' : ''}`}
                onClick={() => setTimeRange(t)}>
                {t === 'today' ? '今日' : t === 'week' ? '本周' : '本月'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Row 1: 6 KPI Cards ─────────────────── */}
        <div className="grid grid-cols-6 gap-2.5 mb-4 stagger">
          {kpis.map((k, i) => (
            <Card key={i} padding="md" className={k.glow ? 'anim-glow' : ''}
              style={k.glow ? { borderColor: 'rgba(226,59,74,0.3)' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <k.icon size={14} style={{ color: k.color }} />
                {k.trend && (
                  <span className="mono text-[10px] flex items-center gap-0.5"
                    style={{ color: k.up === true ? 'var(--color-ok)' : k.up === false && k.glow ? 'var(--color-bad)' : 'var(--color-t4)' }}>
                    {k.up === true && <ArrowUp size={9} />}
                    {k.up === false && k.glow && <ArrowDown size={9} />}
                    {k.up === null && <Minus size={9} />}
                    {k.trend}
                  </span>
                )}
              </div>
              <p className="mono text-[22px]" style={{ color: k.glow ? k.color : 'var(--color-t1)' }}>
                {k.value}
              </p>
              <p className="text-[10px] mt-1 text-[var(--color-t4)]">{k.label}</p>
            </Card>
          ))}
        </div>

        {/* ── Row 2: 3 Visualization Panels ──────── */}
        <div className="grid grid-cols-12 gap-3 mb-4 stagger">

          {/* Panel 1: Client Health Distribution */}
          <div className="col-span-4">
            <Card padding="md">
              <SectionHeader
                icon={<Target size={13} />}
                title="客户健康分布"
                action={{ label: `${total} 客户`, onClick: () => {} }}
              />
              <div className="flex justify-around items-start">
                <Ring value={activeCount} max={total} color="var(--color-ok)" glowColor="rgba(16,185,129,0.4)"
                  label="正常" count={activeCount} />
                <Ring value={attentionCount} max={total} color="var(--color-warn)" glowColor="rgba(236,126,0,0.4)"
                  label="关注" count={attentionCount} />
                <Ring value={riskCount} max={total} color="var(--color-bad)" glowColor="rgba(226,59,74,0.4)"
                  label="风险" count={riskCount} />
              </div>
              {/* Health bar summary */}
              <div className="mt-4 pt-3 border-t border-[var(--color-b0)]">
                <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-[var(--color-surface-1)]">
                  <div className="h-full rounded-l-full bg-[var(--color-ok)]"
                    style={{ width: `${(activeCount / total) * 100}%` }} />
                  <div className="h-full bg-[var(--color-warn)]"
                    style={{ width: `${(attentionCount / total) * 100}%` }} />
                  <div className="h-full rounded-r-full bg-[var(--color-bad)]"
                    style={{ width: `${(riskCount / total) * 100}%` }} />
                </div>
              </div>
            </Card>
          </div>

          {/* Panel 2: Task Pipeline */}
          <div className="col-span-4">
            <Card padding="md">
              <SectionHeader
                icon={<BarChart3 size={13} />}
                title="任务流水线"
                action={{ label: `${taskTotal} 任务`, onClick: () => {} }}
              />
              {/* Stacked progress bar */}
              <div className="mb-4">
                <div className="flex h-6 rounded overflow-hidden bg-[var(--color-surface-1)]">
                  {taskSegs.map((s, i) => (
                    <div key={i} className="h-full relative flex items-center justify-center transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: s.color, minWidth: s.count > 0 ? '24px' : '0' }}>
                      {s.count > 0 && (
                        <span className="text-[9px] font-bold text-black/70">{s.count}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Task breakdown */}
              <div className="space-y-2.5">
                {taskSegs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                    <span className="text-[11px] flex-1 text-[var(--color-t3)]">{s.label}</span>
                    <span className="mono text-[12px] font-medium text-[var(--color-t2)]">{s.count}</span>
                    <span className="mono text-[10px] w-10 text-right text-[var(--color-t4)]">{Math.round(s.pct)}%</span>
                  </div>
                ))}
              </div>
              {/* Completion rate */}
              <div className="mt-4 pt-3 flex items-center justify-between border-t border-[var(--color-b0)]">
                <span className="text-[10px] text-[var(--color-t4)]">完成率</span>
                <span className="mono text-[18px] text-[var(--color-ok)]">
                  {Math.round((completedTasks / taskTotal) * 100)}%
                </span>
              </div>
            </Card>
          </div>

          {/* Panel 3: Revenue Ranking */}
          <div className="col-span-4">
            <Card padding="md">
              <SectionHeader
                icon={<TrendingUp size={13} />}
                title="月营收排行"
                action={{ label: '万元', onClick: () => {} }}
              />
              <div className="space-y-1.5">
                {revenueData.map((d, i) => {
                  const grad = d.status === 'active'
                    ? 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))'
                    : d.status === 'attention'
                      ? 'linear-gradient(90deg, rgba(236,126,0,0.7), var(--color-warn))'
                      : 'linear-gradient(90deg, rgba(226,59,74,0.7), var(--color-bad))';
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="mono text-[9px] w-3 text-center font-bold"
                        style={{ color: i < 3 ? 'var(--color-warn)' : 'var(--color-t4)' }}>
                        {i + 1}
                      </span>
                      <span className="text-[10px] w-14 shrink-0 truncate text-[var(--color-t3)]">
                        {d.label}
                      </span>
                      <div className="flex-1 h-[14px] rounded-sm overflow-hidden bg-[var(--color-surface-1)]">
                        <div className="h-full rounded-sm transition-all duration-700 hover:brightness-125"
                          style={{ width: `${Math.max((d.value / maxRev) * 100, 3)}%`, background: grad }} />
                      </div>
                      <span className="mono text-[10px] w-9 shrink-0 text-right font-medium text-[var(--color-t2)]">
                        {d.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Row 3: Timeline, Alerts, Opportunities ─ */}
        <div className="grid grid-cols-3 gap-3 stagger">

          {/* Recent Timeline */}
          <Card padding="md">
            <SectionHeader
              icon={<Radio size={13} />}
              title="实时动态"
              action={{ label: '', onClick: () => {} }}
            />
            <div className="space-y-0">
              {recentEvents.map((e, i) => {
                const ev = eventBadgeVariant[e.type] || 'info';
                const dotColor = eventDotColor[e.type] || 'var(--color-info)';
                const label = eventLabel[e.type] || '沟通';
                return (
                  <div key={e.id} className="flex gap-2.5">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                      {i < recentEvents.length - 1 && (
                        <div className="w-px flex-1 mt-1 bg-[var(--color-b0)]" />
                      )}
                    </div>
                    <div className="flex-1 pb-3 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-medium truncate text-[var(--color-t2)]">{e.customerName}</span>
                        <Badge variant={ev} className="text-[8px] px-1.5 py-0">{label}</Badge>
                      </div>
                      <p className="text-[11px] truncate text-[var(--color-t3)]">{e.title}</p>
                      <p className="mono text-[9px] mt-0.5 text-[var(--color-t4)]">{e.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Risk Alerts */}
          <Card padding="md">
            <SectionHeader
              icon={<AlertTriangle size={13} />}
              title="风险预警"
              action={criticalAlerts > 0 ? { label: `${criticalAlerts} 严重`, onClick: () => {} } : undefined}
            />
            {criticalAlerts > 0 && (
              <div className="mb-3">
                <Badge variant="bad" className="text-[9px] anim-breathe">{criticalAlerts} 严重</Badge>
              </div>
            )}
            <div className="space-y-2">
              {riskAlerts.map(a => {
                const sev = sevConfig(a.severity);
                return (
                  <div key={a.id}
                    className="rounded-lg p-2.5 transition-colors hover:bg-[var(--color-surface-2)] hover:border-[var(--color-b1)] cursor-pointer"
                    style={{ borderLeft: `3px solid ${sev.borderColor}`, background: 'var(--color-surface-1)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant={sev.badgeVariant} className="text-[8px] px-1.5 py-0">{sev.label}</Badge>
                      <span className="text-[11px] font-medium truncate text-[var(--color-t2)]">{a.customerName}</span>
                    </div>
                    <p className="text-[11px] truncate text-[var(--color-t3)]">{a.title}</p>
                    <p className="mono text-[9px] mt-1 text-[var(--color-t4)]">{a.discoveredAt}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Opportunities */}
          <Card padding="md">
            <SectionHeader
              icon={<Lightbulb size={13} />}
              title="高价值商机"
              action={{ label: `${newOpps} 个`, onClick: () => {} }}
            />
            <div className="space-y-2">
              {topOpps.map((o, i) => (
                <div key={o.id}
                  className="rounded-lg p-2.5 flex items-start gap-2.5 cursor-pointer transition-colors hover:bg-[var(--color-surface-2)] hover:border-[var(--color-b1)] border border-[var(--color-b0)] bg-[var(--color-surface-1)]">
                  <span className="mono text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: i === 0 ? 'rgba(236,126,0,0.2)' : 'var(--color-surface-2)',
                      color: i === 0 ? 'var(--color-warn)' : 'var(--color-t3)',
                    }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate text-[var(--color-t2)]">
                      {o.customerName} · {o.service}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="accent" className="text-[9px] px-1.5 py-0">置信 {o.confidence}%</Badge>
                      <span className="mono text-[11px] font-bold text-[var(--color-warn)]">
                        ¥{o.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="mt-1.5 h-1 rounded-full overflow-hidden bg-[var(--color-surface-2)]">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${o.confidence}%`,
                          background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))',
                        }} />
                    </div>
                  </div>
                  <ChevronRight size={12} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-t4)]" />
                </div>
              ))}
            </div>

            {/* Unread policies footer */}
            {unreadPolicies > 0 && (
              <div className="mt-3 pt-3 flex items-center gap-2 border-t border-[var(--color-b0)]">
                <Radio size={11} className="anim-breathe text-[var(--color-info)]" />
                <span className="text-[10px] text-[var(--color-info)]">
                  {unreadPolicies} 条未读政策更新
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* ── Footer status bar ──────────────────── */}
        <div className="mt-4 flex items-center justify-between px-1 py-2 border-t border-[var(--color-b0)]">
          <div className="flex items-center gap-4">
            <span className="mono text-[9px] flex items-center gap-1 text-[var(--color-t4)]">
              <span className="w-1.5 h-1.5 rounded-full inline-block anim-breathe bg-[var(--color-ok)]" />
              SYS ONLINE
            </span>
            <span className="mono text-[9px] text-[var(--color-t4)]">
              CLIENTS {total} · TASKS {taskTotal} · ALERTS {unhandledAlerts}
            </span>
          </div>
          <span className="mono text-[9px] text-[var(--color-t4)]">
            CENTAUR CRM v2.0 · LAST SYNC {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
