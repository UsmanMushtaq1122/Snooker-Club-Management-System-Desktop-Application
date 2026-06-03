import React from 'react';
import { motion } from 'framer-motion';

export default function TeamMatches() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Team Matches</h1>
        <p className="text-xs text-gray-500 mt-1">Manage 2v2 team match sessions</p>
      </div>
      <div className="glass-card p-8 text-center text-gray-500">
        <p className="text-lg mb-2">👥</p>
        <p>Team match management will appear here</p>
        <p className="text-xs mt-2">Use the Live Tables view to start team matches</p>
      </div>
    </motion.div>
  );
}


