import { useState, useRef, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare } from 'lucide-react';
import { useCRMData } from '../context/CRMDataContext';
import { processAICommand } from '../engine';
import CentaurLogo from './CentaurLogo';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  isAction?: boolean;
}

const QUICK_ACTIONS = [
  '查看当前有多少客户',
  '有哪些待办需要处理',
  '给锐思科技创建一个税务申报待办',
  '把海川贸易改成关注',
];

interface Props {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function AIFloat({ open, onClose, onOpen }: Props) {
  const { state, dispatch } = useCRMData();
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant',
    ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    content: '你好！我是你的 AI 助手。可以直接帮你操作 CRM——创建任务、更新客户状态、推进商机。试试下面的快捷操作，或直接告诉我你的需求。',
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync open state
  useEffect(() => {
    if (open) {
      setShowPanel(true);
    } else {
      const timer = setTimeout(() => setShowPanel(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
      const reply = processAICommand(text, state, dispatch);
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: reply, ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
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
    <>
      {/* ── 右下角浮动气泡 ── */}
      {!open && (
        <button
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), #6ba0ff)',
            boxShadow: '0 4px 20px rgba(79,140,255,0.35)',
          }}
        >
          <MessageSquare size={20} className="text-white" />
        </button>
      )}

      {/* ── 弹出对话框 ── */}
      {showPanel && (
        <div className="fixed bottom-6 right-6 z-40 anim-fade-up">
          <div
            className={[
              'w-[420px] h-[560px] rounded-2xl flex flex-col overflow-hidden',
              'transition-all duration-200',
              open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
            ].join(' ')}
            style={{
              background: 'var(--color-panel)',
              border: '1px solid var(--color-b1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-b0)] shrink-0">
              <div className="flex items-center gap-2">
                <CentaurLogo size={24} />
                <span className="text-[13px] font-semibold text-[var(--color-t1)]">AI 助手</span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--color-t4)] hover:text-[var(--color-t1)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(m => (
                <div key={m.id} className="anim-fade-in">
                  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] group">
                      <div
                        className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap"
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
                      <div className="flex items-center gap-2 mt-0.5 px-1">
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
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start anim-fade-in">
                  <div
                    className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
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
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-[var(--color-b0)] shrink-0">
              {QUICK_ACTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-[10px] px-2.5 py-1 rounded-full transition-all hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 text-[var(--color-t4)] border border-[var(--color-b0)] bg-[var(--color-surface-2)]"
                >
                  {q.length > 18 ? q.slice(0, 18) + '…' : q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[var(--color-b0)] shrink-0">
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2"
                style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-b1)' }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="说句话就能操作CRM..."
                  rows={1}
                  className="flex-1 bg-transparent text-[13px] resize-none outline-none text-[var(--color-t1)] placeholder:text-[var(--color-t4)]"
                  style={{ maxHeight: '80px' }}
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
              <p className="text-[9px] mt-1 px-1 text-[var(--color-t4)]">
                Enter 发送 · Shift+Enter 换行 · ⌘K 打开/关闭
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
