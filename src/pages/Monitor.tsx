import { useState } from 'react';
import {
  Shield, AlertTriangle, AlertCircle, Info, Clock, CheckCircle2,
  Eye, EyeOff, Activity, ChevronDown, ChevronUp,
  Building2, Receipt, Globe, FileText, Scale,
} from 'lucide-react';
import { Card, Badge, Button, Input, TabGroup, SectionHeader } from '../components/ui';
import { MONITOR_RULES, MONITOR_ALERTS, CUSTOMERS } from '../mock';
import type { MonitorRule, MonitorAlert } from '../types';

/* ── constants ──────────────────────────────────── */

const RULE_TYPE_META: Record<MonitorRule['type'], { label: string; Icon: typeof Shield; accentClass: string }> = {
  business_change: { label: '工商变更', Icon: Building2,  accentClass: 'text-blue-400 bg-blue-500/10' },
  tax_anomaly:     { label: '税务异常', Icon: Receipt,    accentClass: 'text-amber-400 bg-amber-500/10' },
  public_opinion:  { label: '网络舆情', Icon: Globe,      accentClass: 'text-indigo-400 bg-indigo-500/10' },
  license_expiry:  { label: '证照到期', Icon: FileText,   accentClass: 'text-purple-400 bg-purple-500/10' },
  legal_risk:      { label: '法律风险', Icon: Scale,      accentClass: 'text-red-400 bg-red-500/10' },
};

const SEVERITY_META: Record<MonitorAlert['severity'], { label: string; badgeVariant: 'bad' | 'warn' | 'info'; Icon: typeof AlertCircle; borderColor: string }> = {
  critical: { label: '严重', badgeVariant: 'bad',  Icon: AlertCircle, borderColor: 'var(--color-bad)' },
  warning:  { label: '警告', badgeVariant: 'warn', Icon: AlertTriangle, borderColor: 'var(--color-warn)' },
  info:     { label: '信息', badgeVariant: 'info', Icon: Info, borderColor: 'var(--color-info)' },
};

const FREQ_LABEL: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  realtime: '实时',
};

type FilterTab = 'all' | 'critical' | 'warning' | 'info' | 'unhandled';

const FILTER_TABS = [
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

  /* ── derived data ── */
  const unhandledAlerts = MONITOR_ALERTS.filter(a => !a.isHandled);
  const criticalCount  = unhandledAlerts.filter(a => a.severity === 'critical').length;
  const warningCount   = unhandledAlerts.filter(a => a.severity === 'warning').length;
  const enabledRules   = MONITOR_RULES.filter(r => r.enabled).length;

  const tabItems = FILTER_TABS.map(tab => {
    let badge: number | undefined;
    if (tab.key === 'critical')     badge = MONITOR_ALERTS.filter(a => a.severity === 'critical').length;
    else if (tab.key === 'warning') badge = MONITOR_ALERTS.filter(a => a.severity === 'warning').length;
    else if (tab.key === 'unhandled') badge = unhandledAlerts.length;
    return { ...tab, badge: badge && badge > 0 ? badge : undefined };
  });

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

  return (
    <div className="anim-fade-in p-6 max-w-[1100px] mx-auto">
      {/* ── Header ── */}
      <SectionHeader
        icon={<Shield size={18} className="text-[var(--color-accent)]" />}
        title="AI 智能监控"
        className="mb-1"
      />
      <p className="text-sm mt-1 mb-6 text-[var(--color-t3)]">
        自动监控客户工商、税务、舆情等变化，第一时间发现风险与商机
      </p>

      {/* ── Stats Banner ── */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-6 flex-wrap"
        style={{
          background: 'linear-gradient(135deg, rgba(94,106,210,0.12) 0%, rgba(113,112,255,0.06) 100%)',
          border: '1px solid var(--color-b1)',
        }}
      >
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[var(--color-accent)]" />
          <span className="text-[13px] text-[var(--color-t2)]">运行中规则</span>
          <span className="text-[13px] font-bold text-indigo-400">
            {enabledRules}/{MONITOR_RULES.length}
          </span>
        </div>
        <div className="w-px h-5 bg-[var(--color-b1)]" />
        <span className="text-[13px] text-[var(--color-t2)]">
          待处理{' '}
          <span className="font-bold text-red-400">{unhandledAlerts.length}</span>
          {' '}条预警
        </span>
        <div className="w-px h-5 bg-[var(--color-b1)]" />
        {criticalCount > 0 && (
          <span className="anim-breathe text-[13px] font-medium flex items-center gap-1 text-red-400">
            <AlertCircle size={14} /> 严重 {criticalCount}
          </span>
        )}
        {warningCount > 0 && (
          <span className="text-[13px] font-medium flex items-center gap-1 text-amber-400">
            <AlertTriangle size={14} /> 警告 {warningCount}
          </span>
        )}
      </div>

      {/* ── Monitoring Rules Grid ── */}
      <div className="mb-8">
        <SectionHeader
          icon={<Eye size={15} className="text-[var(--color-accent)]" />}
          title="监控规则"
        />

        <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONITOR_RULES.map(rule => {
            const meta = RULE_TYPE_META[rule.type];
            const IconComp = meta.Icon;
            const customerCount = rule.affectedCustomerIds.length;

            return (
              <Card
                key={rule.id}
                padding="md"
                className="anim-fade-up"
                style={{ opacity: rule.enabled ? 1 : 0.5 }}
              >
                {/* Top row: icon + toggle */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.accentClass}`}>
                    <IconComp size={18} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rule.enabled ? (
                      <Eye size={14} className="text-green-400" />
                    ) : (
                      <EyeOff size={14} className="text-[var(--color-t4)]" />
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
                <h3 className="text-[13px] font-bold mb-1 text-[var(--color-t1)]">
                  {rule.name}
                </h3>
                <p className="text-[11px] leading-relaxed line-clamp-2 mb-3 text-[var(--color-t3)]">
                  {rule.description}
                </p>

                {/* Bottom info row */}
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-t4)]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {FREQ_LABEL[rule.frequency]}
                  </span>
                  <span className="mono flex items-center gap-1">
                    <Activity size={12} />
                    {rule.lastRun ? rule.lastRun.slice(5) : '未运行'}
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-medium text-[var(--color-t3)]">
                    <Shield size={12} /> {customerCount} 客户
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Alert Feed ── */}
      <div>
        <SectionHeader
          icon={<AlertTriangle size={15} className="text-amber-400" />}
          title="预警动态"
        />

        {/* Filter tabs + search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabGroup
            items={tabItems}
            active={activeTab}
            onChange={key => setActiveTab(key as FilterTab)}
          />

          <div className="ml-auto">
            <Input
              search
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索客户/预警..."
              className="w-52"
            />
          </div>
        </div>

        {/* Alert list */}
        <div className="stagger space-y-3">
          {filteredAlerts.length === 0 && (
            <div className="text-center text-[13px] py-12 text-[var(--color-t4)]">
              暂无匹配的预警
            </div>
          )}

          {filteredAlerts.map(alert => {
            const sev = SEVERITY_META[alert.severity];
            const SevIcon = sev.Icon;
            const expanded = expandedId === alert.id;
            const typeMeta = RULE_TYPE_META[alert.type];

            return (
              <Card
                key={alert.id}
                padding="none"
                className="anim-fade-up overflow-hidden"
                style={{
                  borderLeft: !alert.isHandled ? `3px solid ${sev.borderColor}` : undefined,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Severity icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${sev.borderColor} 15%, transparent)`,
                      }}
                    >
                      <SevIcon size={16} style={{ color: sev.borderColor }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top badges row */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant={sev.badgeVariant}>{sev.label}</Badge>
                        <Badge variant="default" className={typeMeta.accentClass}>
                          {typeMeta.label}
                        </Badge>
                        <span className="text-[11px] font-medium text-[var(--color-t2)]">
                          {alert.customerName}
                        </span>
                        <span className="mono text-[11px] ml-auto flex items-center gap-1 text-[var(--color-t4)]">
                          <Clock size={11} /> {alert.discoveredAt}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[13px] font-bold mb-1 text-[var(--color-t1)]">
                        {alert.title}
                      </h3>

                      {/* Source + status + expand */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-[var(--color-t4)]">
                          来源: {alert.source}
                        </span>
                        {alert.isHandled ? (
                          <span className="text-[11px] flex items-center gap-0.5 font-medium text-green-400">
                            <CheckCircle2 size={12} /> 已处理
                          </span>
                        ) : (
                          <span className="text-[11px] flex items-center gap-0.5 font-medium text-red-400">
                            <AlertCircle size={12} /> 未处理
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expanded ? null : alert.id)}
                          className="ml-auto"
                        >
                          {expanded ? '收起' : '查看详情'}
                          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-[var(--color-b0)]">
                    <Card padding="md" hover={false} className="mb-3">
                      <p className="text-[11px] font-medium mb-1 text-[var(--color-t3)]">
                        详细信息
                      </p>
                      <p className="text-[13px] leading-relaxed text-[var(--color-t2)]">
                        {alert.detail}
                      </p>
                    </Card>

                    {/* Related customer info */}
                    {(() => {
                      const customer = CUSTOMERS.find(c => c.id === alert.customerId);
                      if (!customer) return null;

                      return (
                        <Card padding="sm" hover={false} className="mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white"
                              style={{
                                background:
                                  customer.status === 'active' ? 'var(--color-info)'
                                    : customer.status === 'attention' ? 'var(--color-warn)'
                                    : 'var(--color-bad)',
                              }}
                            >
                              {customer.name.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium truncate text-[var(--color-t2)]">
                                {customer.name}
                              </p>
                              <p className="text-[10px] text-[var(--color-t4)]">
                                {customer.contact} · {customer.phone} · {customer.industry}
                              </p>
                            </div>
                            <span className="text-[10px] text-[var(--color-t4)]">
                              健康分 {customer.healthScore}
                            </span>
                          </div>
                        </Card>
                      );
                    })()}

                    <div className="flex justify-end gap-2">
                      {!alert.isHandled && (
                        <Button variant="secondary" size="sm">
                          标记已处理
                        </Button>
                      )}
                      <Button variant="primary" size="sm">
                        联系客户
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
