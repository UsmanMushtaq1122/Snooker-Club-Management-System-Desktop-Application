import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { name: 'Tea', price: 20, icon: '🍵' },
  { name: 'Cold Drink', price: 30, icon: '🥤' },
  { name: 'Snacks', price: 50, icon: '🍟' },
  { name: 'Sandwich', price: 60, icon: '🥪' },
  { name: 'Samosa', price: 15, icon: '🥟' },
  { name: 'Biscuit', price: 10, icon: '🍪' },
  { name: 'Coffee', price: 30, icon: '☕' },
  { name: 'Juice', price: 40, icon: '🧃' },
  { name: 'Biryani', price: 120, icon: '🍚' },
  { name: 'Roll', price: 80, icon: '🌯' },
  { name: 'Pasta', price: 70, icon: '🍝' },
  { name: 'Ice Cream', price: 40, icon: '🍦' },
];

export default function CanteenModal({ session, onAdd, onClose }) {
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => { window.api.getCanteenOrders(session.id).then(setOrders); }, [session.id]);

  const handleAddOrder = (item) => {
    const qty = quantities[item.name] || 0;
    if (qty <= 0) return;
    window.api.addCanteenOrder(session.id, item.name, qty, item.price).then(() => {
      window.api.getCanteenOrders(session.id).then(setOrders);
      setQuantities(prev => ({ ...prev, [item.name]: 0 }));
      if (onAdd) onAdd();
    });
  };

  const totalOrders = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card-premium p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-glass"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gradient">Canteen — Table {session.table_number}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{session.player1} vs {session.player2}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300/50 text-gray-400 hover:text-white hover:bg-dark-400/70 border border-transparent hover:border-red-500/30 transition-all">✕</button>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {MENU_ITEMS.map(item => (
            <motion.div
              key={item.name}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="p-3 rounded-xl bg-dark-300/40 border border-dark-400/40 hover:border-neon/20 hover:bg-dark-300/60 transition-all"
            >
              <span className="text-lg block mb-1">{item.icon}</span>
              <p className="text-xs font-medium text-gray-200">{item.name}</p>
              <p className="text-[10px] text-neon font-semibold">₹{item.price}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <input
                  type="number" min="0" max="99"
                  value={quantities[item.name] || 0}
                  onChange={e => setQuantities(prev => ({ ...prev, [item.name]: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-10 p-1 text-center text-xs bg-dark-400 border border-dark-500 rounded-lg text-white"
                />
                <button
                  onClick={() => handleAddOrder(item)}
                  disabled={!quantities[item.name] || quantities[item.name] <= 0}
                  className="flex-1 py-1 text-[10px] font-semibold rounded-lg bg-neon text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neon-600 hover:shadow-neon-sm transition-all"
                >Add</button>
              </div>
            </motion.div>
          ))}
        </div>

        {orders.length > 0 && (
          <div className="border-t border-dark-300/50 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gradient">Current Orders</h3>
              <span className="text-xs text-neon font-semibold">₹{totalOrders.toFixed(2)}</span>
            </div>
            <div className="space-y-1">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-dark-300/40 border border-dark-400/30 text-xs"
                >
                  <span className="text-gray-200 font-medium">{order.item_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">×{order.quantity}</span>
                    <span className="text-gray-400">₹{order.price.toFixed(2)}</span>
                    <span className="text-white font-semibold w-16 text-right">₹{order.total.toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
