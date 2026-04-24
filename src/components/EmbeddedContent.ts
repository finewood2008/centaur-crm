import type { Customer, Task, Opportunity } from '../types';

/* ── 可嵌入组件类型 ──────────────────────────── */

export type EmbeddedComponent =
  | { type: 'customer_profile'; customerId: string; customer: Customer }
  | { type: 'task_list'; tasks: Task[]; title?: string }
  | { type: 'action_result'; success: boolean; message: string; actionType?: string }
  | { type: 'opportunity_card'; opp: Opportunity };

/* ── 对话内容解析 ────────────────────────────── */

// 消息内容由文本和嵌入组件交错组成
// 格式: 文本内容 |||COMPONENT:{"type":"customer_profile",...}||| 更多文本

export interface ContentSegment {
  kind: 'text' | 'component';
  text?: string;
  component?: EmbeddedComponent;
}

export function parseMessageContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex = /\|\|\|COMPONENT:(\{.*?\})\|\|\|/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Text before this component
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) segments.push({ kind: 'text', text });
    }

    // Component
    try {
      const comp = JSON.parse(match[1]) as EmbeddedComponent;
      segments.push({ kind: 'component', component: comp });
    } catch {
      segments.push({ kind: 'text', text: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) segments.push({ kind: 'text', text });
  }

  return segments.length > 0 ? segments : [{ kind: 'text', text: content }];
}

/* ── 构建嵌入内容的辅助函数 ──────────────────── */

export function embedCustomer(customer: Customer): string {
  return `|||COMPONENT:${JSON.stringify({ type: 'customer_profile', customerId: customer.id, customer })}|||`;
}

export function embedTaskList(tasks: Task[], title?: string): string {
  return `|||COMPONENT:${JSON.stringify({ type: 'task_list', tasks, title })}|||`;
}

export function embedActionResult(success: boolean, message: string, actionType?: string): string {
  return `|||COMPONENT:${JSON.stringify({ type: 'action_result', success, message, actionType })}|||`;
}

export function embedOpportunity(opp: Opportunity): string {
  return `|||COMPONENT:${JSON.stringify({ type: 'opportunity_card', opp })}|||`;
}
