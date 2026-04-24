import { useEffect, useState, useRef, type JSX } from 'react';
import type { NavItem, ViewMode } from './types';
import { useCRM } from './hooks/useCRM';
import { BrandProvider } from './context/BrandContext';
import { CRMProvider, useCRMData } from './context/CRMDataContext';
import { processAICommand } from './engine';
import Sidebar from './components/Sidebar';
import CentaurLogo from './components/CentaurLogo';
import Briefing from './pages/Briefing';
import { Send, ArrowLeft, Copy, Check } from 'lucide-react';
import { parseMessageContent } from './components/EmbeddedContent';
import EmbeddedRenderer from './components/EmbeddedRenderer';

/* ── 聊天类型 ──────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  contextCustomerId?: string;
  contextCustomerName?: string;
  isAction?: boolean;
}

function ChatView({ messages, typing, onSend, onBack, onCopy, copiedId }: {
  messages: ChatMessage[];
  typing: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
  onCopy: (id: string, text: string) => void;
  copiedId: string | null;
}) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-b0)] shrink-0">
        <button onClick={onBack} className="p-1 rounded-md text-[var(--color-t4)] hover:text-[var(--color-t1)] hover:bg-[var(--color-surface-2)] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <CentaurLogo size={22} />
        <span className="text-[14px] font-semibold text-[var(--color-t1)]">AI 协作</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">对话中</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className="anim-fade-in">
            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[70%] group">
                <div
                  className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: m.role === 'user' ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    color: m.role === 'user' ? 'white' : 'var(--color-t2)',
                    border: m.role === 'user' ? 'none'
                      : m.isAction ? '1px solid rgba(34,197,94,0.2)'
                      : '1px solid var(--color-b0)',
                  }}
                >
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <div className="space-y-2">
                      {parseMessageContent(m.content).map((seg, i) =>
                        seg.kind === 'text' && seg.text ? (
                          <div key={i} className="whitespace-pre-wrap text-[13px] leading-relaxed">{seg.text}</div>
                        ) : seg.kind === 'component' && seg.component ? (
                          <div key={i}><EmbeddedRenderer component={seg.component} /></div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 px-1">
                  <span className="text-[10px] text-[var(--color-t4)]">{m.ts}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => onCopy(m.id, m.content)}
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
            <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5 bg-[var(--color-surface-2)] border border-[var(--color-b0)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-[var(--color-b0)] shrink-0">
        <div className="flex items-end gap-2 rounded-xl px-4 py-2.5 bg-[var(--color-surface-1)] border border-[var(--color-b1)]">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="说句话就能操作CRM..."
            rows={1}
            className="flex-1 bg-transparent text-[13px] resize-none outline-none text-[var(--color-t1)] placeholder:text-[var(--color-t4)]"
            style={{ maxHeight: '80px' }}
          />
          <button
            onClick={send}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{
              background: input.trim() ? 'var(--color-accent)' : 'var(--color-surface-3)',
              color: input.trim() ? 'white' : 'var(--color-t4)',
            }}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[9px] mt-1.5 px-1 text-[var(--color-t4)]">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </div>
  );
}

/* ── 主应用内容 ──────────────────────────────── */

function AppContent() {
  const crm = useCRM();
  const { state, dispatch } = useCRMData();
  const { tab, setTab, selectedCustomerId, setSelectedCustomerId, stats, criticalAlerts } = crm;

  const [viewMode, setViewMode] = useState<ViewMode>('briefing');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'init', role: 'assistant', ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    content: '早上好！今天有' + state.tasks.filter(t => t.status === 'overdue').length + '项逾期待办、' + state.opportunities.filter(o => o.status === 'new').length + '个新商机、' + state.monitorAlerts.filter(a => !a.isHandled && a.severity === 'critical').length + '条严重预警。有什么需要我处理的？',
  }]);
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [globalInput, setGlobalInput] = useState('');

  // ⌘K toggles view
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (viewMode === 'briefing') {
          setViewMode('chat');
        } else {
          setViewMode('briefing');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewMode]);

  const sendToChat = (text: string) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, ts };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const reply = processAICommand(text, state, dispatch);
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: reply, ts: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isAction: reply.includes('已为') || reply.includes('已将') || reply.includes('已标记'),
      };
      setMessages(prev => [...prev, replyMsg]);
      setTyping(false);
    }, 500 + Math.random() * 800);
  };

  const handleGlobalSend = () => {
    if (!globalInput.trim()) return;
    if (viewMode === 'briefing') {
      setViewMode('chat');
    }
    sendToChat(globalInput.trim());
    setGlobalInput('');
  };

  // Render main area
  const renderMain = () => {
    if (viewMode === 'chat') {
      return (
        <ChatView
          messages={messages}
          typing={typing}
          onSend={sendToChat}
          onBack={() => setViewMode('briefing')}
          onCopy={(id, text) => {
            navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
          }}
          copiedId={copiedId}
        />
      );
    }

    // Briefing mode — show pages with AI briefing as default
    if (tab === 'dashboard' || tab === 'cockpit') {
      return <Briefing state={state} onNavigate={setTab} onChat={() => setViewMode('chat')} />;
    }

    if (tab === 'customers' && selectedCustomerId) {
      return (
        <CustomerDetail
          customerId={selectedCustomerId}
          onBack={() => setSelectedCustomerId(null)}
        />
      );
    }

    const pages: Record<NavItem, () => JSX.Element> = {
      dashboard:  () => <Briefing state={state} onNavigate={setTab} onChat={() => setViewMode('chat')} />,
      cockpit:    () => <Briefing state={state} onNavigate={setTab} onChat={() => setViewMode('chat')} />,
      customers:  () => <CustomersList onCustomerClick={(id) => setSelectedCustomerId(id)} />,
      calendar:   () => <CalendarPage />,
      opportunities: () => <OpportunitiesPage />,
      policies:     () => <PoliciesPage />,
      import:       () => <ImportPage />,
      monitor:      () => <MonitorPage />,
    };

    return pages[tab]();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base)]">
      <Sidebar
        tab={tab}
        onTabChange={(t) => { setTab(t); setSelectedCustomerId(null); }}
        onAiToggle={() => setViewMode(v => v === 'chat' ? 'briefing' : 'chat')}
        stats={stats}
        criticalCount={criticalAlerts.length}
        viewMode={viewMode}
        globalInput={globalInput}
        onGlobalInputChange={setGlobalInput}
        onGlobalSend={handleGlobalSend}
      />
      <main className="flex-1 overflow-y-auto">
        {renderMain()}
      </main>
    </div>
  );
}

/* ── 懒加载页面（避免全量 import） ────────────── */
import CustomerDetail from './pages/CustomerDetail';
import CalendarPage from './pages/Calendar';
import OpportunitiesPage from './pages/Opportunities';
import PoliciesPage from './pages/Policies';
import ImportPage from './pages/Import';
import MonitorPage from './pages/Monitor';
import CustomersList from './pages/Customers';

/* ── 根组件 ──────────────────────────────────── */

export default function App() {
  return (
    <BrandProvider>
      <CRMProvider>
        <AppContent />
      </CRMProvider>
    </BrandProvider>
  );
}
