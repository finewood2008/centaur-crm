import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { useCRMData } from '../context/CRMDataContext';
import { processAICommand } from '../engine';
import CentaurLogo from '../components/CentaurLogo';
import type { NavItem } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  isAction?: boolean;
}

const QUICK_ACTIONS = [
  '今天有什么要处理的',
  '看看锐思科技',
  '有哪些客户需要关注',
  '创建待办：给绿源环保安排高新复审',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早上好';
  if (h < 18) return '下午好';
  return '晚上好';
}

interface Props {
  onNavigate: (tab: NavItem) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { state, dispatch } = useCRMData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动汇报
  useEffect(() => {
    const overdue = state.tasks.filter(t => t.status === 'overdue').length;
    const pending = state.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const newOpps = state.opportunities.filter(o => o.status === 'new').length;
    const riskCusts = state.customers.filter(c => c.status === 'risk').length;
    const unhandledAlerts = state.monitorAlerts.filter(a => !a.isHandled).length;

    const content = `${getGreeting()}！我是 半人马，你的 AI 数字员工。\n\n**今日概况**\n• 服务客户：${state.customers.length} 家\n• 待办任务：${pending} 项${overdue > 0 ? `（其中 ${overdue} 项逾期）` : ''}\n• 新商机：${newOpps} 个\n• 风险客户：${riskCusts} 家\n• 未处理预警：${unhandledAlerts} 条\n\n你可以直接对我说：\n• "今天有什么要处理的" → 详细汇报\n• "看看锐思科技" → 查看客户\n• "创建待办" → 安排任务\n• "切换到客户管理" → 打开表格`;

    setMessages([{
      id: '0', role: 'assistant',
      ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      content,
    }]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (text: string) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), ts };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // 检查是否需要切换页面
    const lower = text.toLowerCase();
    if (lower.includes('切换到') || lower.includes('打开') || lower.includes('看看') && (lower.includes('客户列表') || lower.includes('日历') || lower.includes('商机') || lower.includes('驾驶舱'))) {
      setTimeout(() => {
        if (lower.includes('客户')) onNavigate('customers');
        else if (lower.includes('日历')) onNavigate('calendar');
        else if (lower.includes('商机')) onNavigate('opportunities');
        else if (lower.includes('驾驶舱') || lower.includes('仪表')) onNavigate('cockpit');
        else if (lower.includes('监控') || lower.includes('风险')) onNavigate('monitor');
        else if (lower.includes('政策')) onNavigate('policies');
        setTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(), role: 'assistant',
          content: `好，正在切换到${lower.includes('客户') ? '客户管理' : lower.includes('日历') ? '服务日历' : lower.includes('商机') ? '商机引擎' : lower.includes('驾驶舱') ? '驾驶舱' : lower.includes('监控') ? '风险监控' : lower.includes('政策') ? '政策雷达' : ''}页面...`,
          ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, 600);
      return;
    }

    setTimeout(() => {
      const reply = processAICommand(text, state, dispatch);
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: reply,
        ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isAction: reply.includes('已为') || reply.includes('已将') || reply.includes('已标记'),
      };
      setMessages(prev => [...prev, replyMsg]);
      setTyping(false);
    }, 500 + Math.random() * 800);
  };

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col anim-fade-in" style={{ background: 'var(--color-base)' }}>
      {/* 顶部品牌条 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-b0)] shrink-0">
        <div className="flex items-center gap-3">
          <CentaurLogo size={28} />
          <div>
            <h1 className="text-[14px] font-semibold text-[var(--color-t1)]">半人马</h1>
            <p className="text-[10px] text-[var(--color-t4)]">AI 数字员工</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--color-t4)]">
            {state.customers.length} 客户 · {state.tasks.filter(t => t.status !== 'completed').length} 待办
          </span>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-[800px] mx-auto w-full space-y-4">
        {messages.map(m => (
          <div key={m.id} className="anim-fade-in">
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={[
                  'max-w-[75%] group rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'rounded-br-md'
                    : 'rounded-bl-md',
                ].join(' ')}
                style={{
                  background: m.role === 'user'
                    ? 'var(--color-accent)'
                    : m.isAction
                      ? 'rgba(34,197,94,0.08)'
                      : 'var(--color-surface-2)',
                  color: m.role === 'user' ? 'white' : 'var(--color-t2)',
                  border: m.role === 'user'
                    ? 'none'
                    : m.isAction
                      ? '1px solid rgba(34,197,94,0.2)'
                      : '1px solid var(--color-b0)',
                }}
              >
                {m.content}
              </div>
            </div>
            <div className={`flex items-center gap-2 mt-0.5 px-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className="text-[10px] text-[var(--color-t4)]">{m.ts}</span>
              {m.role === 'assistant' && (
                <button
                  onClick={() => copy(m.id, m.content)}
                  className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-[10px] text-[var(--color-t4)] hover:text-[var(--color-accent)]"
                >
                  {copiedId === m.id ? <><Check size={10} /> 已复制</> : <><Copy size={10} /> 复制</>}
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start anim-fade-in">
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-b0)' }}
            >
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 快捷操作 */}
      <div className="px-6 py-2 border-t border-[var(--color-b0)] shrink-0">
        <div className="max-w-[800px] mx-auto flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              className="text-[12px] px-3 py-1.5 rounded-full transition-all hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 text-[var(--color-t4)] border border-[var(--color-b0)] bg-[var(--color-surface-1)]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 输入框 */}
      <div className="px-6 py-4 border-t border-[var(--color-b0)] shrink-0">
        <div className="max-w-[800px] mx-auto">
          <div
            className="flex items-end gap-2 rounded-xl px-4 py-3"
            style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-b1)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="说句话，我来帮你处理..."
              rows={1}
              className="flex-1 bg-transparent text-[14px] resize-none outline-none text-[var(--color-t1)] placeholder:text-[var(--color-t4)]"
              style={{ maxHeight: '100px' }}
            />
            <button
              onClick={() => send(input)}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              style={{
                background: input.trim() ? 'var(--color-accent)' : 'var(--color-surface-3)',
                color: input.trim() ? 'white' : 'var(--color-t4)',
              }}
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] mt-1.5 px-1 text-[var(--color-t4)]">
            Enter 发送 · Shift+Enter 换行 · 说"切换到客户管理"打开表格
          </p>
        </div>
      </div>
    </div>
  );
}
