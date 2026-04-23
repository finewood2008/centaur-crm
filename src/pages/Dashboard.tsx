import { Users, AlertTriangle, CalendarClock, Lightbulb, TrendingUp, Radar, ArrowRight, Clock } from 'lucide-react';
import { DASHBOARD_STATS, TASKS, OPPORTUNITIES, POLICIES, CUSTOMERS } from '../mock';
import type { NavItem } from '../types';

interface Props {
  onNavigate: (tab: NavItem) => void;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[22px] font-bold text-slate-900">{value}</p>
          <p className="text-[12px] text-slate-500">{label}</p>
        </div>
      </div>
      {sub && <p className="text-[11px] text-slate-400 mt-2 pl-[52px]">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const urgentTasks = TASKS.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.priority === 'high')).slice(0, 4);
  const newOpps = OPPORTUNITIES.filter(o => o.status === 'new').slice(0, 3);
  const unreadPolicies = POLICIES.filter(p => !p.isRead).slice(0, 2);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">工作台</h1>
        <p className="text-sm text-slate-500 mt-1">今日概览 · {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="服务客户" value={DASHBOARD_STATS.totalCustomers}
          sub={`${DASHBOARD_STATS.attentionCustomers}个需关注 · ${DASHBOARD_STATS.riskCustomers}个有风险`}
          color="bg-blue-50 text-blue-600" />
        <StatCard icon={CalendarClock} label="待办事项" value={DASHBOARD_STATS.pendingTasks}
          sub={DASHBOARD_STATS.overdueTasks > 0 ? `${DASHBOARD_STATS.overdueTasks}个已逾期!` : '全部按时'}
          color={DASHBOARD_STATS.overdueTasks > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} />
        <StatCard icon={Lightbulb} label="新商机" value={DASHBOARD_STATS.newOpportunities}
          sub={`预估总价值 ¥${(DASHBOARD_STATS.totalOpportunityValue / 10000).toFixed(1)}万`}
          color="bg-amber-50 text-amber-600" />
        <StatCard icon={TrendingUp} label="平均健康度" value={`${DASHBOARD_STATS.avgHealthScore}分`}
          sub="客户整体状态良好"
          color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* 紧急待办 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h2 className="text-sm font-bold text-slate-900">紧急待办</h2>
            </div>
            <button onClick={() => onNavigate('calendar')} className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              查看全部 <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {urgentTasks.map(t => (
              <div key={t.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${t.status === 'overdue' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-800 truncate">{t.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.customerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {t.status === 'overdue' ? '已逾期' : t.deadline.slice(5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI商机推荐 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">AI商机推荐</h2>
            </div>
            <button onClick={() => onNavigate('opportunities')} className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              查看全部 <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {newOpps.map(o => (
              <div key={o.id} className="p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/30 border border-amber-100/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-slate-800">{o.customerName}</span>
                  <span className="text-[11px] font-bold text-amber-600">¥{o.estimatedValue.toLocaleString()}</span>
                </div>
                <p className="text-[12px] text-blue-600 font-medium">{o.service}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{o.reason.slice(0, 50)}...</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400" style={{ width: `${o.confidence}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400">{o.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 政策动态 */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radar size={16} className="text-cyan-500" />
              <h2 className="text-sm font-bold text-slate-900">政策动态</h2>
            </div>
            <button onClick={() => onNavigate('policies')} className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              查看全部 <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {unreadPolicies.map(p => (
              <div key={p.id} className="p-3 rounded-lg bg-cyan-50/30 border border-cyan-100/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.impact === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <span className="text-[12px] font-medium text-slate-800 line-clamp-1">{p.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{p.summary.slice(0, 60)}...</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">{p.source}</span>
                  <span className="text-[10px] text-cyan-600 font-medium">影响{p.affectedCount}个客户</span>
                </div>
              </div>
            ))}
          </div>

          {/* 流失预警 */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-red-500" />
              <h3 className="text-[12px] font-bold text-slate-900">流失预警</h3>
            </div>
            {CUSTOMERS.filter(c => c.status === 'risk').map(c => (
              <div key={c.id} className="flex items-center gap-2 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[12px] text-slate-700">{c.name}</span>
                <span className="text-[10px] text-red-500 ml-auto">
                  {Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000)}天未联系
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
