import { useState } from 'react';
import {
  Shield, AlertTriangle, AlertCircle, Info, Clock, CheckCircle2,
  Eye, EyeOff, Activity, Search,
  Building2, Receipt, Globe, FileText, Scale,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { MONITOR_RULES, MONITOR_ALERTS, CUSTOMERS } from '../mock';
import type { MonitorRule, MonitorAlert } from '../types';

/* ── constants ──────────────────────────────────── */

const RULE_TYPE_META: Record<MonitorRule['type'], { label: string; Icon: typeof Shield; bg: string; fg: string }> = {
  business_change: { label: '工商变更', Icon: Building2, bg: 'rgba(0,123,194,0.15)', fg: 'var(--color-info)' },
  tax_anomaly:     { label: '税务异常', Icon: Receipt,   bg: 'rgba(236,126,0,0.15)',  fg: 'var(--color-warn)' },
  public_opinion:  { label: '网络舆情', Icon: Globe,     bg: 'rgba(94,106,210,0.15)', fg: 'var(--color-accent)' },
  license_expiry:  { label: '证照到期', Icon: FileText,  bg: 'rgba(113,112,255,0.15)', fg: 'var(--color-accent-bright)' },
  legal_risk:      { label: '法律风险', Icon: Scale,     bg: 'rgba(226,59,74,0.15)',  fg: 'var(--color-bad)' },
};

const SEVERITY_META: Record<MonitorAlert['severity'], { label: string; fg: string; borderColor: string; badgeClass: string; Icon: typeof AlertCircle }> = {
  critical: { label: '严重', fg: 'var(--color-bad)',  borderColor: 'var(--color-bad)',  badgeClass: 'badge-bad',  Icon: AlertCircle },
  warning:  { label: '警告', fg: 'var(--color-warn)', borderColor: 'var(--color-warn)', badgeClass: 'badge-warn', Icon: AlertTriangle },
  info:     { label: '信息', fg: 'var(--color-info)', borderColor: 'var(--color-info)', badgeClass: 'badge-info', Icon: Info },
};

const FREQ_LABEL: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  realtime: '实时',
};

type FilterTab = 'all' | 'critical' | 'warning' | 'info' | 'unhandled';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: '全部' },
  { key: 'critical',  label: '严重' },
  { key: 'warning',   label: '警告' },
  { key: 'info',      label: '信息' },
  { key: 'unhandled', label: '未处理' },
];

/* ── component ──────────────────────────────────── */

export default function Monitor() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  /* ── filter alerts ── */
  const filteredAlerts = [...MONITOR_ALERTS]
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime())
    .filter(a => {
      if (activeTab === 'unhandled') return !a.isHandled;
      if (activeTab !== 'all') return a.severity === activeTab;
      return true;
    })
    .filter(a => {
      if (!searchText) return true;
      const q = searchText.toLowerCase();
      return (
        a.customerName.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.ruleName.toLowerCase().includes(q)
      );
    });

  /* ── stats ── */
  const criticalCount  = MONITOR_ALERTS.filter(a => a.severity === 'critical' && !a.isHandled).length;
  const warningCount   = MONITOR_ALERTS.filter(a => a.severity === 'warning'  && !a.isHandled).length;
  const unhandledCount = MONITOR_ALERTS.filter(a => !a.isHandled).length;
  const enabledRules   = MONITOR_RULES.filter(r => r.enabled).length;

  return (
    <div className="anim-fade-in p-6 max-w-[1100px] mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1
          className="text-xl font-bold flex items-center gap-2"
          style={{ color: 'var(--color-t1)' }}
        >
          <Shield size={22} style={{ color: 'var(--color-accent)' }} />
          AI 智能监控
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-t3)' }}>
          自动监控客户工商、税务、舆情等变化，第一时间发现风险与商机
        </p>
      </div>

      {/* ── Stats Banner ── */}
      <div
        className="card rounded-xl p-4 mb-6 flex items-center gap-6 flex-wrap"
        style={{
          background: 'linear-gradient(135deg, rgba(94,106,210,0.12) 0%, rgba(113,112,255,0.06) 100%)',
          border: '1px solid var(--color-b1)',
        }}
      >
        <div className="flex items-center gap-2">
          <Activity size={16} style={{ color: 'var(--color-accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--color-t2)' }}>运行中规则</span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent-bright)' }}>
            {enabledRules}/{MONITOR_RULES.length}
          </span>
        </div>
        <div className="w-px h-5" style={{ background: 'var(--color-b1)' }} />
        <span className="text-[13px]" style={{ color: 'var(--color-t2)' }}>
          待处理{' '}
          <span className="font-bold" style={{ color: 'var(--color-bad)' }}>{unhandledCount}</span>
          {' '}条预警
        </span>
        <div className="w-px h-5" style={{ background: 'var(--color-b1)' }} />
        {criticalCount > 0 && (
          <span
            className="anim-breathe text-[13px] font-medium flex items-center gap-1"
            style={{ color: 'var(--color-bad)' }}
          >
            <AlertCircle size={14} /> 严重 {criticalCount}
          </span>
        )}
        {warningCount > 0 && (
          <span
            className="text-[13px] font-medium flex items-center gap-1"
            style={{ color: 'var(--color-warn)' }}
          >
            <AlertTriangle size={14} /> 警告 {warningCount}
          </span>
        )}
      </div>

      {/* ── Monitoring Rules Grid ── */}
      <div className="mb-8">
        <h2
          className="text-[14px] font-bold mb-3 flex items-center gap-1.5"
          style={{ color: 'var(--color-t1)' }}
        >
          <Eye size={15} style={{ color: 'var(--color-accent)' }} /> 监控规则
        </h2>
        <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONITOR_RULES.map(rule => {
            const meta = RULE_TYPE_META[rule.type];
            const IconComp = meta.Icon;
            const customerCount = rule.affectedCustomerIds.length;

            return (
              <div
                key={rule.id}
                className="card anim-fade-up rounded-xl p-4 transition-all"
                style={{
                  background: 'var(--color-panel)',
                  border: '1px solid var(--color-b1)',
                  opacity: rule.enabled ? 1 : 0.5,
                }}
              >
                {/* Top row: icon + toggle */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: meta.bg }}
                  >
                    <IconComp size={18} style={{ color: meta.fg }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rule.enabled ? (
                      <Eye size={14} style={{ color: 'var(--color-ok)' }} />
                    ) : (
                      <EyeOff size={14} style={{ color: 'var(--color-t4)' }} />
                    )}
                    <div
                      className="w-9 h-5 rounded-full relative transition-colors cursor-default"
                      style={{ background: rule.enabled ? 'var(--color-ok)' : 'var(--color-b2)' }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-transform"
                        style={{
                          background: 'var(--color-t1)',
                          transform: rule.enabled ? 'translateX(18px)' : 'translateX(2px)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Name + description */}
                <h3 className="text-[13px] font-bold mb-1" style={{ color: 'var(--color-t1)' }}>
                  {rule.name}
                </h3>
                <p
                  className="text-[11px] leading-relaxed line-clamp-2 mb-3"
                  style={{ color: 'var(--color-t3)' }}
                >
                  {rule.description}
                </p>

                {/* Bottom info row */}
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-t4)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {FREQ_LABEL[rule.frequency]}
                  </span>
                  <span className="mono flex items-center gap-1">
                    <Activity size={12} />
                    {rule.lastRun ? rule.lastRun.slice(5) : '未运行'}
                  </span>
                  <span
                    className="ml-auto flex items-center gap-1 font-medium"
                    style={{ color: 'var(--color-t3)' }}
                  >
                    <Shield size={12} /> {customerCount} 客户
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Alert Feed ── */}
      <div>
        <h2
          className="text-[14px] font-bold mb-3 flex items-center gap-1.5"
          style={{ color: 'var(--color-t1)' }}
        >
          <AlertTriangle size={15} style={{ color: 'var(--color-warn)' }} /> 预警动态
        </h2>

        {/* Filter tabs + search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="tab-group">
            {FILTER_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              let count: number | null = null;
              if (tab.key === 'critical') count = MONITOR_ALERTS.filter(a => a.severity === 'critical').length;
              if (tab.key === 'warning')  count = MONITOR_ALERTS.filter(a => a.severity === 'warning').length;
              if (tab.key === 'unhandled') count = unhandledCount;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`tab-item ${isActive ? 'active' : ''}`}
                >
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span
                      className={
                        tab.key === 'critical' ? 'badge badge-bad'
                          : tab.key === 'warning' ? 'badge badge-warn'
                          : 'badge badge-neutral'
                      }
                      style={{ marginLeft: 4, fontSize: 10 }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative ml-auto">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-t4)' }}
            />
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索客户/预警..."
              className="text-[12px] pl-8 pr-3 py-1.5 rounded-lg w-52 focus:outline-none"
              style={{
                background: 'var(--color-surface-1)',
                border: '1px solid var(--color-b1)',
                color: 'var(--color-t1)',
              }}
            />
          </div>
        </div>

        {/* Alert list */}
        <div className="stagger space-y-3">
          {filteredAlerts.length === 0 && (
            <div className="text-center text-[13px] py-12" style={{ color: 'var(--color-t4)' }}>
              暂无匹配的预警
            </div>
          )}

          {filteredAlerts.map(alert => {
            const sev = SEVERITY_META[alert.severity];
            const SevIcon = sev.Icon;
            const expanded = expandedId === alert.id;
            const typeMeta = RULE_TYPE_META[alert.type];

            return (
              <div
                key={alert.id}
                className="card anim-fade-up rounded-xl overflow-hidden transition-all"
                style={{
                  background: 'var(--color-panel)',
                  border: '1px solid var(--color-b1)',
                  borderLeft: !alert.isHandled ? `3px solid ${sev.borderColor}` : undefined,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Severity icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${sev.fg} 15%, transparent)`,
                      }}
                    >
                      <SevIcon size={16} style={{ color: sev.fg }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top badges row */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`badge ${sev.badgeClass}`}>{sev.label}</span>
                        <span
                          className="badge"
                          style={{
                            background: typeMeta.bg,
                            color: typeMeta.fg,
                          }}
                        >
                          {typeMeta.label}
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: 'var(--color-t2)' }}>
                          {alert.customerName}
                        </span>
                        <span
                          className="mono text-[11px] ml-auto flex items-center gap-1"
                          style={{ color: 'var(--color-t4)' }}
                        >
                          <Clock size={11} /> {alert.discoveredAt}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[13px] font-bold mb-1" style={{ color: 'var(--color-t1)' }}>
                        {alert.title}
                      </h3>

                      {/* Source + status + expand */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px]" style={{ color: 'var(--color-t4)' }}>
                          来源: {alert.source}
                        </span>
                        {alert.isHandled ? (
                          <span
                            className="text-[11px] flex items-center gap-0.5 font-medium"
                            style={{ color: 'var(--color-ok)' }}
                          >
                            <CheckCircle2 size={12} /> 已处理
                          </span>
                        ) : (
                          <span
                            className="text-[11px] flex items-center gap-0.5 font-medium"
                            style={{ color: 'var(--color-bad)' }}
                          >
                            <AlertCircle size={12} /> 未处理
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedId(expanded ? null : alert.id)}
                          className="text-[12px] flex items-center gap-0.5 ml-auto"
                          style={{ color: 'var(--color-accent-hover)' }}
                        >
                          {expanded ? '收起' : '查看详情'}
                          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div
                    className="px-4 pb-4 pt-3"
                    style={{ borderTop: '1px solid var(--color-b0)' }}
                  >
                    <div
                      className="rounded-lg p-4 mb-3"
                      style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-b0)',
                      }}
                    >
                      <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--color-t3)' }}>
                        详细信息
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-t2)' }}>
                        {alert.detail}
                      </p>
                    </div>

                    {/* Related customer info */}
                    {(() => {
                      const customer = CUSTOMERS.find(c => c.id === alert.customerId);
                      if (!customer) return null;

                      const statusColor =
                        customer.status === 'active' ? 'var(--color-info)'
                          : customer.status === 'attention' ? 'var(--color-warn)'
                          : 'var(--color-bad)';

                      return (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                          style={{
                            background: 'var(--color-surface-1)',
                            border: '1px solid var(--color-b0)',
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold"
                            style={{ background: statusColor, color: 'var(--color-t1)' }}
                          >
                            {customer.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[12px] font-medium truncate"
                              style={{ color: 'var(--color-t2)' }}
                            >
                              {customer.name}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--color-t4)' }}>
                              {customer.contact} · {customer.phone} · {customer.industry}
                            </p>
                          </div>
                          <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>
                            健康分 {customer.healthScore}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="flex justify-end gap-2">
                      {!alert.isHandled && (
                        <button
                          className="text-[12px] px-4 py-1.5 rounded-lg transition-colors"
                          style={{
                            border: '1px solid var(--color-b1)',
                            color: 'var(--color-t2)',
                            background: 'var(--color-surface-1)',
                          }}
                        >
                          标记已处理
                        </button>
                      )}
                      <button
                        className="text-[12px] px-4 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: 'var(--color-accent)',
                          color: 'var(--color-t1)',
                        }}
                      >
                        联系客户
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
