import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_PRICES = { 1: 200, 2: 150, 3: 150 };

export default function SettingsModal({ onClose, onSave }) {
  const [prices, setPrices] = useState({});
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    Promise.all([window.api.getTables(), window.api.getSettings()]).then(([tables, settings]) => {
      const p = {};
      tables.forEach(t => { p[t.table_number] = t.price_per_hour || DEFAULT_PRICES[t.table_number] || 120; });
      setPrices(p);
      setTheme(settings.theme || 'dark');
    });
  }, []);

  const handleSave = () => {
    const promises = Object.entries(prices).map(([t, p]) => window.api.updateTablePrice(parseInt(t), p));
    promises.push(window.api.saveSetting('theme', theme));
    Promise.all(promises).then(() => {
      document.body.setAttribute('data-theme', theme);
      if (onSave) onSave();
      onClose();
    });
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 max-w-lg w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-400 transition-all">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Table Rates (₹)</label>
            <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <div key={num} className="p-2 rounded-lg bg-dark-300/50 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">T{num}</p>
                  <input type="number" min="1" value={prices[num] || ''}
                    onChange={e => setPrices(p => ({ ...p, [num]: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-1 text-center text-xs bg-dark-400 border border-dark-500 rounded-lg text-white" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Theme</label>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="select-field">
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-neon flex-1">Save Settings</button>
        </div>
      </motion.div>
    </div>
  );
}
