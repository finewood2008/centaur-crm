import { Sparkles, AlertTriangle, Zap, Radar, ShieldAlert, CalendarClock, Users, MessageSquare, Lightbulb, Activity } from 'lucide-react';
import { Card, Badge, Button, SectionHeader } from '../components/ui';
import type { CRMState } from '../store';
import type { NavItem } from '../types';

interface Props {
  state: CRMState;
  onNavigate: (tab: NavItem) => void;
  onChat: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export default function Briefing({ state, onNavigate, onChat }: Props) {
  const overdueCount = state.tasks.filter(t => t.status === 'overdue').length;
  const newOpps = state.opportunities.filter(o => o.status === 'new');
  const criticalAlerts = state.monitorAlerts.filter(a => !a.isHandled && a.severity === 'critical');
  const riskCustomers = state.customers.filter(c => c.status === 'risk');
  const urgentTasks = state.tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.priority === 'high'));
  const activeCustomers = state.customers.filter(c => c.status === 'active');
  const dateStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="p-6 max-w-[960px] mx-auto anim-fade-in">
      {/* ── 问候 + AI 状态 ── */}
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-t1)]">{getGreeting()}，李会计</h1>
            <p className="text-[13px] mt-0.5 text-[var(--color-t3)]">{dateStr}</p>
          </div>
          <Button variant="primary" size="sm" onClick={onChat}>
            <MessageSquare size={13} />
            开始对话
          </Button>
        </div>

        {/* AI 简报卡 */}
        <div className="mt-4 rounded-xl p-4 flex items-start gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(79,140,255,0.08), rgba(107,160,255,0.04))',
            border: '1px solid rgba(79,140,255,0.15)',
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--color-accent)]/20">
            <Sparkles size={16} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-relaxed text-[var(--color-t2)]">
              {overdueCount > 0 && `有 ${overdueCount} 项逾期待办需要立即处理。`}
              {newOpps.length > 0 && `AI 发现 ${newOpps.length} 个新商机。`}
              {criticalAlerts.length > 0 && `${criticalAlerts.length} 条严重预警。`}
              {riskCustomers.length > 0 && `${riskCustomers.length} 个客户有流失风险。`}
              {overdueCount === 0 && newOpps.length === 0 && criticalAlerts.length === 0 && riskCustomers.length === 0 && '一切正常，没有需要特别关注的事项。'}
            </p>
            <button
              onClick={onChat}
              className="mt-2 text-[12px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              查看详情 →
            </button>
          </div>
        </div>
      </div>

      {/* ── 快捷概览卡片 ── */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger">
        <Card padding="md" hover={false}>
          <div className="flex items-center justify-between mb-2">
            <Users size={16} className="text-[var(--color-accent)]" />
            <Badge variant="accent">{activeCustomers.length}活跃</Badge>
          </div>
          <p className="mono text-[26px] font-semibold text-[var(--color-t1)]">{state.customers.length}</p>
          <p className="text-[11px] mt-0.5 text-[var(--color-t3)]">服务客户</p>
        </Card>

        <Card padding="md" hover={false}>
          <div className="flex items-center justify-between mb-2">
            <CalendarClock size={16} className={overdueCount > 0 ? 'text-red-400' : 'text-[var(--color-t3)]'} />
            <Badge variant={overdueCount > 0 ? 'bad' : 'ok'}>{overdueCount > 0 ? `${overdueCount}逾期` : '按时'}</Badge>
          </div>
          <p className="mono text-[26px] font-semibold text-[var(--color-t1)]">{state.tasks.filter(t => t.status !== 'completed').length}</p>
          <p className="text-[11px] mt-0.5 text-[var(--color-t3)]">待办事项</p>
        </Card>

        <Card padding="md" hover={false}>
          <div className="flex items-center justify-between mb-2">
            <Lightbulb size={16} className="text-amber-400" />
            <Badge variant="amber" dot>¥{state.opportunities.filter(o => o.status === 'new').reduce((s, o) => s + o.estimatedValue, 0).toLocaleString()}</Badge>
          </div>
          <p className="mono text-[26px] font-semibold text-[var(--color-t1)]">{newOpps.length}</p>
          <p className="text-[11px] mt-0.5 text-[var(--color-t3)]">新商机</p>
        </Card>

        <Card padding="md" hover={false}>
          <div className="flex items-center justify-between mb-2">
            <Activity size={16} className={
              criticalAlerts.length > 0 ? 'text-red-400' : riskCustomers.length > 0 ? 'text-amber-400' : 'text-green-400'
            } />
            <Badge variant={criticalAlerts.length > 0 ? 'bad' : riskCustomers.length > 0 ? 'warn' : 'ok'}>
              {criticalAlerts.length > 0 ? `${criticalAlerts.length}严重` : riskCustomers.length > 0 ? `${riskCustomers.length}关注` : '正常'}
            </Badge>
          </div>
          <p className="mono text-[26px] font-semibold text-[var(--color-t1)]">{criticalAlerts.length + riskCustomers.length}</p>
          <p className="text-[11px] mt-0.5 text-[var(--color-t3)]">待处理风险</p>
        </Card>
      </div>

      {/* ── 两列：紧急事项 + AI 推荐 ── */}
      <div className="grid grid-cols-2 gap-5 mb-6 stagger">

        {/* 左侧：紧急事项 */}
        <div className="space-y-4">
          <Card>
            <SectionHeader
              icon={<AlertTriangle size={14} className="text-red-400" />}
              title="紧急待办"
              action={{ label: '查看全部', onClick: () => onNavigate('calendar') }}
            />
            <div className="space-y-1">
              {urgentTasks.length === 0 ? (
                <p className="text-[12px] text-[var(--color-t4)] text-center py-6">暂无紧急待办</p>
              ) : (
                urgentTasks.slice(0, 5).map(t => {
                  const isOverdue = t.status === 'overdue';
                  return (
                    <div key={t.id} className={[
                      'flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors',
                      isOverdue ? 'bg-red-500/5 border-l-2 border-red-500' : 'border-l-2 border-transparent',
                    ].join(' ')}>
                      <div className={['w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', isOverdue ? 'bg-red-400' : 'bg-amber-400'].join(' ')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate text-[var(--color-t1)]">{t.title}</p>
                        <p className="text-[11px] mt-0.5 text-[var(--color-t4)]">{t.customerName}</p>
                      </div>
                      {isOverdue
                        ? <Badge variant="bad">已逾期</Badge>
                        : <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-t3)]">{t.deadline.slice(5)}</span>
                      }
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader
              icon={<ShieldAlert size={14} className="text-red-400" />}
              title="流失预警"
            />
            {riskCustomers.length === 0 ? (
              <p className="text-[12px] text-[var(--color-t4)] text-center py-6">暂无流失预警</p>
            ) : (
              <div className="space-y-1">
                {riskCustomers.map(c => {
                  const daysSince = Math.round((Date.now() - new Date(c.lastContact).getTime()) / 86400000);
                  return (
                    <div key={c.id} className="flex items-center gap-2 py-2 px-2.5 rounded-lg hover:bg-red-500/5 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-400" />
                      <span className="text-[12px] flex-1 text-[var(--color-t2)]">{c.name}</span>
                      <span className="mono text-[10px] text-red-400">{daysSince}天</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-[var(--color-b0)]">
              <button onClick={onChat} className="text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                和 AI 讨论应对方案 →
              </button>
            </div>
          </Card>
        </div>

        {/* 右侧：AI 推荐 */}
        <div className="space-y-4">
          <Card>
            <SectionHeader
              icon={<Zap size={14} className="text-amber-400" />}
              title="AI 商机推荐"
              action={{ label: '查看全部', onClick: () => onNavigate('opportunities') }}
            />
            <div className="space-y-3">
              {newOpps.length === 0 ? (
                <p className="text-[12px] text-[var(--color-t4)] text-center py-6">暂无新商机</p>
              ) : (
                newOpps.slice(0, 3).map(o => (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-lg transition-all cursor-pointer"
                    style={{ background: 'rgba(79,140,255,0.05)', border: '1px solid rgba(79,140,255,0.12)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[var(--color-t1)]">{o.customerName}</span>
                      <span className="mono text-[12px] font-semibold text-[var(--color-accent)]">¥{o.estimatedValue.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-t2)]">{o.service}</p>
                    <p className="text-[10px] mt-1 line-clamp-2 text-[var(--color-t4)]">{o.reason.slice(0, 60)}…</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${o.confidence}%`, background: 'linear-gradient(90deg, var(--color-accent), #6ba0ff)' }} />
                      </div>
                      <span className="mono text-[9px] text-[var(--color-t3)]">{o.confidence}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader
              icon={<Radar size={14} className="text-blue-400" />}
              title="政策动态"
              action={{ label: '查看全部', onClick: () => onNavigate('policies') }}
            />
            <div className="space-y-3">
              {state.policies.filter(p => !p.isRead).length === 0 ? (
                <p className="text-[12px] text-[var(--color-t4)] text-center py-6">暂无未读政策</p>
              ) : (
                state.policies.filter(p => !p.isRead).slice(0, 2).map(p => (
                  <div key={p.id} className="p-3 rounded-lg transition-colors bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={['w-1.5 h-1.5 rounded-full shrink-0', p.impact === 'high' ? 'bg-red-400' : 'bg-amber-400'].join(' ')} />
                      <span className="text-[12px] font-medium line-clamp-1 text-[var(--color-t1)]">{p.title}</span>
                    </div>
                    <p className="text-[11px] line-clamp-2 mt-1 text-[var(--color-t4)]">{p.summary.slice(0, 60)}…</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-[var(--color-t4)]">{p.source}</span>
                      <Badge variant="info">影响{p.affectedCount}个客户</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 快速操作 */}
          <Card padding="md" hover={false}>
            <p className="text-[11px] font-medium text-[var(--color-t3)] mb-2">快速操作</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '创建任务', action: '给锐思科技创建一个税务申报待办' },
                { label: '更新状态', action: '把海川贸易改成关注' },
                { label: '推进商机', action: '推进锐思科技的商机为跟进中' },
                { label: '分析客户', action: '杭州味道餐饮什么情况' },
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={onChat}
                  className="text-[10px] px-2.5 py-1 rounded-full transition-all hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 text-[var(--color-t4)] border border-[var(--color-b0)] bg-[var(--color-surface-2)]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
