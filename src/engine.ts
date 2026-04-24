import type { CRMState, CRMAction } from './store';
import type { Customer, Task, CustomerEvent } from './types';

/* ── AI 操作结果 ──────────────────────────────── */

export interface ActionResult {
  success: boolean;
  message: string;
  action?: CRMAction;
  requiresConfirm?: boolean;
  confirmText?: string;
}

/* ── 意图解析 ─────────────────────────────────── */

interface ParsedIntent {
  type: string;
  customerName?: string;
  customer?: Customer;
  confidence: number;
  params: Record<string, any>;
}

function findCustomer(state: CRMState, name: string): Customer | undefined {
  // 模糊匹配：按名称、联系人查找
  const q = name.toLowerCase();
  return state.customers.find(
    c => c.name.toLowerCase().includes(q) ||
         c.contact.toLowerCase().includes(q) ||
         c.name.replace(/[有限公司科技]/g, '').includes(q),
  );
}

function parseIntent(input: string, state: CRMState): ParsedIntent | null {
  const lower = input.toLowerCase();

  // 1. 创建任务：给 X 创建/建个 Y 待办/任务，截止/在 Z 前
  const taskMatch = lower.match(/(?:给|为)(.+?)(?:创建|建个|安排|加个)(.+?)(?:待办|任务|提醒)(?:，|截止|在)?(.+?)?(?:前|之前|前完成|完成)?$/);
  if (taskMatch) {
    const customer = findCustomer(state, taskMatch[1].trim());
    return {
      type: 'CREATE_TASK',
      customerName: taskMatch[1].trim(),
      customer,
      confidence: customer ? 0.85 : 0.5,
      params: { title: taskMatch[2].trim(), deadline: taskMatch[3]?.trim() || '' },
    };
  }

  // 2. 更新客户状态：把 X 改成/标记为 正常/关注/风险
  const statusMatch = lower.match(/(?:把|将)(.+?)(?:改成|标记为|设为|更新为)(正常|关注|风险)/);
  if (statusMatch) {
    const customer = findCustomer(state, statusMatch[1].trim());
    return {
      type: 'UPDATE_STATUS',
      customerName: statusMatch[1].trim(),
      customer,
      confidence: customer ? 0.9 : 0.5,
      params: { status: statusMatch[2] === '正常' ? 'active' : statusMatch[2] === '关注' ? 'attention' : 'risk' },
    };
  }

  // 3. 推进商机：把 X 的商机推进/改成 跟进中/已成交
  const oppMatch = lower.match(/(?:把|将)(.+?)(?:的商机|商机)(?:推进|改成|标记为)(跟进中|已成交)/);
  if (oppMatch) {
    const customer = findCustomer(state, oppMatch[1].trim());
    return {
      type: 'ADVANCE_OPPORTUNITY',
      customerName: oppMatch[1].trim(),
      customer,
      confidence: customer ? 0.8 : 0.4,
      params: { status: oppMatch[2] === '跟进中' ? 'following' : 'won' },
    };
  }

  // 4. 记录事件：记录/添加 X 的动态/事件/联系记录
  const eventMatch = lower.match(/(?:记录|添加)(.+?)(?:的动态|的联系记录|的备注|备注|事件)/);
  if (eventMatch) {
    const customer = findCustomer(state, eventMatch[1].trim());
    return {
      type: 'ADD_EVENT',
      customerName: eventMatch[1].trim(),
      customer,
      confidence: customer ? 0.75 : 0.4,
      params: {},
    };
  }

  // 5. 标记预警已处理
  if (lower.includes('标记已处理') || lower.includes('确认预警') || lower.includes('处理预警')) {
    return { type: 'MARK_ALERT', confidence: 0.6, params: {} };
  }

  return null;
}

/* ── Action 执行 ──────────────────────────────── */

let taskCounter = 100;
let eventCounter = 100;

export function executeAction(
  intent: ParsedIntent,
  state: CRMState,
  dispatch: (action: CRMAction) => void,
): ActionResult {
  const c = intent.customer;

  switch (intent.type) {
    case 'CREATE_TASK': {
      if (!c) return { success: false, message: `未找到客户"${intent.customerName}"，请确认名称是否正确` };
      taskCounter++;
      const typeMap: Record<string, Task['type']> = { '税务': 'tax_filing', '申报': 'tax_filing', '年报': 'annual_report', '年检': 'license_renewal', '社保': 'social_security', '发票': 'invoice' };
      const detectedType = Object.entries(typeMap).find(([k]) => intent.params.title?.includes(k))?.[1] || 'other';
      const deadline = intent.params.deadline || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const task: Task = {
        id: `t${taskCounter}`,
        customerId: c.id,
        customerName: c.name,
        type: detectedType,
        title: intent.params.title || '待办事项',
        deadline,
        status: 'pending',
        priority: 'medium',
        assignedTo: '李会计',
      };
      dispatch({ type: 'CREATE_TASK', task });
      return { success: true, message: `已为客户"${c.name}"创建${task.title}待办，截止 ${deadline}`, action: { type: 'CREATE_TASK', task } };
    }

    case 'UPDATE_STATUS': {
      if (!c) return { success: false, message: `未找到客户"${intent.customerName}"` };
      const statusLabel = ({ active: '正常', attention: '关注', risk: '风险' } as Record<string, string>)[intent.params.status] || intent.params.status;
      dispatch({ type: 'UPDATE_CUSTOMER_STATUS', customerId: c.id, status: intent.params.status });
      // 同时记录事件
      const ev: CustomerEvent = {
        id: `ev${eventCounter++}`, customerId: c.id, customerName: c.name,
        type: 'service', title: '状态变更', description: `AI自动更新客户状态为${statusLabel}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), source: 'AI',
      };
      dispatch({ type: 'ADD_EVENT', event: ev });
      return { success: true, message: `已将"${c.name}"状态更新为"${statusLabel}"` };
    }

    case 'ADVANCE_OPPORTUNITY': {
      if (!c) return { success: false, message: `未找到客户"${intent.customerName}"` };
      const opps = state.opportunities.filter(o => o.customerId === c.id && o.status !== 'won' && o.status !== 'lost');
      if (opps.length === 0) return { success: false, message: `"${c.name}"没有进行中的商机可供推进` };
      const opp = opps[0];
      const statusLabel = { following: '跟进中', won: '已成交' }[intent.params.status as string] || intent.params.status;
      dispatch({ type: 'UPDATE_OPPORTUNITY_STATUS', oppId: opp.id, status: intent.params.status });
      return { success: true, message: `已将"${c.name}"的商机"${opp.service}"推进为"${statusLabel}"` };
    }

    case 'ADD_EVENT': {
      if (!c) return { success: false, message: `未找到客户"${intent.customerName}"` };
      const ev: CustomerEvent = {
        id: `ev${eventCounter++}`, customerId: c.id, customerName: c.name,
        type: 'contact', title: 'AI记录', description: 'AI助手自动记录',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), source: 'AI',
      };
      dispatch({ type: 'ADD_EVENT', event: ev });
      return { success: true, message: `已为"${c.name}"记录客户动态` };
    }

    case 'MARK_ALERT': {
      const unhandled = state.monitorAlerts.filter(a => !a.isHandled);
      if (unhandled.length === 0) return { success: false, message: '没有未处理的预警' };
      const alert = unhandled[0];
      dispatch({ type: 'MARK_ALERT_HANDLED', alertId: alert.id });
      return { success: true, message: `已标记预警"${alert.title}"为已处理` };
    }

    default:
      return { success: false, message: '无法识别您的操作意图' };
  }
}

/* ── 主入口 ────────────────────────────────────── */

export function processAICommand(
  input: string,
  state: CRMState,
  dispatch: (action: CRMAction) => void,
): string {
  const intent = parseIntent(input, state);

  if (!intent || intent.confidence < 0.3) {
    return genFallbackResponse(input, state);
  }

  if (!intent.customer && intent.customerName && intent.confidence < 0.7) {
    return `我找到了您提到"${intent.customerName}"，但没匹配到具体客户。请用全称试试，或者告诉我更多信息。`;
  }

  const result = executeAction(intent, state, dispatch);
  return result.message;
}

/* ── 默认回复（非操作类问题） ────────────────── */

function genFallbackResponse(input: string, state: CRMState): string {
  const lower = input.toLowerCase();

  // 统计类
  if (lower.includes('多少客户') || lower.includes('几个客户')) {
    return `当前共有 ${state.customers.length} 个客户，其中正常 ${state.customers.filter(c => c.status === 'active').length} 个、关注 ${state.customers.filter(c => c.status === 'attention').length} 个、风险 ${state.customers.filter(c => c.status === 'risk').length} 个。`;
  }
  if (lower.includes('待办') || lower.includes('任务')) {
    const pending = state.tasks.filter(t => t.status !== 'completed');
    return `有 ${pending.length} 个待办任务，其中 ${pending.filter(t => t.status === 'overdue').length} 个已逾期。`;
  }

  // 客户分析
  const cust = state.customers.find(c => c.name.toLowerCase().includes(lower.replace(/[，。？]/g, '').trim()));
  if (cust) {
    return `**${cust.name}**\n- 行业：${cust.industry}\n- 联系人：${cust.contact} ${cust.phone}\n- 健康分：${cust.healthScore}\n- 状态：${cust.status === 'active' ? '正常' : cust.status === 'attention' ? '关注' : '风险'}\n- 服务：${cust.services.join('、')}\n- 最近联系：${cust.lastContact}\n\n需要我做些什么？`;
  }

  return `收到！我可以帮您做这些事：
• 创建任务 — "给锐思科技创建一个税务申报待办"
• 更新状态 — "把海川贸易改成关注"
• 推进商机 — "把锐思科技的商机推进为跟进中"
• 记录动态 — "记录海川贸易的联系记录"
• 查看数据 — "有多少客户"、"待办有哪些"

你直接说需求就行。`;
}
