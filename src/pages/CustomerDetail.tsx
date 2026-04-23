import { useState } from 'react';
import { ArrowLeft, Building2, Phone, MapPin, Calendar, TrendingUp, Lightbulb, Clock, FileText, Users, Activity, MessageSquare, Edit3 } from 'lucide-react';
import { CUSTOMERS, TASKS, OPPORTUNITIES, CUSTOMER_EVENTS, MONITOR_ALERTS } from '../mock';

interface Props {
  customerId: string;
  onBack: () => void;
}

const EVENT_TYPE_STYLE: Record<string, { label: string; color: string; dotColor: string }> = {
  contact: { label: '沟通', color: 'bg-blue-50 text-blue-600', dotColor: 'bg-blue-500' },
  change: { label: '变更', color: 'bg-violet-50 text-violet-600', dotColor: 'bg-violet-500' },
  risk: { label: '风险', color: 'bg-red-50 text-red-600', dotColor: 'bg-red-500' },
  service: { label: '服务', color: 'bg-emerald-50 text-emerald-600', dotColor: 'bg-emerald-500' },
  opportunity: { label: '商机', color: 'bg-amber-50 text-amber-600', dotColor: 'bg-amber-500' },
  policy: { label: '政策', color: 'bg-cyan-50 text-cyan-600', dotColor: 'bg-cyan-500' },
};

export default function CustomerDetail({ customerId, onBack }: Props) {
  const c = CUSTOMERS.find(c => c.id === customerId);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'alerts'>('overview');

  if (!c) return <div className="p-6">客户不存在</div>;

  const tasks = TASKS.filter(t => t.customerId === customerId);
  const opps = OPPORTUNITIES.filter(o => o.customerId === customerId);
  const events = CUSTOMER_EVENTS.filter(e => e.customerId === customerId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const alerts = MONITOR_ALERTS.filter(a => a.customerId === customerId)
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());
  const daysSinceContact = Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-blue-600 mb-4 transition-colors">
        <ArrowLeft size={16} /> 返回客户列表
      </button>

      <div className="bg-white rounded-xl border border-slate-100 p-6 mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white
              ${c.status === 'active' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                c.status === 'attention' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                'bg-gradient-to-br from-red-500 to-rose-500'}`}>
              {c.name.slice(0, 1)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{c.name}</h1>
              <div className="flex items-center gap-4 mt-1.5 text-[12px] text-slate-500">
                <span className="flex items-center gap-1"><Building2 size={12} />{c.industry} · {c.taxpayerType}</span>
                <span className="flex items-center gap-1"><Users size={12} />{c.employeeCount}人</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{c.address}</span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {c.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`text-[32px] font-bold ${
                c.healthScore >= 80 ? 'text-emerald-600' : c.healthScore >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>{c.healthScore}</span>
              <span className="text-[12px] text-slate-400">健康分</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${
              c.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
              c.status === 'attention' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
            }`}>
              {c.status === 'active' ? '正常' : c.status === 'attention' ? '需关注' : '有风险'}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-5 gap-4 mt-6 pt-5 border-t border-slate-100">
          {[
            { label: '联系人', value: `${c.contact}  ${c.phone}`, icon: Phone },
            { label: '注册资本', value: c.registeredCapital, icon: FileText },
            { label: '月均营收', value: `¥${c.monthlyRevenue}万`, icon: TrendingUp },
            { label: '成立日期', value: c.establishedDate, icon: Calendar },
            { label: '最近联系', value: `${daysSinceContact}天前`, icon: Clock },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[11px] text-slate-400 flex items-center gap-1"><item.icon size={11} />{item.label}</p>
              <p className="text-[13px] text-slate-800 font-medium mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 mb-5 w-fit">
        {[
          { key: 'overview' as const, label: '概览', count: null },
          { key: 'timeline' as const, label: '动态', count: events.length },
          { key: 'alerts' as const, label: '预警', count: alerts.filter(a => !a.isHandled).length || null },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-[12px] rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === tab.key ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count != null && (
              <span className={`text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-5">
          {/* 服务项目 & 待办 */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14px] font-bold text-slate-900 mb-3">当前服务</h2>
              <div className="flex flex-wrap gap-2">
                {c.services.map(s => (
                  <span key={s} className="text-[12px] px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h2 className="text-[14px] font-bold text-slate-900 mb-3">待办事项</h2>
              {tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {tasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'overdue' ? 'bg-red-500' :
                          t.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`} />
                        <span className="text-[13px] text-slate-700">{t.title}</span>
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                        t.status === 'overdue' ? 'bg-red-50 text-red-600' :
                        t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.status === 'overdue' ? '已逾期' : t.status === 'completed' ? '已完成' : t.deadline.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-slate-400 py-4 text-center">暂无待办</p>
              )}
            </div>
          </div>

          {/* AI商机 */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-amber-500" />
              <h2 className="text-[14px] font-bold text-slate-900">AI 商机推荐</h2>
            </div>
            {opps.length > 0 ? (
              <div className="space-y-4">
                {opps.map(o => (
                  <div key={o.id} className="p-4 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/30 border border-amber-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-blue-600">{o.service}</span>
                      <span className="text-[14px] font-bold text-amber-600">¥{o.estimatedValue.toLocaleString()}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 leading-relaxed mb-3">{o.reason}</p>
                    <div className="bg-white/70 rounded-lg p-3 border border-amber-100/50">
                      <p className="text-[11px] text-slate-400 mb-1">💡 建议话术</p>
                      <p className="text-[12px] text-slate-700 leading-relaxed italic">"{o.suggestedTalk}"</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">AI置信度</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400" style={{ width: `${o.confidence}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-amber-600">{o.confidence}%</span>
                      </div>
                      <button className="text-[11px] px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        开始跟进
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-400 py-8 text-center">暂无AI推荐的商机</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              <h2 className="text-[14px] font-bold text-slate-900">客户动态</h2>
            </div>
            <button className="text-[12px] px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1">
              <Edit3 size={12} /> 添加记录
            </button>
          </div>
          {events.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-4">
                {events.map(e => {
                  const style = EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.contact;
                  return (
                    <div key={e.id} className="flex gap-4 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${style.dotColor}`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${style.color}`}>{style.label}</span>
                          <span className="text-[11px] text-slate-400">{e.timestamp}</span>
                          {e.source && <span className="text-[10px] text-slate-300">· {e.source}</span>}
                        </div>
                        <p className="text-[13px] font-medium text-slate-800">{e.title}</p>
                        <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{e.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 py-8 text-center">暂无动态记录</p>
          )}
        </div>
      )}

      {/* Alerts tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-red-500" />
            <h2 className="text-[14px] font-bold text-slate-900">监控预警</h2>
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(a => (
                <div key={a.id} className={`p-4 rounded-lg border-l-[3px] ${
                  a.severity === 'critical' ? 'bg-red-50/50 border-l-red-500' :
                  a.severity === 'warning' ? 'bg-amber-50/50 border-l-amber-400' :
                  'bg-blue-50/50 border-l-blue-400'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      a.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      a.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>{a.severity === 'critical' ? '严重' : a.severity === 'warning' ? '警告' : '信息'}</span>
                    <span className="text-[12px] font-medium text-slate-800">{a.title}</span>
                    {a.isHandled && <span className="text-[10px] text-emerald-500 ml-auto">✓ 已处理</span>}
                    {!a.isHandled && <span className="text-[10px] text-red-500 ml-auto">待处理</span>}
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed mt-1">{a.detail}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-400">{a.source}</span>
                    <span className="text-[10px] text-slate-400">{a.discoveredAt}</span>
                    {!a.isHandled && (
                      <button className="text-[11px] text-blue-600 hover:text-blue-700 ml-auto">标记已处理</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 py-8 text-center">暂无预警信息</p>
          )}
        </div>
      )}
    </div>
  );
}
