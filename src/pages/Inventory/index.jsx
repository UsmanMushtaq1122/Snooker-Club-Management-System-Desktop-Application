import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineCube, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function Inventory({ onRefresh }) {
  const [search, setSearch] = useState('');

  const items = [
    { name: 'Tea Bags', stock: 8, min: 10, unit: 'packs', price: 50 },
    { name: 'Coffee Powder', stock: 3, min: 5, unit: 'kg', price: 200 },
    { name: 'Cold Drinks', stock: 24, min: 10, unit: 'bottles', price: 30 },
    { name: 'Chips', stock: 15, min: 10, unit: 'packs', price: 20 },
    { name: 'Sugar', stock: 5, min: 5, unit: 'kg', price: 40 },
    { name: 'Milk', stock: 4, min: 6, unit: 'liters', price: 60 },
    { name: 'Bread', stock: 6, min: 5, unit: 'loaves', price: 30 },
    { name: 'Burgers', stock: 2, min: 10, unit: 'pcs', price: 120 },
  ];

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Inventory</h1>
        <p className="text-xs text-gray-500 mt-1">Manage canteen stock and supplies</p>
      </div>
      <div className="glass-card p-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.name} className={`glass-card p-4 ${item.stock <= item.min ? 'border-red-500/20' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.unit}</p>
              </div>
              {item.stock <= item.min && <HiOutlineExclamationCircle className="text-red-400 text-lg" />}
            </div>
            <p className={`text-xl font-bold ${item.stock <= item.min ? 'text-red-400' : 'text-neon'}`}>{item.stock}</p>
            <p className="text-xs text-gray-500 mt-1">Min: {item.min} — PKR{item.price}/{item.unit}</p>
            <div className="mt-2 h-1.5 rounded-full bg-dark-300 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${item.stock <= item.min ? 'bg-red-400' : 'bg-neon'}`}
                style={{ width: `${Math.min(100, (item.stock / item.min) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}



