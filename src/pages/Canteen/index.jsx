import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShoppingBag, HiOutlineX, HiOutlineMinus, HiOutlinePlus, HiOutlinePrinter } from 'react-icons/hi';

const menuCategories = [
  {
    name: 'Beverages',
    items: [
      { name: 'Tea', price: 20, icon: '🍵' },
      { name: 'Coffee', price: 50, icon: '☕' },
      { name: 'Cold Drink', price: 40, icon: '🥤' },
      { name: 'Juice', price: 60, icon: '🧃' },
      { name: 'Water', price: 20, icon: '💧' },
    ]
  },
  {
    name: 'Snacks',
    items: [
      { name: 'Chips', price: 30, icon: '🍟' },
      { name: 'Samosa', price: 20, icon: '🥟' },
      { name: 'Biscuit', price: 10, icon: '🍪' },
      { name: 'Pasta', price: 80, icon: '🍝' },
    ]
  },
  {
    name: 'Meals',
    items: [
      { name: 'Sandwich', price: 80, icon: '🥪' },
      { name: 'Burger', price: 120, icon: '🍔' },
      { name: 'Biryani', price: 150, icon: '🍚' },
      { name: 'Roll', price: 100, icon: '🌯' },
      { name: 'Ice Cream', price: 50, icon: '🍦' },
    ]
  },
];

export default function CanteenPOS({ onRefresh }) {
  const [cart, setCart] = useState({});
  const [tableNo, setTableNo] = useState('');
  const [search, setSearch] = useState('');

  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.name]: { ...item, qty: (prev[item.name]?.qty || 0) + 1 }
    }));
  };

  const updateQty = (name, delta) => {
    setCart(prev => {
      const current = prev[name];
      if (!current) return prev;
      const newQty = current.qty + delta;
      if (newQty <= 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: { ...current, qty: newQty } };
    });
  };

  const cartTotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = Object.values(cart).reduce((s, i) => s + i.qty, 0);

  const filteredCategories = menuCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.items.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Canteen POS</h1>
        <p className="text-xs text-gray-500 mt-1">Quick order management for your club canteen</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input type="text" placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
              </div>
              <input type="number" placeholder="Table #" value={tableNo} onChange={e => setTableNo(e.target.value)} className="input-field w-24" />
            </div>
          </div>

          {filteredCategories.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-sm font-semibold text-white mb-2">{cat.name}</h3>
              <div className="grid grid-cols-4 gap-2">
                {cat.items.map((item) => (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(item)}
                    className="glass-card p-3 text-left hover:border-neon/20 hover:shadow-neon-sm transition-all"
                  >
                    <span className="text-lg block mb-1">{item.icon}</span>
                    <p className="text-xs font-medium text-gray-200">{item.name}</p>
                    <p className="text-xs text-neon font-semibold mt-0.5">PKR{item.price}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 flex flex-col h-[calc(100vh-180px)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HiOutlineShoppingBag className="text-neon" />
              Cart ({cartCount})
            </h3>
            {cartCount > 0 && (
              <button onClick={() => setCart({})} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>
            )}
          </div>

          {tableNo && <p className="text-[10px] text-gray-500 mb-2">Table #{tableNo}</p>}

          <div className="flex-1 overflow-y-auto space-y-1.5">
            <AnimatePresence>
              {Object.entries(cart).map(([name, item]) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-2 rounded-xl bg-dark-300/50"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-200">{item.icon} {name}</p>
                    <p className="text-[10px] text-gray-500">PKR{item.price} × {item.qty} = PKR{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(name, -1)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-dark-400 text-gray-400 hover:text-white transition-colors text-xs">−</button>
                    <span className="w-6 text-center text-xs font-medium text-white">{item.qty}</span>
                    <button onClick={() => updateQty(name, 1)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-dark-400 text-gray-400 hover:text-white transition-colors text-xs">+</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {cartCount === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <HiOutlineShoppingBag className="text-3xl mb-2" />
                <p className="text-xs">Cart is empty</p>
              </div>
            )}
          </div>

          {cartCount > 0 && (
            <div className="mt-3 pt-3 border-t border-dark-300 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold">PKR{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost flex-1 text-xs flex items-center justify-center gap-1"><HiOutlinePrinter /> Kitchen</button>
                <button className="btn-neon flex-1 text-xs">Place Order</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}



