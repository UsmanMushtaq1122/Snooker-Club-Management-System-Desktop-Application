import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCog, HiOutlineColorSwatch, HiOutlineCurrencyDollar, HiOutlineShieldCheck, HiOutlineDatabase, HiOutlineBell, HiOutlineUser } from 'react-icons/hi';

export default function Settings({ onRefresh }) {
  const [tab, setTab] = useState('club');
  const [prices, setPrices] = useState({});
  const [theme, setTheme] = useState('dark');
  const [clubName, setClubName] = useState('Snooker Club');
  const [currency, setCurrency] = useState('₹');

  useEffect(() => {
    Promise.all([
      window.api.getTables(),
      window.api.getSettings(),
    ]).then(([tables, settings]) => {
      const p = {};
      tables.forEach(t => { p[t.table_number] = t.price_per_hour || 120; });
      setPrices(p);
      setTheme(settings.theme || 'dark');
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    const promises = Object.entries(prices).map(([t, p]) =>
      window.api.updateTablePrice(parseInt(t), p)
    );
    promises.push(window.api.saveSetting('theme', theme));
    Promise.all(promises).then(() => {
      document.body.setAttribute('data-theme', theme);
      if (onRefresh) onRefresh();
    });
  };

  const tabs = [
    { id: 'club', label: 'Club Info', icon: HiOutlineCog },
    { id: 'rates', label: 'Table Rates', icon: HiOutlineCurrencyDollar },
    { id: 'theme', label: 'Theme', icon: HiOutlineColorSwatch },
    { id: 'permissions', label: 'Permissions', icon: HiOutlineShieldCheck },
    { id: 'backup', label: 'Backup', icon: HiOutlineDatabase },
    { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Configure your club management system</p>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  tab === t.id ? 'bg-neon/10 text-neon border border-neon/20' : 'text-gray-500 hover:text-gray-300 hover:bg-dark-300/50 border border-transparent'
                }`}
              >
                <Icon className="text-sm" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 glass-card p-6">
          {tab === 'club' && (
            <div className="space-y-4 max-w-md">
              <h3 className="text-sm font-semibold text-white">Club Information</h3>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Club Name</label>
                <input type="text" value={clubName} onChange={e => setClubName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Currency Symbol</label>
                <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} className="input-field w-20" />
              </div>
              <button onClick={handleSave} className="btn-neon">Save Changes</button>
            </div>
          )}

          {tab === 'rates' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Table Rates (₹/game)</h3>
              <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <div key={num} className="p-3 rounded-xl bg-dark-300/50">
                    <p className="text-xs text-gray-500 mb-1">Table {num}</p>
                    <input
                      type="number"
                      min="1"
                      value={prices[num] || ''}
                      onChange={e => setPrices(prev => ({ ...prev, [num]: parseFloat(e.target.value) || 0 }))}
                      className="input-field text-center"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="btn-neon">Save Rates</button>
            </div>
          )}

          {tab === 'theme' && (
            <div className="space-y-4 max-w-md">
              <h3 className="text-sm font-semibold text-white">Theme Settings</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => { setTheme('dark'); document.body.setAttribute('data-theme', 'dark'); }}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark' ? 'border-neon bg-dark-300' : 'border-dark-400 bg-dark-300/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-dark mb-2" />
                  <p className="text-xs font-medium text-white">Dark Mode</p>
                </button>
                <button
                  onClick={() => { setTheme('light'); document.body.setAttribute('data-theme', 'light'); }}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    theme === 'light' ? 'border-neon bg-gray-100' : 'border-dark-400 bg-dark-300/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 mb-2" />
                  <p className="text-xs font-medium text-white">Light Mode</p>
                </button>
              </div>
              <button onClick={handleSave} className="btn-neon">Save Theme</button>
            </div>
          )}

          {tab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">User Permissions</h3>
              <p className="text-xs text-gray-500">Manage access levels for staff members.</p>
              <div className="space-y-2">
                {[
                  { role: 'Admin', access: 'Full access to all features' },
                  { role: 'Manager', access: 'Can manage tables, sessions, and reports' },
                  { role: 'Cashier', access: 'Can start/end sessions, add canteen orders' },
                  { role: 'Staff', access: 'Limited view-only access' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-300/50">
                    <div>
                      <p className="text-xs font-medium text-white">{r.role}</p>
                      <p className="text-[10px] text-gray-500">{r.access}</p>
                    </div>
                    <button className="text-[10px] text-neon hover:text-neon-400">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'backup' && (
            <div className="space-y-4 max-w-md">
              <h3 className="text-sm font-semibold text-white">Backup & Restore</h3>
              <p className="text-xs text-gray-500">Create and restore database backups.</p>
              <button className="btn-neon">Create Backup</button>
              <button className="btn-ghost ml-2">Restore Backup</button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4 max-w-md">
              <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
              {[
                { label: 'Low Stock Alerts', desc: 'When inventory items run low' },
                { label: 'Session Completed', desc: 'When a game session ends' },
                { label: 'Payment Pending', desc: 'When a bill is unpaid' },
                { label: 'Table Available', desc: 'When a table becomes free' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-300/50">
                  <div>
                    <p className="text-xs font-medium text-white">{n.label}</p>
                    <p className="text-[10px] text-gray-500">{n.desc}</p>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-neon relative cursor-pointer">
                    <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
