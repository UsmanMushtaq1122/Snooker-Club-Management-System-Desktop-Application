import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineXCircle } from 'react-icons/hi';

export default function TableManagement({ onRefresh }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    window.api.getTables().then(setTables).catch(() => {});
  }, []);

  const statusColors = {
    available: 'badge-available',
    running: 'badge-running',
    reserved: 'badge-reserved',
    maintenance: 'badge-maintenance',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Table Management</h1>
          <p className="text-xs text-gray-500 mt-1">Configure club tables and their rates</p>
        </div>
        <button className="btn-neon flex items-center gap-2"><HiOutlinePlus className="text-sm" /> Add Table</button>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-300">
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Table</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Status</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Rate/Game</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.table_number} className="border-b border-dark-300/50 hover:bg-dark-300/30">
                  <td className="p-3 font-medium text-white">Table {t.table_number}</td>
                  <td className="p-3"><span className={`badge ${statusColors[t.status] || 'badge-available'}`}>{t.status}</span></td>
                  <td className="p-3 text-neon font-semibold">PKR{t.price_per_hour || 120}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-white transition-colors"><HiOutlinePencil /></button>
                      <button className="p-1.5 rounded-lg hover:bg-dark-300 text-gray-400 hover:text-red-400 transition-colors"><HiOutlineXCircle /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}



