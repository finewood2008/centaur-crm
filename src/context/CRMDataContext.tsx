import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { crmReducer, type CRMState, type CRMAction } from '../store';
import { CUSTOMERS, TASKS, OPPORTUNITIES, POLICIES, CUSTOMER_EVENTS, MONITOR_RULES, MONITOR_ALERTS } from '../mock';

/* ── 初始状态（从 mock 导入） ──────────────────── */

const initialState: CRMState = {
  customers: [...CUSTOMERS],
  tasks: [...TASKS],
  opportunities: [...OPPORTUNITIES],
  policies: [...POLICIES],
  events: [...CUSTOMER_EVENTS],
  monitorRules: [...MONITOR_RULES],
  monitorAlerts: [...MONITOR_ALERTS],
};

/* ── Context ──────────────────────────────────── */

interface CRMContextValue {
  state: CRMState;
  dispatch: React.Dispatch<CRMAction>;
}

const CRMDataContext = createContext<CRMContextValue | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(crmReducer, initialState);
  return (
    <CRMDataContext.Provider value={{ state, dispatch }}>
      {children}
    </CRMDataContext.Provider>
  );
}

export function useCRMData() {
  const ctx = useContext(CRMDataContext);
  if (!ctx) throw new Error('useCRMData must be used within CRMProvider');
  return ctx;
}
