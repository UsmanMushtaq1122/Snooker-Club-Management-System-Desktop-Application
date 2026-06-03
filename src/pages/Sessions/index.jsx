import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';

export default function Sessions({ onRefresh }) {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.api.getAllSessions().then(setSessions).catch(() => {});
  }, []);

  const filtered = sessions.filter(s =>
    !search || s.player1?.toLowerCase().includes(search.toLowerCase()) ||
    s.player2?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.table_number).includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Sessions</h1>
        <p className="text-xs text-gray-500 mt-1">View and manage all game sessions</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder="Search by player name or table..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-300">
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Table</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Players</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Type</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Start</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">End</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Games</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Total</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((s) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-dark-300/50 hover:bg-dark-300/30 transition-colors"
                >
                  <td className="p-3 font-medium text-white">#{s.table_number}</td>
                  <td className="p-3 text-gray-300">
                    {s.match_type === 'team'
                      ? `${s.player1} & ${s.player2} vs ${s.player3} & ${s.player4}`
                      : `${s.player1} vs ${s.player2}`}
                  </td>
                  <td className="p-3">
                    <span className={`badge ${s.match_type === 'team' ? 'badge-reserved' : 'badge-available'}`}>
                      {s.match_type === 'team' ? 'Team' : 'Single'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{new Date(s.start_time).toLocaleString()}</td>
                  <td className="p-3 text-gray-400 text-xs">{s.end_time ? new Date(s.end_time).toLocaleString() : '—'}</td>
                  <td className="p-3 text-gray-300 font-medium">{s.game_count || 0}</td>
                  <td className="p-3 text-neon font-semibold">PKR{(s.total_bill || 0).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`badge ${s.status === 'running' ? 'badge-running' : s.status === 'completed' ? 'badge-completed' : 'badge-available'}`}>
                      {s.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-gray-500 text-sm">No sessions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}



