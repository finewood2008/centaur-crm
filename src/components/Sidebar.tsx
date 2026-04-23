import {
  LayoutDashboard, Users, CalendarDays, Lightbulb, Radar, Sparkles,
  Upload, MessageSquare, Shield, BarChart3
} from 'lucide-react';
import type { NavItem } from '../types';
import { DASHBOARD_STATS, MONITOR_ALERTS } from '../mock';

const NAV_SECTIONS: {
  title?: string;
  items: { key: NavItem; label: string; icon: typeof LayoutDashboard; badge?: number }[];
}[] = [
  {
    items: [
      { key: 'dashboard', label: '工作台', icon: LayoutDashboard },
      { key: 'cockpit', label: 'AI 驾驶舱', icon: BarChart3 },
    ],
  },
  {
    title: '客户',
    items: [
      { key: 'customers', label: '客户管理', icon: Users, badge: DASHBOARD_STATS.totalCustomers },
      { key: 'import', label: '客户导入', icon: Upload },
    ],
  },
  {
    title: '智能',
    items: [
      { key: 'calendar', label: '智能日历', icon: CalendarDays, badge: DASHBOARD_STATS.overdueTasks > 0 ? DASHBOARD_STATS.overdueTasks : undefined },
      { key: 'opportunities', label: '商机引擎', icon: Lightbulb, badge: DASHBOARD_STATS.newOpportunities },
      { key: 'policies', label: '政策雷达', icon: Radar, badge: DASHBOARD_STATS.unreadPolicies > 0 ? DASHBOARD_STATS.unreadPolicies : undefined },
      { key: 'monitor', label: '智能监控', icon: Shield, badge: MONITOR_ALERTS.filter(a => !a.isHandled).length || undefined },
      { key: 'assistant', label: 'AI 助手', icon: MessageSquare },
    ],
  },
];

interface Props {
  current: NavItem;
  onChange: (tab: NavItem) => void;
}

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="w-56 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-wide">半人马 CRM</h1>
            <p className="text-[10px] text-slate-400">AI-Native · 财税版</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && (
              <p className="text-[10px] text-slate-500 uppercase tracking-wider px-2 mb-1.5">{section.title}</p>
            )}
            {section.items.map(item => (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all mb-0.5 ${
                  current === item.key
                    ? 'bg-blue-600/20 text-blue-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                <item.icon size={16} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && (
                  <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium ${
                    current === item.key ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[11px] font-bold">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-slate-300 truncate">管理员</p>
            <p className="text-[10px] text-slate-500">免费版</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
