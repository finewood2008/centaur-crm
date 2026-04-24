import { useState, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useCRMData } from '../context/CRMDataContext';
import { processAICommand } from '../engine';

export default function AIStatusBar() {
  const { state, dispatch } = useCRMData();
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const reply = processAICommand(input, state, dispatch);
    setResult(reply);
    setInput('');
    setTimeout(() => setResult(null), 4000);
  };

  if (showInput) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 border-t animate-slide-in"
        style={{ background: 'var(--color-panel)', borderColor: 'var(--color-b0)' }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setShowInput(false); setResult(null); }
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="输入指令，AI 帮你处理..."
          autoFocus
          className="flex-1 bg-transparent text-[12px] outline-none text-[var(--color-t1)] placeholder:text-[var(--color-t4)]"
        />
        <button
          onClick={handleSend}
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{
            background: input.trim() ? 'var(--color-accent)' : 'var(--color-surface-3)',
            color: input.trim() ? 'white' : 'var(--color-t4)',
          }}
        >
          <Send size={12} />
        </button>
        <button
          onClick={() => { setShowInput(false); setResult(null); }}
          className="text-[10px] text-[var(--color-t4)] hover:text-[var(--color-t2)]"
        >
          Esc
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-1.5 border-t cursor-pointer transition-colors hover:bg-[var(--color-surface-1)]"
      style={{ background: 'var(--color-panel)', borderColor: 'var(--color-b0)' }}
      onClick={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={12} className="text-[var(--color-accent)]" />
        <span className="text-[11px] text-[var(--color-t4)]">
          {result || '向 AI 下达指令...'}
        </span>
      </div>
      <kbd className="text-[9px] px-1.5 py-0.5 rounded text-[var(--color-t4)] bg-[var(--color-surface-2)]">⌘K</kbd>
    </div>
  );
}
