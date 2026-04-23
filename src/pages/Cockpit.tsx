import { useState } from 'react';
import {
  BarChart3, Users, TrendingUp, TrendingDown, AlertTriangle, Activity,
  ArrowUp, ArrowDown, Minus, Shield, Lightbulb, Calendar
} from 'lucide-react';
import { CUSTOMERS, TASKS, OPPORTUNITIES, POLICIES, CUSTOMER_EVENTS, MONITOR_ALERTS } from '../mock';

/* ── 简易条形图组件 ─────────────────────────────── */
function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 w-16 shrink-0 text-right">{d.label}</span>
          <div className="flex-1 h-5 rounded bg-slate-50 overflow-hidden">
            <div
              className={`h-full rounded ${d.color} transition-all duration-700`}
              style={{ width: `${Math.max((d.value / maxVal) * 100, 2)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-slate-700 w-8 shrink-0">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 环形进度组件 ───────────────────────────────── */
function RingProgress({ value, max, size = 80, color, label }: {
  value: number; max: number; size?: number; color: string; label: string;
}) {
  const pct = Math.round((value / max) * 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center -mt-[52px] mb-3">
        <p className="text-[18px] font-bold text-slate-900">{pct}%</p>
      </div>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

export default function Cockpit() {
  const [timeRange] = useState<'today' | 'week' | 'month'>('today');

  // 统计数据
  const totalCustomers = CUSTOMERS.length;
  const activeCount = CUSTOMERS.filter(c => c.status === 'active').length;
  const attentionCount = CUSTOMERS.filter(c => c.status === 'attention').length;
  const riskCount = CUSTOMERS.filter(c => c.status === 'risk').length;
  const avgHealth = Math.round(CUSTOMERS.reduce((s, c) => s + c.healthScore, 0) / totalCustomers);

  const overdueTasks = TASKS.filter(t => t.status === 'overdue').length;
  const pendingTasks = TASKS.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasks = TASKS.filter(t => t.status === 'completed').length;
  const taskCompletionRate = Math.round((completedTasks / TASKS.length) * 100);

  const newOpps = OPPORTUNITIES.filter(o => o.status === 'new').length;
  const totalOppValue = OPPORTUNITIES.reduce((s, o) => s + o.estimatedValue, 0);
  const unreadPolicies = POLICIES.filter(p => !p.isRead).length;

  const criticalAlerts = MONITOR_ALERTS.filter(a => a.severity === 'critical' && !a.isHandled).length;
  const warningAlerts = MONITOR_ALERTS.filter(a => a.severity === 'warning' && !a.isHandled).length;
  const unhandledAlerts = MONITOR_ALERTS.filter(a => !a.isHandled).length;

  // 行业分布
  const industryData = Object.entries(
    CUSTOMERS.reduce((acc, c) => { acc[c.industry] = (acc[c.industry] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([label, value]) => ({
    label, value, color: ['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400', 'bg-rose-400', 'bg-cyan-400'][Math.floor(Math.random() * 6)]
  })).sort((a, b) => b.value - a.value);

  // 营收分布
  const revenueData = CUSTOMERS.map(c => ({
    label: c.name.replace(/有限公司|股份有限公司/g, '').slice(0, 4),
    value: c.monthlyRevenue,
    color: c.status === 'active' ? 'bg-blue-400' : c.status === 'attention' ? 'bg-amber-400' : 'bg-red-400',
  })).sort((a, b) => b.value - a.value);

  // 最近事件
  const recentEvents = [...CUSTOMER_EVENTS].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 6);

  const EVENT_TYPE_STYLE: Record<string, { label: string; color: string }> = {
    contact: { label: '沟通', color: 'bg-blue-100 text-blue-600' },
    change: { label: '变更', color: 'bg-violet-100 text-violet-600' },
    risk: { label: '风险', color: 'bg-red-100 text-red-600' },
    service: { label: '服务', color: 'bg-emerald-100 text-emerald-600' },
    opportunity: { label: '商机', color: 'bg-amber-100 text-amber-600' },
    policy: { label: '政策', color: 'bg-cyan-100 text-cyan-600' },
  };

  return (
    <div className="p-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-600" /> AI 驾驶舱
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            全局概览 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['today', 'week', 'month'] as const).map(t => (
            <button key={t} className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${
              timeRange === t ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500'
            }`}>
              {t === 'today' ? '今日' : t === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        {/* 客户总数 */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users size={16} className="text-blue-500" />
            <span className="text-[10px] text-emerald-500 flex items-center gap-0.5"><ArrowUp size={10} />2</span>
          </div>
          <p className="text-[24px] font-bold text-slate-900">{totalCustomers}</p>
          <p className="text-[11px] text-slate-400">服务客户</p>
        </div>

        {/* 健康度 */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity size={16} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 flex items-center gap-0.5"><ArrowUp size={10} />3</span>
          </div>
          <p className="text-[24px] font-bold text-slate-900">{avgHealth}<span className="text-[14px] text-slate-400">分</span></p>
          <p className="text-[11px] text-slate-400">平均健康度</p>
        </div>

        {/* 待办 */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={16} className="text-amber-500" />
            {overdueTasks > 0 && <span className="text-[10px] text-red-500 font-medium">{overdueTasks}逾期</span>}
          </div>
          <p className="text-[24px] font-bold text-slate-900">{pendingTasks}</p>
          <p className="text-[11px] text-slate-400">待办事项</p>
        </div>

        {/* 商机 */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb size={16} className="text-amber-500" />
            <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><Minus size={10} />稳定</span>
          </div>
          <p className="text-[24px] font-bold text-amber-600">{newOpps}</p>
          <p className="text-[11px] text-slate-400">新商机</p>
        </div>

        {/* 商机价值 */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 flex items-center gap-0.5"><ArrowUp size={10} />12%</span>
          </div>
          <p className="text-[24px] font-bold text-slate-900">¥{(totalOppValue / 10000).toFixed(1)}<span className="text-[14px] text-slate-400">万</span></p>
          <p className="text-[11px] text-slate-400">商机总价值</p>
        </div>

        {/* 预警 */}
        <div className={`rounded-xl border p-4 ${unhandledAlerts > 0 ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <Shield size={16} className={unhandledAlerts > 0 ? 'text-red-500' : 'text-slate-400'} />
            {criticalAlerts > 0 && <span className="text-[10px] text-red-600 font-medium animate-pulse">严重{criticalAlerts}</span>}
          </div>
          <p className={`text-[24px] font-bold ${unhandledAlerts > 0 ? 'text-red-600' : 'text-slate-900'}`}>{unhandledAlerts}</p>
          <p className="text-[11px] text-slate-400">待处理预警</p>
        </div>
      </div>

      {/* Row 2: Charts & Details */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        {/* 客户状态分布 */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[13px] font-bold text-slate-900 mb-4">客户状态</h2>
          <div className="flex justify-around mb-4">
            <RingProgress value={activeCount} max={totalCustomers} color="#3b82f6" label="正常" />
            <RingProgress value={attentionCount} max={totalCustomers} color="#f59e0b" label="关注" />
            <RingProgress value={riskCount} max={totalCustomers} color="#ef4444" label="风险" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[16px] font-bold text-blue-600">{activeCount}</p>
              <p className="text-[10px] text-slate-400">正常</p>
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-amber-600">{attentionCount}</p>
              <p className="text-[10px] text-slate-400">关注</p>
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-red-600">{riskCount}</p>
              <p className="text-[10px] text-slate-400">风险</p>
            </div>
          </div>
        </div>

        {/* 任务完成情况 */}
        <div className="col-span-3 bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[13px] font-bold text-slate-900 mb-4">任务概况</h2>
          <div className="flex justify-center mb-4">
            <RingProgress value={completedTasks} max={TASKS.length} size={100} color="#10b981" label="完成率" />
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {[
              { label: '已完成', value: completedTasks, color: 'bg-emerald-400' },
              { label: '进行中', value: TASKS.filter(t => t.status === 'in_progress').length, color: 'bg-blue-400' },
              { label: '待处理', value: TASKS.filter(t => t.status === 'pending').length, color: 'bg-amber-400' },
              { label: '已逾期', value: overdueTasks, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[11px] text-slate-500 flex-1">{item.label}</span>
                <span className="text-[12px] font-medium text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 客户营收排行 */}
        <div className="col-span-6 bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-bold text-slate-900">客户月营收排行 <span className="text-slate-400 font-normal">(万元)</span></h2>
          </div>
          <BarChart data={revenueData} maxVal={Math.max(...revenueData.map(d => d.value))} />
        </div>
      </div>

      {/* Row 3: Events + Alerts + Policies */}
      <div className="grid grid-cols-3 gap-4">
        {/* 最近动态 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" /> 最近动态
          </h2>
          <div className="space-y-3">
            {recentEvents.map(e => {
              const style = EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.contact;
              return (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium ${style.color}`}>
                      {style.label[0]}
                    </div>
                    <div className="w-px flex-1 bg-slate-100 mt-1" />
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-slate-800">{e.customerName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${style.color}`}>{style.label}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 mt-0.5">{e.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{e.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 风险预警 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" /> 风险预警
          </h2>
          <div className="space-y-3">
            {MONITOR_ALERTS.filter(a => !a.isHandled).sort((a, b) => {
              const order = { critical: 0, warning: 1, info: 2 };
              return order[a.severity] - order[b.severity];
            }).slice(0, 5).map(a => (
              <div key={a.id} className={`p-3 rounded-lg border-l-[3px] ${
                a.severity === 'critical' ? 'bg-red-50/50 border-l-red-500' :
                a.severity === 'warning' ? 'bg-amber-50/50 border-l-amber-400' :
                'bg-blue-50/50 border-l-blue-400'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                    a.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    a.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>{a.severity === 'critical' ? '严重' : a.severity === 'warning' ? '警告' : '信息'}</span>
                  <span className="text-[11px] font-medium text-slate-800">{a.customerName}</span>
                </div>
                <p className="text-[12px] text-slate-600">{a.title}</p>
                <p className="text-[10px] text-slate-400 mt-1">{a.discoveredAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 政策动态 + 商机 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-[13px] font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-500" /> 热门商机 TOP3
            </h2>
            <div className="space-y-2.5">
              {OPPORTUNITIES.filter(o => o.status === 'new').sort((a, b) => b.confidence - a.confidence).slice(0, 3).map((o, i) => (
                <div key={o.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                    i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-800 truncate">{o.customerName} · {o.service}</p>
                    <p className="text-[10px] text-slate-400">置信度 {o.confidence}%</p>
                  </div>
                  <span className="text-[12px] font-bold text-amber-600">¥{o.estimatedValue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h2 className="text-[13px] font-bold text-slate-900 mb-3">行业分布</h2>
            <BarChart data={industryData} maxVal={Math.max(...industryData.map(d => d.value))} />
          </div>

          {unreadPolicies > 0 && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100/50 p-4">
              <p className="text-[12px] text-cyan-800 font-medium">
                📡 {unreadPolicies} 条未读政策更新
              </p>
              <p className="text-[11px] text-cyan-600 mt-1">点击"政策雷达"查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
