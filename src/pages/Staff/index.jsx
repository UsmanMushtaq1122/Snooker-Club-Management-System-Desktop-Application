import React from 'react';
import { motion } from 'framer-motion';

export default function Staff() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Staff Management</h1>
        <p className="text-xs text-gray-500 mt-1">Manage cashiers, managers, and staff</p>
      </div>
      <div className="glass-card p-8 text-center text-gray-500">
        <p className="text-lg mb-2">👨‍💼</p>
        <p>Staff management module</p>
      </div>
    </motion.div>
  );
}
