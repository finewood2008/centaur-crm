import type { Customer, Task, Opportunity, PolicyAlert, CustomerEvent, MonitorRule, MonitorAlert } from './types';

/* ── Actions ──────────────────────────────────── */

export type CRMAction =
  | { type: 'CREATE_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; taskId: string; updates: Partial<Task> }
  | { type: 'UPDATE_CUSTOMER_STATUS'; customerId: string; status: Customer['status'] }
  | { type: 'UPDATE_OPPORTUNITY_STATUS'; oppId: string; status: Opportunity['status'] }
  | { type: 'MARK_ALERT_HANDLED'; alertId: string }
  | { type: 'ADD_EVENT'; event: CustomerEvent }
  | { type: 'CREATE_OPPORTUNITY'; opp: Opportunity };

/* ── State ────────────────────────────────────── */

export interface CRMState {
  customers: Customer[];
  tasks: Task[];
  opportunities: Opportunity[];
  policies: PolicyAlert[];
  events: CustomerEvent[];
  monitorRules: MonitorRule[];
  monitorAlerts: MonitorAlert[];
}

/* ── Reducer ──────────────────────────────────── */

export function crmReducer(state: CRMState, action: CRMAction): CRMState {
  switch (action.type) {
    case 'CREATE_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, ...action.updates } : t,
        ),
      };

    case 'UPDATE_CUSTOMER_STATUS':
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === action.customerId ? { ...c, status: action.status } : c,
        ),
      };

    case 'UPDATE_OPPORTUNITY_STATUS':
      return {
        ...state,
        opportunities: state.opportunities.map(o =>
          o.id === action.oppId ? { ...o, status: action.status } : o,
        ),
      };

    case 'MARK_ALERT_HANDLED':
      return {
        ...state,
        monitorAlerts: state.monitorAlerts.map(a =>
          a.id === action.alertId ? { ...a, isHandled: true } : a,
        ),
      };

    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };

    case 'CREATE_OPPORTUNITY':
      return { ...state, opportunities: [...state.opportunities, action.opp] };

    default:
      return state;
  }
}
