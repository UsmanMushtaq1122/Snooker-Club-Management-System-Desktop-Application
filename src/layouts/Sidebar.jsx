import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import {
  HiOutlineViewGrid, HiOutlineTable, HiOutlinePlay,
  HiOutlineStar, HiOutlineUsers, HiOutlineUserGroup,
  HiOutlineClipboardList, HiOutlineShoppingBag, HiOutlineCube,
  HiOutlineCurrencyDollar, HiOutlineIdentification,
  HiOutlineChartPie, HiOutlineBell, HiOutlineCog,
  HiOutlineLogout, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { id: 'live-tables', label: 'Live Tables', icon: HiOutlineTable },
  { id: 'sessions', label: 'Sessions', icon: HiOutlinePlay },
  { id: 'matches', label: 'Matches', icon: HiOutlineStar },
  { id: 'players', label: 'Players', icon: HiOutlineUsers },
  { id: 'team-matches', label: 'Team Matches', icon: HiOutlineUserGroup },
  { id: 'table-mgmt', label: 'Table Management', icon: HiOutlineClipboardList },
  { id: 'canteen-pos', label: 'Canteen POS', icon: HiOutlineShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: HiOutlineCube },
  { id: 'expenses', label: 'Expenses', icon: HiOutlineCurrencyDollar },
  { id: 'customers', label: 'Customers', icon: HiOutlineIdentification },
  { id: 'reports', label: 'Reports', icon: HiOutlineChartPie },
  { id: 'invoices', label: 'Invoices', icon: HiOutlineDocumentText },
  { id: 'staff', label: 'Staff Management', icon: HiOutlineUsers },
  { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
];

export default function Sidebar({ activeView, onNavigate, collapsed, onToggle }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <motion.aside
      initial={{ width: collapsed ? 72 : 260 }}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-dark-100/80 backdrop-blur-xl border-r border-dark-300/40 flex flex-col overflow-hidden flex-shrink-0 relative"
    >
      <div className="relative flex items-center gap-3 px-4 h-16 border-b border-dark-300/40 flex-shrink-0">
        <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />
        <motion.div
          animate={{ rotate: collapsed ? 0 : 0 }}
          className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-neon after:absolute after:inset-0 after:rounded-xl after:shadow-[0_0_20px_rgba(34,197,94,0.3)] after:opacity-0 hover:after:opacity-100 after:transition-opacity"
        >
          <span className="text-xl relative z-10">🎱</span>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold text-white whitespace-nowrap">Snooker Club</h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Management System</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                'relative flex items-center gap-3 w-full rounded-xl transition-colors duration-150',
                collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5',
                isActive
                  ? 'text-neon bg-neon/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-300/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon/15 via-neon/8 to-transparent border border-neon/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                <div className={cn('relative', isActive && 'after:absolute after:-inset-1 after:rounded-lg after:shadow-[0_0_12px_rgba(34,197,94,0.3)]')}>
                  <Icon className={cn('text-lg', isActive ? 'text-neon' : '')} />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn('text-xs font-medium whitespace-nowrap', isActive ? 'text-neon' : '')}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {isHovered && collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-2 px-2.5 py-1.5 bg-dark-300 rounded-lg text-xs font-medium text-white whitespace-nowrap z-50 shadow-lg border border-dark-400"
                >
                  {item.label}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="flex-shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 pt-2"
            >
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-dark-300/30 border border-dark-400/30">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon to-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-neon-sm">
                  SC
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">Cashier</p>
                  <p className="text-[10px] text-gray-500 truncate">Administrator</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-neon animate-pulse-dot flex-shrink-0" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 border-t border-dark-300/40 space-y-2 relative mt-2">
          <div className="absolute inset-x-3 -top-px h-px bg-gradient-to-r from-transparent via-dark-400 to-transparent" />
          <motion.button
            onClick={onToggle}
            className="flex items-center justify-center w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-dark-300/50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            {collapsed ? <HiOutlineChevronRight className="text-lg" /> : <HiOutlineChevronLeft className="text-lg" />}
          </motion.button>

          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <HiOutlineLogout className="text-lg" />
              <span className="text-xs font-medium">Logout</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
