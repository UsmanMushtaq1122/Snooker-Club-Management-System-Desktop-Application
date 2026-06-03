import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pages = {
  dashboard: React.lazy(() => import('../pages/Dashboard')),
  'live-tables': React.lazy(() => import('../pages/LiveTables')),
  sessions: React.lazy(() => import('../pages/Sessions')),
  matches: React.lazy(() => import('../pages/Matches')),
  players: React.lazy(() => import('../pages/Players')),
  'team-matches': React.lazy(() => import('../pages/TeamMatches')),
  'table-mgmt': React.lazy(() => import('../pages/TableManagement')),
  'canteen-pos': React.lazy(() => import('../pages/Canteen')),
  inventory: React.lazy(() => import('../pages/Inventory')),
  expenses: React.lazy(() => import('../pages/Expenses')),
  customers: React.lazy(() => import('../pages/Customers')),
  reports: React.lazy(() => import('../pages/Reports')),
  staff: React.lazy(() => import('../pages/Staff')),
  invoices: React.lazy(() => import('../pages/Invoices')),
  notifications: React.lazy(() => import('../pages/Notifications')),
  settings: React.lazy(() => import('../pages/Settings')),
};

export default function MainLayout({ theme, onToggleTheme }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSessions = useCallback(() => {
    window.api.getRunningSessions?.().then(setSessions).catch(() => {});
  }, []);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [loadSessions, refreshKey]);

  const PageComponent = pages[activeView] || pages.dashboard;
  const activeTables = sessions.length;

  return (
    <div className="flex h-screen bg-dark relative">
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-pattern" />
        <div className="noise-overlay" />
      </div>
      <div className="relative z-10 flex h-full w-full">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            theme={theme}
            onToggleTheme={onToggleTheme}
            activeTables={activeTables}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1600px] mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView + refreshKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <React.Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
                          <div className="absolute inset-1 border-2 border-transparent border-t-cyan-500/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                        </div>
                        <p className="text-xs text-gray-500 animate-pulse">Loading...</p>
                      </div>
                    }
                  >
                    <PageComponent
                      key={refreshKey}
                      sessions={sessions}
                      onRefresh={() => setRefreshKey(k => k + 1)}
                    />
                  </React.Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}


