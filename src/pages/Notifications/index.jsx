import React from 'react';
import { motion } from 'framer-motion';

export default function Notifications() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <p className="text-xs text-gray-500 mt-1">Alerts and system notifications</p>
      </div>
      <div className="glass-card p-8 text-center text-gray-500">
        <p className="text-lg mb-2">🔔</p>
        <p>No new notifications</p>
      </div>
    </motion.div>
  );
}


