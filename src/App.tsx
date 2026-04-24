import { useEffect, type JSX } from 'react';
import type { NavItem } from './types';
import { useCRM } from './hooks/useCRM';
import { BrandProvider } from './context/BrandContext';
import { CRMProvider } from './context/CRMDataContext';
import Sidebar from './components/Sidebar';
import AIStatusBar from './components/AIStatusBar';
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
  const { tab, setTab, selectedCustomerId, setSelectedCustomerId, stats, criticalAlerts } = crm;

  // ⌘K shortcut - 打开 AI 状态栏
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // 触发底部 AI 状态栏的 focus (通过 DOM 事件)
        const bar = document.querySelector('[data-ai-status-bar]');
        if (bar) {
          (bar as HTMLElement).click();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isChatPage = tab === 'dashboard';

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
        stats={stats}
        criticalCount={criticalAlerts.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full anim-fade-in">
            {renderPage()}
          </div>
        </main>
        {/* AI 状态栏：仅非对话页面显示 */}
        {!isChatPage && (
          <div data-ai-status-bar>
            <AIStatusBar />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrandProvider>
      <CRMProvider>
        <AppContent />
      </CRMProvider>
    </BrandProvider>
  );
}
