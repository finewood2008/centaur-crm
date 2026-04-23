import {
  LayoutDashboard, Users, CalendarDays, Lightbulb, Radar, Sparkles,
  Upload, Shield, BarChart3, Command
} from 'lucide-react';
import type { NavItem } from '../types';
import { DASHBOARD_STATS, MONITOR_ALERTS } from '../mock';

const NAV: {
  title?: string;
  items: { key: NavItem; label: string; icon: typeof LayoutDashboard; badge?: number; accent?: boolean }[];
}[] = [
  {
    items: [
      { key: 'dashboard', label: '工作台', icon: LayoutDashboard },
      { key: 'cockpit', label: '驾驶舱', icon: BarChart3 },
    ],
  },
  {
    title: '客户',
    items: [
      { key: 'customers', label: '客户管理', icon: Users, badge: DASHBOARD_STATS.totalCustomers },
      { key: 'import', label: '智能导入', icon: Upload },
    ],
  },
  {
    title: '引擎',
    items: [
      { key: 'calendar', label: '服务日历', icon: CalendarDays, badge: DASHBOARD_STATS.overdueTasks > 0 ? DASHBOARD_STATS.overdueTasks : undefined },
      { key: 'opportunities', label: '商机引擎', icon: Lightbulb, badge: DASHBOARD_STATS.newOpportunities },
      { key: 'policies', label: '政策雷达', icon: Radar, badge: DASHBOARD_STATS.unreadPolicies > 0 ? DASHBOARD_STATS.unreadPolicies : undefined },
      { key: 'monitor', label: '风险监控', icon: Shield, badge: MONITOR_ALERTS.filter(a => !a.isHandled).length || undefined, accent: MONITOR_ALERTS.some(a => a.severity === 'critical' && !a.isHandled) },
    ],
  },
];

interface Props {
  current: NavItem;
  onChange: (tab: NavItem) => void;
}

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="w-[220px] h-screen flex flex-col shrink-0"
      style={{ background: 'var(--color-panel)', borderRight: '1px solid var(--color-b0)' }}>

      {/* Brand */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid var(--color-b0)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5e6ad2 0%, #7170ff 100%)' }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight" style={{ color: 'var(--color-t1)' }}>
              半人马 CRM
            </h1>
            <p className="text-[10px]" style={{ color: 'var(--color-t4)' }}>AI-Native · 财税版</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {NAV.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.title && (
              <p className="text-[10px] font-medium uppercase tracking-[0.5px] px-2 mb-2"
                style={{ color: 'var(--color-t4)' }}>{section.title}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = current === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onChange(item.key)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-all duration-150"
                    style={{
                      background: active ? 'var(--color-accent-muted)' : 'transparent',
                      color: active ? 'var(--color-accent-hover)' : 'var(--color-t3)',
                      borderLeft: active ? '2px solid var(--color-accent-bright)' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-t2)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-t3)'; } }}
                  >
                    <item.icon size={15} style={{ opacity: active ? 1 : 0.7 }} />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge != null && (
                      <span
                        className="text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium"
                        style={{
                          background: item.accent ? 'rgba(226,59,74,0.2)' : active ? 'rgba(94,106,210,0.25)' : 'var(--color-surface-3)',
                          color: item.accent ? 'var(--color-bad)' : active ? 'var(--color-accent-hover)' : 'var(--color-t3)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI shortcut */}
      <div className="px-3 py-2" style={{ borderTop: '1px solid var(--color-b0)' }}>
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all"
          style={{ background: 'var(--color-surface-1)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface-1)'; }}
        >
          <Command size={13} style={{ color: 'var(--color-t4)' }} />
          <span className="text-[11px] flex-1" style={{ color: 'var(--color-t4)' }}>AI 助手</span>
          <kbd className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-3)', color: 'var(--color-t4)' }}>⌘K</kbd>
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--color-b0)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
            style={{ background: 'linear-gradient(135deg, #5e6ad2, #7170ff)', color: 'white' }}>
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] truncate" style={{ color: 'var(--color-t2)' }}>管理员</p>
            <p className="text-[10px]" style={{ color: 'var(--color-t4)' }}>Pro 版</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
