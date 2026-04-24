import { useEffect, type JSX } from 'react';
import type { NavItem } from './types';
import { useCRM } from './hooks/useCRM';
import { BrandProvider } from './context/BrandContext';
import Sidebar from './components/Sidebar';
import AIFloat from './components/AIFloat';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Calendar from './pages/Calendar';
import Opportunities from './pages/Opportunities';
import Policies from './pages/Policies';
import CustomerDetail from './pages/CustomerDetail';
import Import from './pages/Import';
import Monitor from './pages/Monitor';
import Cockpit from './pages/Cockpit';

function AppContent() {
  const crm = useCRM();
  const { tab, setTab, selectedCustomerId, setSelectedCustomerId, aiOpen, setAiOpen, stats, criticalAlerts } = crm;

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAiOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setAiOpen]);

  const renderPage = () => {
    if (tab === 'customers' && selectedCustomerId) {
      return (
        <CustomerDetail
          customerId={selectedCustomerId}
          onBack={() => setSelectedCustomerId(null)}
        />
      );
    }

    const pages: Record<NavItem, () => JSX.Element> = {
      dashboard:    () => <Dashboard onNavigate={setTab} />,
      customers:    () => <Customers onCustomerClick={(id) => setSelectedCustomerId(id)} />,
      calendar:     () => <Calendar />,
      opportunities: () => <Opportunities />,
      policies:     () => <Policies />,
      import:       () => <Import />,
      monitor:      () => <Monitor />,
      cockpit:      () => <Cockpit />,
    };

    return pages[tab]();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base)]">
      <Sidebar
        tab={tab}
        onTabChange={setTab}
        onAiToggle={() => setAiOpen(v => !v)}
        stats={stats}
        criticalCount={criticalAlerts.length}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full anim-fade-in">
          {renderPage()}
        </div>
      </main>
      <AIFloat open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <AppContent />
    </BrandProvider>
  );
}
