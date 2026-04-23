import { useState } from 'react';
import type { NavItem } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Calendar from './pages/Calendar';
import Opportunities from './pages/Opportunities';
import Policies from './pages/Policies';
import CustomerDetail from './pages/CustomerDetail';
import Import from './pages/Import';
import Assistant from './pages/Assistant';
import Monitor from './pages/Monitor';
import Cockpit from './pages/Cockpit';

export default function App() {
  const [tab, setTab] = useState<NavItem>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleCustomerClick = (id: string) => {
    setSelectedCustomerId(id);
  };

  const handleBack = () => {
    setSelectedCustomerId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar current={tab} onChange={(t) => { setTab(t); setSelectedCustomerId(null); }} />
      <main className="flex-1 overflow-y-auto">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'customers' && !selectedCustomerId && (
          <Customers onCustomerClick={handleCustomerClick} />
        )}
        {tab === 'customers' && selectedCustomerId && (
          <CustomerDetail customerId={selectedCustomerId} onBack={handleBack} />
        )}
        {tab === 'calendar' && <Calendar />}
        {tab === 'opportunities' && <Opportunities />}
        {tab === 'policies' && <Policies />}
        {tab === 'import' && <Import />}
        {tab === 'assistant' && <Assistant />}
        {tab === 'monitor' && <Monitor />}
        {tab === 'cockpit' && <Cockpit />}
      </main>
    </div>
  );
}
