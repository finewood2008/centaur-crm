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

const RULE_TYPE_META: Record<MonitorRule['type'], { label: string; Icon: typeof Shield; color: string }> = {
  business_change: { label: '工商变更', Icon: Building2, color: 'text-blue-600 bg-blue-50' },
  tax_anomaly:     { label: '税务异常', Icon: Receipt,   color: 'text-amber-600 bg-amber-50' },
  public_opinion:  { label: '网络舆情', Icon: Globe,     color: 'text-cyan-600 bg-cyan-50' },
  license_expiry:  { label: '证照到期', Icon: FileText,  color: 'text-purple-600 bg-purple-50' },
  legal_risk:      { label: '法律风险', Icon: Scale,     color: 'text-red-600 bg-red-50' },
};

const SEVERITY_STYLE: Record<MonitorAlert['severity'], { label: string; color: string; bg: string; Icon: typeof AlertCircle }> = {
  critical: { label: '严重', color: 'text-red-600',   bg: 'bg-red-50 border-red-100',     Icon: AlertCircle },
  warning:  { label: '警告', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', Icon: AlertTriangle },
  info:     { label: '信息', color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-100',   Icon: Info },
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
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield size={22} className="text-violet-600" /> AI 智能监控
        </h1>
        <p className="text-sm text-slate-500 mt-1">自动监控客户工商、税务、舆情等变化，第一时间发现风险与商机</p>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100/50 p-4 mb-6 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-violet-600" />
          <span className="text-[13px] text-slate-700">运行中规则</span>
          <span className="text-[13px] font-bold text-violet-600">{enabledRules}/{MONITOR_RULES.length}</span>
        </div>
        <div className="w-px h-5 bg-violet-200" />
        <span className="text-[13px] text-slate-700">
          待处理 <span className="font-bold text-red-500">{unhandledCount}</span> 条预警
        </span>
        <div className="w-px h-5 bg-violet-200" />
        {criticalCount > 0 && (
          <span className="text-[13px] text-red-600 font-medium flex items-center gap-1">
            <AlertCircle size={14} /> 严重 {criticalCount}
          </span>
        )}
        {warningCount > 0 && (
          <span className="text-[13px] text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle size={14} /> 警告 {warningCount}
          </span>
        )}
      </div>

      {/* ── Monitoring Rules Grid ── */}
      <div className="mb-8">
        <h2 className="text-[14px] font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <Eye size={15} className="text-violet-500" /> 监控规则
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONITOR_RULES.map(rule => {
            const meta = RULE_TYPE_META[rule.type];
            const IconComp = meta.Icon;
            const customerCount = rule.affectedCustomerIds.length;

            return (
              <div
                key={rule.id}
                className={`bg-white rounded-xl border p-4 transition-shadow hover:shadow-md ${
                  rule.enabled ? 'border-slate-100' : 'border-slate-100 opacity-60'
                }`}
              >
                {/* Top row: icon + toggle */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                    <IconComp size={18} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {rule.enabled ? (
                      <Eye size={14} className="text-emerald-500" />
                    ) : (
                      <EyeOff size={14} className="text-slate-400" />
                    )}
                    <div
                      className={`w-9 h-5 rounded-full relative transition-colors cursor-default ${
                        rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          rule.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Name + description */}
                <h3 className="text-[13px] font-bold text-slate-900 mb-1">{rule.name}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">{rule.description}</p>

                {/* Bottom info row */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {FREQ_LABEL[rule.frequency]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity size={12} />
                    {rule.lastRun ? rule.lastRun.slice(5) : '未运行'}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-slate-500 font-medium">
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
        <h2 className="text-[14px] font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-amber-500" /> 预警动态
        </h2>

        {/* Filter tabs + search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {FILTER_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              /* count badges */
              let count: number | null = null;
              if (tab.key === 'critical') count = MONITOR_ALERTS.filter(a => a.severity === 'critical').length;
              if (tab.key === 'warning')  count = MONITOR_ALERTS.filter(a => a.severity === 'warning').length;
              if (tab.key === 'unhandled') count = unhandledCount;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-[12px] px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm font-medium'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      tab.key === 'critical' ? 'bg-red-100 text-red-600'
                        : tab.key === 'warning' ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative ml-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="搜索客户/预警..."
              className="text-[12px] pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 w-52"
            />
          </div>
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 && (
            <div className="text-center text-[13px] text-slate-400 py-12">暂无匹配的预警</div>
          )}

          {filteredAlerts.map(alert => {
            const sev = SEVERITY_STYLE[alert.severity];
            const SevIcon = sev.Icon;
            const expanded = expandedId === alert.id;
            const typeMeta = RULE_TYPE_META[alert.type];

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                  !alert.isHandled ? 'border-l-[3px]' : 'border'
                } ${
                  !alert.isHandled && alert.severity === 'critical' ? 'border-l-red-500' :
                  !alert.isHandled && alert.severity === 'warning'  ? 'border-l-amber-400' :
                  !alert.isHandled && alert.severity === 'info'     ? 'border-l-blue-400' :
                  'border-slate-100'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Severity icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sev.bg} border`}>
                      <SevIcon size={16} className={sev.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top badges row */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${sev.bg} ${sev.color}`}>
                          {sev.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{alert.customerName}</span>
                        <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                          <Clock size={11} /> {alert.discoveredAt}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[13px] font-bold text-slate-900 mb-1">{alert.title}</h3>

                      {/* Source + status + expand */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-slate-400">来源: {alert.source}</span>
                        {alert.isHandled ? (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 font-medium">
                            <CheckCircle2 size={12} /> 已处理
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-500 flex items-center gap-0.5 font-medium">
                            <AlertCircle size={12} /> 未处理
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedId(expanded ? null : alert.id)}
                          className="text-[12px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 ml-auto"
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
                  <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-3">
                      <p className="text-[11px] text-slate-500 font-medium mb-1">详细信息</p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{alert.detail}</p>
                    </div>

                    {/* Related customer info */}
                    {(() => {
                      const customer = CUSTOMERS.find(c => c.id === alert.customerId);
                      if (!customer) return null;
                      return (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 mb-3">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white ${
                            customer.status === 'active' ? 'bg-blue-500' : customer.status === 'attention' ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            {customer.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-slate-700 font-medium truncate">{customer.name}</p>
                            <p className="text-[10px] text-slate-400">{customer.contact} · {customer.phone} · {customer.industry}</p>
                          </div>
                          <span className="text-[10px] text-slate-400">健康分 {customer.healthScore}</span>
                        </div>
                      );
                    })()}

                    <div className="flex justify-end gap-2">
                      {!alert.isHandled && (
                        <button className="text-[12px] px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          标记已处理
                        </button>
                      )}
                      <button className="text-[12px] px-4 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
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
