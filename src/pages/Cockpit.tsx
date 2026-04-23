import { useState } from 'react';
import {
  BarChart3, Users, TrendingUp, AlertTriangle, Activity,
  ArrowUp, ArrowDown, Minus, Shield, Lightbulb, Calendar, Zap,
  Target, Radio, ChevronRight, Clock
} from 'lucide-react';
import { CUSTOMERS, TASKS, OPPORTUNITIES, POLICIES, CUSTOMER_EVENTS, MONITOR_ALERTS } from '../mock';

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
        <p className="metric text-[18px]" style={{ color }}>{pct}%</p>
      </div>
      <div className="text-center">
        <p className="text-[11px]" style={{ color: 'var(--color-t3)' }}>{label}</p>
        <p className="mono text-[13px] font-semibold" style={{ color: 'var(--color-t2)' }}>{count}</p>
      </div>
    </div>
  );
}

/* ── Horizontal Bar ────────────────────────────── */
function HBar({ label, value, maxVal, pct, gradient, suffix = '' }: {
  label: string; value: number; maxVal: number; pct: number; gradient: string; suffix?: string;
}) {
  const w = Math.max((value / maxVal) * 100, 3);
  return (
    <div className="flex items-center gap-2 group">
      <span className="mono text-[10px] w-16 shrink-0 text-right" style={{ color: 'var(--color-t4)' }}>{label}</span>
      <div className="flex-1 h-[18px] rounded-sm overflow-hidden" style={{ background: 'var(--color-surface-1)' }}>
        <div className="h-full rounded-sm transition-all duration-700 group-hover:brightness-125"
          style={{ width: `${w}%`, background: gradient }} />
      </div>
      <span className="mono text-[11px] w-14 shrink-0 text-right" style={{ color: 'var(--color-t2)' }}>
        {value}{suffix}
      </span>
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

  const eventColors: Record<string, { dot: string; tag: string; label: string }> = {
    contact:     { dot: 'var(--color-info)',   tag: 'badge-info',   label: '沟通' },
    change:      { dot: 'var(--color-accent)', tag: 'badge-accent', label: '变更' },
    risk:        { dot: 'var(--color-bad)',    tag: 'badge-bad',    label: '风险' },
    service:     { dot: 'var(--color-ok)',     tag: 'badge-ok',     label: '服务' },
    opportunity: { dot: 'var(--color-warn)',   tag: 'badge-warn',   label: '商机' },
    policy:      { dot: 'var(--color-info)',   tag: 'badge-info',   label: '政策' },
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
    { icon: Users, label: '服务客户', value: total.toString(), trend: '+2', up: true, color: 'var(--color-accent-bright)', glow: false },
    { icon: Activity, label: '健康度', value: `${avgHealth}`, trend: '+3', up: true, color: 'var(--color-ok)', glow: false },
    { icon: Calendar, label: '待办事项', value: pendingTasks.toString(), trend: overdueTasks > 0 ? `${overdueTasks}逾期` : '按时', up: false, color: overdueTasks > 0 ? 'var(--color-bad)' : 'var(--color-ok)', glow: overdueTasks > 0 },
    { icon: Lightbulb, label: '新商机', value: newOpps.toString(), trend: '稳定', up: null, color: 'var(--color-warn)', glow: false },
    { icon: TrendingUp, label: '商机价值', value: `¥${(totalOppValue / 10000).toFixed(1)}万`, trend: '+12%', up: true, color: 'var(--color-ok)', glow: false },
    { icon: Shield, label: '待处理预警', value: unhandledAlerts.toString(), trend: criticalAlerts > 0 ? `${criticalAlerts}严重` : '无', up: false, color: unhandledAlerts > 0 ? 'var(--color-bad)' : 'var(--color-t3)', glow: criticalAlerts > 0 },
  ];

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-base)' }}>
      {/* ── Dot pattern background ─────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative z-10 px-5 py-4 max-w-[1600px] mx-auto anim-fade-in">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--color-accent-muted)' }}>
              <Zap size={16} style={{ color: 'var(--color-accent-bright)' }} />
            </div>
            <div>
              <h1 className="text-[17px] font-bold flex items-center gap-2" style={{ color: 'var(--color-t1)' }}>
                AI 指挥中心
                <span className="anim-breathe inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-ok)' }} />
              </h1>
              <p className="text-[11px] mono" style={{ color: 'var(--color-t4)' }}>
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
            <div key={i}
              className={`card p-3.5 ${k.glow ? 'anim-glow' : ''}`}
              style={k.glow ? { borderColor: 'rgba(226,59,74,0.3)' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <k.icon size={14} style={{ color: k.color }} />
                <span className="mono text-[10px] flex items-center gap-0.5"
                  style={{ color: k.up === true ? 'var(--color-ok)' : k.up === false && k.glow ? 'var(--color-bad)' : 'var(--color-t4)' }}>
                  {k.up === true && <ArrowUp size={9} />}
                  {k.up === false && k.glow && <ArrowDown size={9} />}
                  {k.up === null && <Minus size={9} />}
                  {k.trend}
                </span>
              </div>
              <p className="metric" style={{ color: k.glow ? k.color : 'var(--color-t1)', fontSize: '22px' }}>
                {k.value}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--color-t4)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* ── Row 2: 3 Visualization Panels ──────── */}
        <div className="grid grid-cols-12 gap-3 mb-4 stagger">

          {/* Panel 1: Client Health Distribution */}
          <div className="col-span-4 card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target size={13} style={{ color: 'var(--color-accent-bright)' }} />
              <h2 className="text-[12px] font-semibold" style={{ color: 'var(--color-t2)' }}>客户健康分布</h2>
              <span className="badge badge-neutral text-[9px] ml-auto">{total} 客户</span>
            </div>
            <div className="flex justify-around items-start">
              <Ring value={activeCount} max={total} color="var(--color-ok)" glowColor="rgba(16,185,129,0.4)"
                label="正常" count={activeCount} />
              <Ring value={attentionCount} max={total} color="var(--color-warn)" glowColor="rgba(236,126,0,0.4)"
                label="关注" count={attentionCount} />
              <Ring value={riskCount} max={total} color="var(--color-bad)" glowColor="rgba(226,59,74,0.4)"
                label="风险" count={riskCount} />
            </div>
            {/* Health bar summary */}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-b0)' }}>
              <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-1)' }}>
                <div className="h-full rounded-l-full" style={{ width: `${(activeCount / total) * 100}%`, background: 'var(--color-ok)' }} />
                <div className="h-full" style={{ width: `${(attentionCount / total) * 100}%`, background: 'var(--color-warn)' }} />
                <div className="h-full rounded-r-full" style={{ width: `${(riskCount / total) * 100}%`, background: 'var(--color-bad)' }} />
              </div>
            </div>
          </div>

          {/* Panel 2: Task Pipeline */}
          <div className="col-span-4 card p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={13} style={{ color: 'var(--color-accent-bright)' }} />
              <h2 className="text-[12px] font-semibold" style={{ color: 'var(--color-t2)' }}>任务流水线</h2>
              <span className="badge badge-neutral text-[9px] ml-auto">{taskTotal} 任务</span>
            </div>

            {/* Stacked progress bar */}
            <div className="mb-4">
              <div className="flex h-6 rounded overflow-hidden" style={{ background: 'var(--color-surface-1)' }}>
                {taskSegs.map((s, i) => (
                  <div key={i} className="h-full relative flex items-center justify-center transition-all duration-700"
                    style={{ width: `${s.pct}%`, background: s.color, minWidth: s.count > 0 ? '24px' : '0' }}>
                    {s.count > 0 && (
                      <span className="text-[9px] font-bold" style={{ color: '#000', opacity: 0.7 }}>{s.count}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Task breakdown */}
            <div className="space-y-2.5">
              {taskSegs.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                  <span className="text-[11px] flex-1" style={{ color: 'var(--color-t3)' }}>{s.label}</span>
                  <span className="mono text-[12px] font-medium" style={{ color: 'var(--color-t2)' }}>{s.count}</span>
                  <span className="mono text-[10px] w-10 text-right" style={{ color: 'var(--color-t4)' }}>{Math.round(s.pct)}%</span>
                </div>
              ))}
            </div>

            {/* Completion rate */}
            <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-b0)' }}>
              <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>完成率</span>
              <span className="metric text-[18px]" style={{ color: 'var(--color-ok)' }}>
                {Math.round((completedTasks / taskTotal) * 100)}%
              </span>
            </div>
          </div>

          {/* Panel 3: Revenue Ranking */}
          <div className="col-span-4 card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={13} style={{ color: 'var(--color-accent-bright)' }} />
              <h2 className="text-[12px] font-semibold" style={{ color: 'var(--color-t2)' }}>月营收排行</h2>
              <span className="text-[10px] mono ml-auto" style={{ color: 'var(--color-t4)' }}>万元</span>
            </div>
            <div className="space-y-1.5">
              {revenueData.map((d, i) => {
                const grad = d.status === 'active'
                  ? 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))'
                  : d.status === 'attention'
                    ? 'linear-gradient(90deg, rgba(236,126,0,0.7), var(--color-warn))'
                    : 'linear-gradient(90deg, rgba(226,59,74,0.7), var(--color-bad))';
                return (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="mono text-[9px] w-3 text-center font-bold"
                      style={{ color: i < 3 ? 'var(--color-warn)' : 'var(--color-t4)' }}>
                      {i + 1}
                    </span>
                    <span className="text-[10px] w-14 shrink-0 truncate" style={{ color: 'var(--color-t3)' }}>
                      {d.label}
                    </span>
                    <div className="flex-1 h-[14px] rounded-sm overflow-hidden" style={{ background: 'var(--color-surface-1)' }}>
                      <div className="h-full rounded-sm transition-all duration-700 group-hover:brightness-130"
                        style={{ width: `${Math.max((d.value / maxRev) * 100, 3)}%`, background: grad }} />
                    </div>
                    <span className="mono text-[10px] w-9 shrink-0 text-right font-medium" style={{ color: 'var(--color-t2)' }}>
                      {d.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 3: Timeline, Alerts, Opportunities ─ */}
        <div className="grid grid-cols-3 gap-3 stagger">

          {/* Recent Timeline */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Radio size={13} style={{ color: 'var(--color-info)' }} />
              <h2 className="text-[12px] font-semibold" style={{ color: 'var(--color-t2)' }}>实时动态</h2>
              <Clock size={10} className="ml-auto" style={{ color: 'var(--color-t4)' }} />
            </div>
            <div className="space-y-0">
              {recentEvents.map((e, i) => {
                const ec = eventColors[e.type] || eventColors.contact;
                return (
                  <div key={e.id} className="flex gap-2.5 group">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: ec.dot, boxShadow: `0 0 6px ${ec.dot}` }} />
                      {i < recentEvents.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: 'var(--color-b0)' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-3 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-medium truncate" style={{ color: 'var(--color-t2)' }}>{e.customerName}</span>
                        <span className={`badge ${ec.tag} text-[8px] px-1.5 py-0`}>{ec.label}</span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-t3)' }}>{e.title}</p>
                      <p className="mono text-[9px] mt-0.5" style={{ color: 'var(--color-t4)' }}>{e.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Alerts */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={13} style={{ color: 'var(--color-bad)' }} />
              <h2 className="text-[12px] font-semibold" style={{ color: 'var(--color-t2)' }}>风险预警</h2>
              {criticalAlerts > 0 && (
                <span className="badge badge-bad text-[9px] ml-auto anim-breathe">
                  {criticalAlerts} 严重
                </span>
              )}
            </div>
            <div className="space-y-2">
              {riskAlerts.map(a => {
                const sev = a.severity === 'critical'
                  ? { border: 'var(--color-bad)', bg: 'rgba(226,59,74,0.06)', badge: 'badge-bad', label: '严重' }
                  : a.severity === 'warning'
                    ? { border: 'var(--color-warn)', bg: 'rgba(236,126,0,0.06)', badge: 'badge-warn', label: '警告' }
                    : { border: 'var(--color-info)', bg: 'rgba(0,123,194,0.06)', badge: 'badge-info', label: '信息' };
                return (
                  <div key={a.id} className="rounded-lg p-2.5 group cursor-pointer transition-colors"
                    style={{
                      background: sev.bg,
                      borderLeft: `3px solid ${sev.border}`,
                    }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`badge ${sev.badge} text-[8px] px-1.5 py-0`}>{sev.label}</span>
                      <span className="text-[11px] font-medium truncate" style={{ color: 'var(--color-t2)' }}>{a.customerName}</span>
                    </div>
                    <p className="text-[11px] truncate" style={{ color: 'var(--color-t3)' }}>{a.title}</p>
                    <p className="mono text-[9px] mt-1" style={{ color: 'var(--color-t4)' }}>{a.discoveredAt}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Opportunities */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={13} style={{ color: 'var(--color-warn)' }} />
              <h2 className="text-[12px] font-semibold" style={{ color: 'var(--color-t2)' }}>高价值商机</h2>
              <span className="badge badge-neutral text-[9px] ml-auto">{newOpps} 个</span>
            </div>
            <div className="space-y-2">
              {topOpps.map((o, i) => (
                <div key={o.id}
                  className="rounded-lg p-2.5 flex items-start gap-2.5 group cursor-pointer transition-colors"
                  style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-b0)' }}>
                  <span className="mono text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: i === 0 ? 'rgba(236,126,0,0.2)' : 'var(--color-surface-2)',
                      color: i === 0 ? 'var(--color-warn)' : 'var(--color-t3)',
                    }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-t2)' }}>
                      {o.customerName} · {o.service}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-accent text-[9px] px-1.5 py-0">置信 {o.confidence}%</span>
                      <span className="mono text-[11px] font-bold" style={{ color: 'var(--color-warn)' }}>
                        ¥{o.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${o.confidence}%`,
                          background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))',
                        }} />
                    </div>
                  </div>
                  <ChevronRight size={12} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-t4)' }} />
                </div>
              ))}
            </div>

            {/* Unread policies footer */}
            {unreadPolicies > 0 && (
              <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--color-b0)' }}>
                <Radio size={11} className="anim-breathe" style={{ color: 'var(--color-info)' }} />
                <span className="text-[10px]" style={{ color: 'var(--color-info)' }}>
                  {unreadPolicies} 条未读政策更新
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer status bar ──────────────────── */}
        <div className="mt-4 flex items-center justify-between px-1 py-2"
          style={{ borderTop: '1px solid var(--color-b0)' }}>
          <div className="flex items-center gap-4">
            <span className="mono text-[9px] flex items-center gap-1" style={{ color: 'var(--color-t4)' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block anim-breathe" style={{ background: 'var(--color-ok)' }} />
              SYS ONLINE
            </span>
            <span className="mono text-[9px]" style={{ color: 'var(--color-t4)' }}>
              CLIENTS {total} · TASKS {taskTotal} · ALERTS {unhandledAlerts}
            </span>
          </div>
          <span className="mono text-[9px]" style={{ color: 'var(--color-t4)' }}>
            CENTAUR CRM v2.0 · LAST SYNC {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
