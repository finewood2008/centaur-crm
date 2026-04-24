import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from './ui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

const QUICK_ACTIONS = [
  '帮我分析一下杭州锐思科技的税务优化空间',
  '给宁波海川贸易写一封退税率调整的通知',
  '哪些客户的社保成本会受基数调整影响？',
  '总结一下本周需要重点关注的事项',
];

function genResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('锐思') && lower.includes('税务')) {
    return `杭州锐思科技税务优化分析：

1. 当前税负率 8.2%，高于行业均值 5.8%
2. 研发费用加计扣除比例已提至 120%，可归集研发费用约 ¥98 万
3. 预估节税空间：¥12.4 万/年
4. 建议：立即启动研发费用归集，优先享受 Q1 政策红利

需要我生成详细方案给张建国吗？`;
  }
  if (lower.includes('海川') && (lower.includes('通知') || lower.includes('退税'))) {
    return `已为宁波海川贸易生成退税率调整通知：

---
王丽芳 总：

您好！我们在梳理海川的出口退税明细时发现，部分商品品类可能适用更高退税率。经初步测算，调整后预计年增退税额约 ¥8.5 万。

建议近期安排时间，我们为您做一次完整的退税率适用性审查。

如有疑问请随时联系。
---

需要我调整措辞或发送给客户吗？`;
  }
  if (lower.includes('社保') && lower.includes('基数')) {
    return `受 2026 年社保基数调整影响的客户（7月生效）：

• 杭州锐思科技 — 45人，月增成本 ¥5,400
• 宁波海川贸易 — 28人，月增成本 ¥3,360
• 浙江绿源环保 — 120人，月增成本 ¥14,400
• 杭州云帆网络 — 35人，月增成本 ¥4,200
• 嘉兴恒泰建材 — 55人，月增成本 ¥6,600
• 义乌锦绣电商 — 5人，月增成本 ¥600

合计影响 6 家客户，月总增成本 ¥34,560。建议分批通知，优先联系绿源环保和恒泰建材。`;
  }
  if (lower.includes('本周') || lower.includes('重点')) {
    return `本周重点关注事项：

🔴 严重
• 杭州味道餐饮 — 连续 2 月零申报但有银行流水，需立即核实
• 食品经营许可证 6/15 到期，需启动续期

⚠️ 警告
• 嘉兴恒泰建材 — 进项抵扣率连续 3 月超 95%，稽查风险
• 宁波海川贸易 — 被列入经营异常名录，需 30 日内补报

📋 待办
• 4/30 前完成 4 家客户增值税申报
• 杭州锐思科技高新复审材料 5/20 截止

建议今天先处理味道餐饮和海川贸易的紧急问题。`;
  }
  return `收到！我来分析一下您的问题。

基于当前 CRM 中 8 家客户的数据，我可以提供以下几方面的帮助：
• 客户画像分析和风险评估
• 生成沟通话术和通知文案
• 税务优化建议
• 政策影响分析

请告诉我需要针对哪个客户或哪个方面深入分析？`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AIFloat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    content: '你好！我是你的 AI 助手。可以帮你分析客户、生成话术、解读政策。试试下面的快捷操作，或直接告诉我你需要什么。',
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), ts };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: genResponse(text), ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end pr-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-[480px] h-[85vh] rounded-2xl flex flex-col overflow-hidden anim-fade-in"
        style={{
          background: 'var(--color-panel)',
          border: '1px solid var(--color-b1)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-b0)]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--color-accent), #6ba0ff)` }}
            >
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--color-t1)]">AI 助手</h2>
              <p className="text-[10px] text-[var(--color-t4)]">基于全量客户数据实时分析</p>
            </div>
          </div>
          <Button icon onClick={onClose} variant="ghost">
            <X size={14} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[90%] group">
                <div
                  className="rounded-xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: m.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    color: m.role === 'user' ? 'white' : 'var(--color-t2)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--color-b0)',
                  }}
                >
                  {m.content}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-[var(--color-t4)]">{m.ts}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => copy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[var(--color-t4)]"
                    >
                      {copiedId === m.id ? <><Check size={10} /> 已复制</> : <><Copy size={10} /> 复制</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-1.5"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-b0)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick actions */}
        <div className="px-5 py-2 flex flex-wrap gap-1.5 border-t border-[var(--color-b0)]">
          {QUICK_ACTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 text-[var(--color-t3)] border border-[var(--color-b0)] bg-[var(--color-surface-2)]"
            >
              {q.length > 20 ? q.slice(0, 20) + '…' : q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[var(--color-b0)]">
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-b1)' }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="问我任何关于客户的问题..."
              rows={1}
              className="flex-1 bg-transparent text-[13px] resize-none outline-none text-[var(--color-t1)] placeholder:text-[var(--color-t4)]"
              style={{ maxHeight: '100px' }}
            />
            <button
              onClick={() => send(input)}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{
                background: input.trim() ? 'var(--color-accent)' : 'var(--color-surface-3)',
                color: input.trim() ? 'white' : 'var(--color-t4)',
              }}
            >
              <Send size={13} />
            </button>
          </div>
          <p className="text-[10px] mt-1.5 px-1 text-[var(--color-t4)]">
            Enter 发送 · Shift+Enter 换行 · ⌘K 打开/关闭
          </p>
        </div>
      </div>
    </div>
  );
}
