import { useState, useEffect } from 'react';
import type { NavItem } from './types';
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

export default function App() {
  const [tab, setTab] = useState<NavItem>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

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
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-base)' }}>
      <Sidebar current={tab} onChange={(t) => { setTab(t); setSelectedCustomerId(null); }} />
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'customers' && !selectedCustomerId && (
          <Customers onCustomerClick={(id) => setSelectedCustomerId(id)} />
        )}
        {tab === 'customers' && selectedCustomerId && (
          <CustomerDetail customerId={selectedCustomerId} onBack={() => setSelectedCustomerId(null)} />
        )}
        {tab === 'calendar' && <Calendar />}
        {tab === 'opportunities' && <Opportunities />}
        {tab === 'policies' && <Policies />}
        {tab === 'import' && <Import />}
        {tab === 'monitor' && <Monitor />}
        {tab === 'cockpit' && <Cockpit />}
      </main>
      <AIFloat open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
