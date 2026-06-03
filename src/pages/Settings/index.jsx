import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCog, HiOutlineColorSwatch, HiOutlineCurrencyDollar,
  HiOutlineShieldCheck, HiOutlineDatabase, HiOutlineUserGroup,
  HiOutlineReceiptRefund, HiOutlineBell, HiOutlinePlus, HiOutlinePencil,
  HiOutlineTrash, HiOutlineX, HiOutlineClock,
} from 'react-icons/hi';

function cn(...classes) { return classes.filter(Boolean).join(' '); }

export default function Settings({ onRefresh }) {
  const [tab, setTab] = useState('club');
  const [prices, setPrices] = useState({});
  const [theme, setTheme] = useState('dark');
  const [clubName, setClubName] = useState('Snooker Club');
  const [currency, setCurrency] = useState('PKR');
  const [plans, setPlans] = useState([]);
  const [planModal, setPlanModal] = useState(null);

  const [receipt, setReceipt] = useState({
    header: 'Red Shoot Snooker Club',
    footer: 'Thank you for visiting!',
    show_logo: 'yes',
    show_payment_info: 'yes',
    tax_rate: '0',
  });

  useEffect(() => {
    Promise.all([
      window.api.getTables(),
      window.api.getSettings(),
    ]).then(([tables, settings]) => {
      const p = {};
      tables.forEach(t => { p[t.table_number] = t.price_per_hour || 120; });
      setPrices(p);
      setTheme(settings.theme || 'dark');
      setReceipt({
        header: settings.receipt_header || 'Red Shoot Snooker Club',
        footer: settings.receipt_footer || 'Thank you for visiting!',
        show_logo: settings.receipt_show_logo || 'yes',
        show_payment_info: settings.receipt_show_payment || 'yes',
        tax_rate: settings.receipt_tax_rate || '0',
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'membership') loadPlans();
  }, [tab]);

  function loadPlans() {
    window.api.getMembershipPlans().then(setPlans).catch(() => {});
  }

  function handleSave() {
    const promises = Object.entries(prices).map(([t, p]) =>
      window.api.updateTablePrice(parseInt(t), p)
    );
    promises.push(window.api.saveSetting('theme', theme));
    Promise.all(promises).then(() => {
      document.body.setAttribute('data-theme', theme);
      if (onRefresh) onRefresh();
    });
  }

  function handleSaveReceipt() {
    Promise.all([
      window.api.saveSetting('receipt_header', receipt.header),
      window.api.saveSetting('receipt_footer', receipt.footer),
      window.api.saveSetting('receipt_show_logo', receipt.show_logo),
      window.api.saveSetting('receipt_show_payment', receipt.show_payment_info),
      window.api.saveSetting('receipt_tax_rate', receipt.tax_rate),
    ]).then(() => { if (onRefresh) onRefresh(); });
  }

  function handleSavePlan(e) {
    e.preventDefault();
    const f = planModal;
    const method = f.id ? window.api.updateMembershipPlan : window.api.addMembershipPlan;
    method(f.id, f.name, parseInt(f.duration_days) || 30, parseFloat(f.price) || 0, f.benefits, f.status || 'active')
      .then(() => { setPlanModal(null); loadPlans(); });
  }

  function handleDeletePlan(id) {
    if (!window.confirm('Delete this plan?')) return;
    window.api.deleteMembershipPlan(id).then(() => loadPlans());
  }

  const tabs = [
    { id: 'club', label: 'Club Information', icon: HiOutlineCog },
    { id: 'rates', label: 'Table Rates', icon: HiOutlineCurrencyDollar },
    { id: 'membership', label: 'Membership Plans', icon: HiOutlineUserGroup },
    { id: 'receipt', label: 'Receipt Settings', icon: HiOutlineReceiptRefund },
    { id: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    { id: 'permissions', label: 'User Permissions', icon: HiOutlineShieldCheck },
    { id: 'backup', label: 'Backup Settings', icon: HiOutlineDatabase },
    { id: 'theme', label: 'Theme Settings', icon: HiOutlineColorSwatch },
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
              <h3 className="text-sm font-semibold text-white">Table Rates (PKR/game)</h3>
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

          {tab === 'membership' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Membership Plans</h3>
                <button
                  onClick={() => setPlanModal({ name: '', duration_days: '30', price: '', benefits: '', status: 'active' })}
                  className="btn-neon flex items-center gap-1 text-[10px] px-3 py-1.5"
                >
                  <HiOutlinePlus className="text-xs" /> Add Plan
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {plans.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative p-4 rounded-xl bg-dark-300/50 border border-dark-400/40 hover:border-neon/20 transition-all group"
                  >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPlanModal({ ...p, duration_days: String(p.duration_days), price: String(p.price) })}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-dark-400/70 text-gray-400 hover:text-neon transition-all">
                        <HiOutlinePencil className="text-[10px]" />
                      </button>
                      <button onClick={() => handleDeletePlan(p.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-dark-400/70 text-gray-400 hover:text-red-400 transition-all">
                        <HiOutlineTrash className="text-[10px]" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white mb-1">{p.name}</p>
                    <p className="text-2xl font-bold text-gradient mb-2">₹{p.price}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                      <HiOutlineClock className="text-[10px]" />
                      {p.duration_days} days
                    </div>
                    {p.benefits && <p className="text-[10px] text-gray-400 leading-relaxed">{p.benefits}</p>}
                    <div className="mt-2">
                      <span className={`badge ${p.status === 'active' ? 'badge-available' : 'badge-maintenance'}`}>{p.status}</span>
                    </div>
                  </motion.div>
                ))}
                {plans.length === 0 && (
                  <div className="col-span-3 p-6 text-center text-gray-500 text-sm">No membership plans yet</div>
                )}
              </div>
            </div>
          )}

          {tab === 'receipt' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-sm font-semibold text-white">Receipt Settings</h3>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Receipt Header</label>
                <input type="text" value={receipt.header}
                  onChange={e => setReceipt({ ...receipt, header: e.target.value })}
                  className="input-field" placeholder="Club name" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Receipt Footer</label>
                <input type="text" value={receipt.footer}
                  onChange={e => setReceipt({ ...receipt, footer: e.target.value })}
                  className="input-field" placeholder="Thank you message" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Show Logo</label>
                  <select value={receipt.show_logo}
                    onChange={e => setReceipt({ ...receipt, show_logo: e.target.value })}
                    className="input-field">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Show Payment Info</label>
                  <select value={receipt.show_payment_info}
                    onChange={e => setReceipt({ ...receipt, show_payment_info: e.target.value })}
                    className="input-field">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tax Rate (%)</label>
                <input type="number" min="0" step="0.1" value={receipt.tax_rate}
                  onChange={e => setReceipt({ ...receipt, tax_rate: e.target.value })}
                  className="input-field w-24" />
              </div>
              <button onClick={handleSaveReceipt} className="btn-neon">Save Receipt Settings</button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
              <p className="text-xs text-gray-500">Choose which alerts to display.</p>
              <div className="space-y-2">
                {[
                  { label: 'Low Stock Alert', desc: 'When inventory items run low', color: 'bg-amber-500' },
                  { label: 'Session Completed', desc: 'When a game session ends', color: 'bg-neon' },
                  { label: 'Payment Pending', desc: 'When a bill is unpaid', color: 'bg-red-500' },
                  { label: 'Table Available', desc: 'When a table becomes free', color: 'bg-blue-500' },
                  { label: 'Maintenance Reminder', desc: 'When table maintenance is due', color: 'bg-purple-500' },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-300/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${n.color}`} />
                      <div>
                        <p className="text-xs font-medium text-white">{n.label}</p>
                        <p className="text-[10px] text-gray-500">{n.desc}</p>
                      </div>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-neon relative cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 right-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
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
        </div>
      </div>

      {planModal && (
        <div className="modal-overlay-custom" onClick={() => setPlanModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="glass-card-premium p-6 max-w-md w-full mx-4 shadow-glass"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gradient">{planModal.id ? 'Edit' : 'Add'} Plan</h2>
              <button onClick={() => setPlanModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300/50 text-gray-400 hover:text-white hover:bg-dark-400/70 transition-all">
                <HiOutlineX className="text-sm" />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Plan Name</label>
                <input type="text" required value={planModal.name}
                  onChange={e => setPlanModal({ ...planModal, name: e.target.value })}
                  className="input-field" placeholder="e.g. Monthly" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Duration (days)</label>
                  <input type="number" min="1" required value={planModal.duration_days}
                    onChange={e => setPlanModal({ ...planModal, duration_days: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Price (₹)</label>
                  <input type="number" min="0" required value={planModal.price}
                    onChange={e => setPlanModal({ ...planModal, price: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Benefits</label>
                <textarea value={planModal.benefits || ''} rows={3}
                  onChange={e => setPlanModal({ ...planModal, benefits: e.target.value })}
                  className="input-field resize-none" placeholder="Describe benefits..." />
              </div>
              {planModal.id && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                  <select value={planModal.status}
                    onChange={e => setPlanModal({ ...planModal, status: e.target.value })}
                    className="input-field">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setPlanModal(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-neon flex-1">{planModal.id ? 'Update' : 'Add'} Plan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
