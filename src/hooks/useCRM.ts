import { useMemo, useState } from 'react';
import {
  CUSTOMERS,
  TASKS,
  OPPORTUNITIES,
  POLICIES,
  CUSTOMER_EVENTS,
  MONITOR_RULES,
  MONITOR_ALERTS,
  DASHBOARD_STATS,
} from '../mock';
import type { NavItem } from '../types';

export function useCRM() {
  const [_tab, _setTab] = useState<NavItem>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const tab = _tab;
  const setTab = (t: NavItem) => {
    _setTab(t);
    setSelectedCustomerId(null);
  };

  // ── 通用数据 ──
  const customers = CUSTOMERS;
  const tasks = TASKS;
  const opportunities = OPPORTUNITIES;
  const policies = POLICIES;
  const events = CUSTOMER_EVENTS;
  const monitorRules = MONITOR_RULES;
  const monitorAlerts = MONITOR_ALERTS;
  const stats = DASHBOARD_STATS;

  // ── 衍生数据 ──
  const selectedCustomer = useMemo(
    () => customers.find(c => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId],
  );

  const urgentTasks = useMemo(
    () => tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.priority === 'high')),
    [tasks],
  );

  const newOpportunities = useMemo(
    () => opportunities.filter(o => o.status === 'new'),
    [opportunities],
  );

  const unreadPolicies = useMemo(
    () => policies.filter(p => !p.isRead),
    [policies],
  );

  const riskCustomers = useMemo(
    () => customers.filter(c => c.status === 'risk'),
    [customers],
  );

  const recentSignals = useMemo(
    () => events.filter(e => e.type === 'risk' || e.type === 'change').slice(0, 3),
    [events],
  );

  const activeAlerts = useMemo(
    () => monitorAlerts.filter(a => !a.isHandled),
    [monitorAlerts],
  );

  const criticalAlerts = useMemo(
    () => monitorAlerts.filter(a => !a.isHandled && a.severity === 'critical'),
    [monitorAlerts],
  );

  return {
    // 导航
    tab, setTab,
    selectedCustomerId, setSelectedCustomerId,
    selectedCustomer,
    aiOpen, setAiOpen,

    // 原始数据
    customers, tasks, opportunities, policies, events,
    monitorRules, monitorAlerts, stats,

    // 衍生数据
    urgentTasks, newOpportunities, unreadPolicies,
    riskCustomers, recentSignals,
    activeAlerts, criticalAlerts,
  };
}

export type CRMContext = ReturnType<typeof useCRM>;
