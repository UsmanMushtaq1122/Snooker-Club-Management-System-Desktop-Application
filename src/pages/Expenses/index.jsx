import React from 'react';
import { motion } from 'framer-motion';

export default function Expenses() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Expenses</h1>
        <p className="text-xs text-gray-500 mt-1">Track club expenses and overheads</p>
      </div>
      <div className="glass-card p-8 text-center text-gray-500">
        <p className="text-lg mb-2">💰</p>
        <p>Expense tracking module</p>
      </div>
    </motion.div>
  );
}


