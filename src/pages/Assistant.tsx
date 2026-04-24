import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot, Sparkles, Copy, Users } from 'lucide-react';
import { Card, Badge, Button, Input } from '../components/ui';
import { CUSTOMERS } from '../mock';
import type { ChatMessage, Customer } from '../types';

/* ── AI 回复模板 ─────────────────────────────── */
function generateAIResponse(action: string, customer: Customer | null): string {
  if (!customer) return '请先在左侧选择一位客户，我才能为您生成针对性的沟通内容。';

  const c = customer;

  if (action.includes('回访话术')) {
    if (c.status === 'risk') {
      return `【${c.name} 回访话术】

${c.contact}${c.contact.endsWith('总') ? '' : '总'}您好，我是${c.assignedTo}。好久没跟您联系了，最近生意怎么样？

上次聊的时候您提到过一些想法，我一直记在心上。这段时间政策变化比较大，有几个对${c.industry}行业利好的政策想跟您分享一下。

另外，我们最近服务升级了，在${c.services.join('、')}这些基础上，还能提供更多增值服务，帮您省心省力。

您看这周什么时间方便，我过来拜访一下？带上最新的政策解读资料给您。

【要点提醒】
• 该客户已超过30天未联系，状态为流失预警
• 健康评分：${c.healthScore}/100，需重点关注
• 建议面访而非电话，体现重视程度
• 避免直接提及"很久没联系"，以分享政策为切入点`;
    }
    return `【${c.name} 回访话术】

${c.contact}${c.contact.endsWith('总') ? '' : '总'}您好，我是${c.assignedTo}，上次跟您沟通的账务问题都已经处理妥当了。

给您汇报一下最近的情况：${c.services.join('、')}这些业务都在正常推进中。${c.taxpayerType === '一般纳税人' ? '本月增值税申报已经准备好了，数据我发您确认一下。' : '本月的申报我们已经处理完毕。'}

另外，${c.industry}行业最近有个新政策跟咱们关系比较大，我整理了一份解读发给您看看。${c.monthlyRevenue > 50 ? '以咱们目前的营收规模，合理利用政策能省不少税。' : ''}

您看还有其他需要我们协助的吗？

【客户画像参考】
• 行业：${c.industry} | 纳税人类型：${c.taxpayerType}
• 月均营收：${c.monthlyRevenue}万 | 员工：${c.employeeCount}人
• 健康评分：${c.healthScore}/100
• 当前服务：${c.services.join('、')}`;
  }

  if (action.includes('社保调基') || action.includes('社保')) {
    return `【社保缴费基数调整通知 — ${c.name}】

尊敬的${c.contact}${c.contact.endsWith('总') ? '' : '总'}：

您好！根据浙江省人力资源和社会保障厅最新通知，自2026年7月1日起，社保缴费基数上下限将进行调整：

📋 调整详情：
• 缴费基数下限：4,462元/月 → 4,812元/月（+350元）
• 缴费基数上限：22,310元/月 → 24,060元/月（+1,750元）

💰 对贵司的影响测算：
• 当前参保人数：${c.employeeCount}人
• 若按下限缴费，每人每月增加约¥120
• 贵司预计每月社保成本增加约 ¥${(c.employeeCount * 120).toLocaleString()}
• 年度增加成本约 ¥${(c.employeeCount * 120 * 6).toLocaleString()}（7-12月）

📅 重要时间节点：
• 2026年6月30日前：确认各员工缴费基数
• 2026年7月1日起：新基数正式执行

如需我们协助核算各岗位最优缴费方案，请随时联系${c.assignedTo}。

此致
敬礼`;
  }

  if (action.includes('续费提醒') || action.includes('续费')) {
    const serviceList = c.services.map((s, i) => `${i + 1}. ${s}`).join('\n');
    return `【服务续费提醒 — ${c.name}】

尊敬的${c.contact}${c.contact.endsWith('总') ? '' : '总'}：

您好！感谢贵司一直以来对我们的信任与支持。

您当前的服务项目即将到期，现将续费事宜通知如下：

📋 当前服务项目：
${serviceList}

🔔 温馨提示：
• 为确保${c.taxpayerType === '一般纳税人' ? '增值税申报、企业所得税等' : '税务申报等'}业务不受影响，请在合同到期前完成续约
• 提前续费可享受老客户优惠价格
${c.tags.includes('VIP') || c.tags.includes('重点客户') ? '• 作为我们的VIP客户，我们为您准备了专属续费优惠方案' : ''}

💡 增值推荐：
根据${c.name}目前的经营状况（月均营收${c.monthlyRevenue}万，${c.employeeCount}名员工），我们建议增加以下服务以更好地保障贵司财税合规：
${c.taxpayerType === '一般纳税人' && !c.services.includes('税务筹划') ? '• 税务筹划 — 优化税负结构，预计年节税5-15%' : ''}
${c.employeeCount >= 10 && !c.services.includes('社保代缴') ? '• 社保代缴 — 合规管理员工社保，规避用工风险' : ''}
${c.monthlyRevenue > 100 && !c.services.includes('审计服务') ? '• 年度审计 — 满足银行贷款、招投标等需要' : ''}

请联系${c.assignedTo}了解详细续费方案。期待继续为您服务！`;
  }

  if (action.includes('政策解读') || action.includes('政策') || action.includes('邮件')) {
    return `【政策解读专报 — ${c.name}】

${c.contact}${c.contact.endsWith('总') ? '' : '总'}您好：

以下是近期与贵司密切相关的政策变化，我们为您梳理了要点和应对建议：

━━━━━━━━━━━━━━━━━━━━
📌 政策一：研发费用加计扣除比例提至120%
发文机关：财政部、税务总局
生效日期：2026年1月1日起

${c.industry === '信息技术' || c.industry === '互联网' || c.industry === '环保科技'
  ? `✅ 与贵司高度相关：作为${c.industry}企业，贵司的研发活动（软件开发、技术创新等）产生的费用可按120%加计扣除。按贵司目前营收规模（月均${c.monthlyRevenue}万），预计每年可额外节税约¥${Math.round(c.monthlyRevenue * 12 * 0.03 * 0.25 * 10000 / 10000)}万。`
  : `⚠️ 建议关注：虽然贵司非典型研发密集型企业，但${c.industry}行业中的工艺改进、产品升级等也可能归集为研发费用，建议梳理。`}

━━━━━━━━━━━━━━━━━━━━
📌 政策二：全电发票全面推广
生效日期：2026年9月1日起

⚠️ 行动要求：
• 8月底前完成开票系统升级
• 需要对接新的电子发票服务平台
• 我们可提供系统对接和人员培训支持

━━━━━━━━━━━━━━━━━━━━
${c.taxpayerType === '小规模' ? `📌 政策三：小微企业增值税减免延续至2027年
✅ 好消息：贵司作为小规模纳税人，月销售额10万以下继续免征增值税，超过10万按1%征收。该政策已延续到2027年底。` : ''}

如需进一步了解政策细节或制定应对方案，请随时联系我们。

${c.assignedTo}
联系电话：400-888-XXXX`;
  }

  // 通用回复
  return `好的，我来为【${c.name}】分析一下：

📊 客户概况：
• 企业名称：${c.name}
• 行业：${c.industry} | 纳税人类型：${c.taxpayerType}
• 联系人：${c.contact} | ${c.phone}
• 月均营收：${c.monthlyRevenue}万 | 员工：${c.employeeCount}人
• 注册资本：${c.registeredCapital} | 成立日期：${c.establishedDate}
• 健康评分：${c.healthScore}/100 | 状态：${c.status === 'active' ? '正常' : c.status === 'attention' ? '需关注' : '风险'}
• 当前服务：${c.services.join('、')}
${c.tags.length > 0 ? `• 标签：${c.tags.join('、')}` : ''}

📝 建议沟通方向：
${c.status === 'risk' ? '⚠️ 该客户处于风险状态，建议优先安排回访挽留。' : ''}
${c.healthScore < 70 ? '⚠️ 健康评分偏低，建议加强服务质量和沟通频率。' : '✅ 客户状态良好，可适时推荐增值服务。'}

您想让我生成什么类型的沟通模板？可以点击上方快捷按钮，或直接告诉我您的需求。`;
}

/* ── 快捷操作 ─────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: '生成回访话术', icon: '🗣️' },
  { label: '写社保调基通知', icon: '📋' },
  { label: '写续费提醒', icon: '🔔' },
  { label: '写政策解读邮件', icon: '📧' },
];

let msgIdCounter = 0;
function nextId() {
  return `msg-${++msgIdCounter}-${Date.now()}`;
}

/* ── 辅助函数 ─────────────────────────────────── */
function statusVariant(status: Customer['status']): 'ok' | 'warn' | 'bad' {
  if (status === 'active') return 'ok';
  if (status === 'attention') return 'warn';
  return 'bad';
}

function statusLabel(status: Customer['status']): string {
  if (status === 'active') return '正常';
  if (status === 'attention') return '需关注';
  return '风险';
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-ok)';
  if (score >= 60) return 'var(--color-warn)';
  return 'var(--color-bad)';
}

/* ── 主组件 ───────────────────────────────────── */
export default function Assistant() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是您的AI沟通助手 🤖\n\n我可以帮您生成专业的客户沟通内容，包括：\n• 回访话术 — 针对客户情况定制沟通策略\n• 社保调基通知 — 生成规范的政策通知\n• 续费提醒 — 专业的服务续约提醒\n• 政策解读邮件 — 将复杂政策转化为客户易懂的解读\n\n请先选择一位客户，然后点击快捷操作或直接输入您的需求。',
      timestamp: new Date().toISOString(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = CUSTOMERS.find(c => c.id === selectedCustomerId) || null;

  const filteredCustomers = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function handleSend(text: string) {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiContent = generateAIResponse(text, selectedCustomer);
      const aiMsg: ChatMessage = {
        id: nextId(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        type: 'template',
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }

  function handleCopy(id: string, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  }

  return (
    <div className="anim-fade-in p-6 max-w-[1200px] mx-auto h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--color-accent)]" />
          <h1 className="text-lg font-semibold text-[var(--color-t1)]">AI 沟通助手</h1>
        </div>
        <span className="text-sm text-[var(--color-t3)] ml-1">智能生成客户沟通话术、通知、邮件</span>
      </div>

      <div className="flex gap-4 h-[calc(100%-3.5rem)]">
        {/* ── Left Sidebar: Customer Selector ── */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4 overflow-hidden">
          {/* Customer search & list */}
          <Card padding="sm" className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Users size={14} className="text-[var(--color-t3)]" />
              <span className="text-[13px] font-medium text-[var(--color-t1)]">客户列表</span>
              <span className="text-[11px] text-[var(--color-t4)] ml-auto">{CUSTOMERS.length}</span>
            </div>
            <Input
              search
              placeholder="搜索客户..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto -mx-1 px-1">
              {filteredCustomers.map(c => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={[
                      'w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150',
                      'flex items-center gap-2.5',
                      isSelected
                        ? 'bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/30'
                        : 'bg-transparent border border-transparent hover:bg-[var(--color-surface-2)]',
                    ].join(' ')}
                  >
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold"
                      style={{
                        background: isSelected ? 'var(--color-accent)' : 'var(--color-surface-3)',
                        color: isSelected ? '#fff' : 'var(--color-t2)',
                      }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-[var(--color-t1)] truncate">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--color-t4)] truncate">{c.contact}</span>
                        <Badge variant={statusVariant(c.status)}>{statusLabel(c.status)}</Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-6 text-[12px] text-[var(--color-t4)]">
                  未找到匹配的客户
                </div>
              )}
            </div>
          </Card>

          {/* Customer info card */}
          {selectedCustomer ? (
            <Card padding="sm" className="flex-1 overflow-auto">
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[12px] font-bold"
                  style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}
                >
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--color-t1)] truncate">
                    {selectedCustomer.name}
                  </div>
                  <div className="text-[10px] text-[var(--color-t4)]">
                    {selectedCustomer.industry} · {selectedCustomer.taxpayerType}
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 text-[12px] text-[var(--color-t2)] px-1">
                <div className="flex justify-between">
                  <span className="text-[var(--color-t4)]">联系人</span>
                  <span>{selectedCustomer.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-t4)]">电话</span>
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-t4)]">负责人</span>
                  <span>{selectedCustomer.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-t4)]">月均营收</span>
                  <span>{selectedCustomer.monthlyRevenue}万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-t4)]">员工</span>
                  <span>{selectedCustomer.employeeCount}人</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-t4)]">健康评分</span>
                  <span className="font-medium" style={{ color: scoreColor(selectedCustomer.healthScore) }}>
                    {selectedCustomer.healthScore}/100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-t4)]">状态</span>
                  <Badge variant={statusVariant(selectedCustomer.status)}>
                    {statusLabel(selectedCustomer.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-[var(--color-t4)] block mb-1">服务</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCustomer.services.map(s => (
                      <Badge key={s} variant="accent">{s}</Badge>
                    ))}
                  </div>
                </div>
                {selectedCustomer.tags.length > 0 && (
                  <div>
                    <span className="text-[var(--color-t4)] block mb-1">标签</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCustomer.tags.map(t => (
                        <Badge key={t} variant="default">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--color-t4)]">最后联系</span>
                  <span>{selectedCustomer.lastContact}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="sm" className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <Users size={28} className="mx-auto mb-2" style={{ color: 'var(--color-t4)' }} />
                <p className="text-[12px] text-[var(--color-t4)]">选择左侧客户<br/>查看详细信息</p>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right Side: Chat Area ── */}
        <div
          className="flex-1 flex flex-col rounded-xl overflow-hidden"
          style={{
            background: 'var(--color-panel)',
            border: '1px solid var(--color-b0)',
          }}
        >
          {/* Quick actions bar */}
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-b0)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-[var(--color-amber)]" />
              <span className="text-[11px] text-[var(--color-t3)]">快捷操作</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {QUICK_ACTIONS.map(a => (
                <Button
                  key={a.label}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSend(a.label)}
                  disabled={isTyping}
                >
                  <span>{a.icon}</span>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-auto px-4 py-4 space-y-4"
            style={{ background: 'var(--color-base)' }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} anim-fade-up`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                  style={{
                    background: msg.role === 'user'
                      ? 'var(--color-accent)'
                      : 'linear-gradient(135deg, var(--color-accent) 0%, #7c5dd8 100%)',
                  }}
                >
                  {msg.role === 'user'
                    ? <User size={15} className="text-white" />
                    : <Bot size={15} className="text-white" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className="rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap font-sans"
                    style={{
                      background: msg.role === 'user'
                        ? 'var(--color-accent)'
                        : 'var(--color-surface-2)',
                      color: msg.role === 'user' ? '#fff' : 'var(--color-t1)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--color-b0)',
                      borderRadius: msg.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                    }}
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    <span className="text-[10px]" style={{ color: 'var(--color-t4)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(msg.id, msg.content)}
                      >
                        <Copy size={11} />
                        {copiedId === msg.id ? '已复制' : '复制'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 anim-fade-up">
                <div
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #7c5dd8 100%)',
                  }}
                >
                  <Bot size={15} className="text-white" />
                </div>
                <div
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-b0)',
                    borderRadius: '16px 16px 16px 4px',
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-t4)', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-t4)', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-t4)', animationDelay: '300ms' }} />
                    <span className="text-[11px] ml-2" style={{ color: 'var(--color-t4)' }}>AI 正在生成...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            className="px-4 py-3 border-t"
            style={{ borderColor: 'var(--color-b0)' }}
          >
            <div className="flex gap-2 items-end">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown as any}
                placeholder={selectedCustomer ? `为 ${selectedCustomer.name} 生成沟通内容...` : '请先选择客户，再输入需求...'}
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 text-[13px] rounded-xl outline-none max-h-[120px]"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-b0)',
                  color: 'var(--color-t1)',
                  minHeight: '42px',
                }}
              />
              <Button
                variant="primary"
                size="md"
                icon
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim() || isTyping}
              >
                <Send size={15} />
              </Button>
            </div>
            <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--color-t4)' }}>
              按 Enter 发送 · Shift+Enter 换行 · AI 生成内容仅供参考，请根据实际情况调整
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
