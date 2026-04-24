import {
  LayoutDashboard, Users, CalendarDays, Lightbulb, Radar,
  Upload, Shield, BarChart3,
} from 'lucide-react';
import type { NavItem } from '../types';
import { useBrand } from '../context/BrandContext';
import type { CRMContext } from '../hooks/useCRM';
import CentaurLogo from './CentaurLogo';

interface SidebarProps {
  tab: NavItem;
  onTabChange: (tab: NavItem) => void;
  stats: CRMContext['stats'];
  criticalCount: number;
}

const SECTIONS: {
  title?: string;
  items: { key: NavItem; label: string; icon: typeof LayoutDashboard; badgeProp?: string; accent?: boolean }[];
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
      { key: 'customers', label: '客户管理', icon: Users, badgeProp: 'totalCustomers' },
      { key: 'import', label: '智能导入', icon: Upload },
    ],
  },
  {
    title: '引擎',
    items: [
      { key: 'calendar', label: '服务日历', icon: CalendarDays, badgeProp: 'overdueTasks' },
      { key: 'opportunities', label: '商机引擎', icon: Lightbulb, badgeProp: 'newOpportunities' },
      { key: 'policies', label: '政策雷达', icon: Radar, badgeProp: 'unreadPolicies' },
      { key: 'monitor', label: '风险监控', icon: Shield, accent: true },
    ],
  },
];

export default function Sidebar({ tab, onTabChange, stats, criticalCount }: SidebarProps) {
  const brand = useBrand();

  return (
    <aside
      className="w-[220px] h-screen flex flex-col shrink-0 border-r select-none"
      style={{ background: 'var(--color-panel)', borderColor: 'var(--color-b0)' }}
    >
      {/* Brand */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-b0)' }}>
        <div className="flex items-center gap-2.5">
          <CentaurLogo size={28} />
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-t1)]">
              {brand.name}
            </h1>
            <p className="text-[10px] text-[var(--color-t4)]">{brand.tagline}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {SECTIONS.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="text-[10px] font-medium uppercase tracking-wider px-2 mb-2 text-[var(--color-t4)]">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = tab === item.key;
                const badge = item.badgeProp
                  ? (stats as any)[item.badgeProp]
                  : item.accent
                    ? criticalCount
                    : undefined;

                return (
                  <button
                    key={item.key}
                    onClick={() => onTabChange(item.key)}
                    className={[
                      'w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150',
                      'focus:outline-none',
                      active
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                        : 'text-[var(--color-t3)] hover:text-[var(--color-t2)] hover:bg-[var(--color-surface-1)]',
                    ].join(' ')}
                    style={active ? { borderLeft: '2px solid var(--color-accent)' } : { borderLeft: '2px solid transparent' }}
                  >
                    <item.icon size={15} style={{ opacity: active ? 1 : 0.6 }} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badge != null && badge > 0 && (
                      <span
                        className={[
                          'text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium',
                          item.accent ? 'text-red-400 bg-red-500/15' : 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]',
                        ].join(' ')}
                      >
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--color-b0)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{ background: `linear-gradient(135deg, ${brand.accent}, #6ba0ff)`, color: 'white' }}
          >
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] truncate text-[var(--color-t2)]">管理员</p>
            <p className="text-[10px] text-[var(--color-t4)]">{brand.version}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
