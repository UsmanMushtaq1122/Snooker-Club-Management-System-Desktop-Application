import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineUserAdd } from 'react-icons/hi';

export default function Players({ onRefresh }) {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.api.getPlayerHistory().then(setPlayers).catch(() => {});
  }, []);

  const filtered = players.filter(p =>
    !search || p.player?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Players</h1>
          <p className="text-xs text-gray-500 mt-1">Player profiles and performance tracking</p>
        </div>
        <button className="btn-neon flex items-center gap-2">
          <HiOutlineUserAdd className="text-sm" />
          Add Player
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input type="text" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.player}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4 hover:border-neon/20 hover:shadow-neon transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                {p.player?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{p.player}</p>
                <p className="text-[10px] text-gray-500">{p.games_played} games played</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-dark-300/50">
                <p className="text-xs font-bold text-neon">{p.wins}</p>
                <p className="text-[10px] text-gray-500">Wins</p>
              </div>
              <div className="p-2 rounded-lg bg-dark-300/50">
                <p className="text-xs font-bold text-red-400">{p.losses}</p>
                <p className="text-[10px] text-gray-500">Losses</p>
              </div>
              <div className="p-2 rounded-lg bg-dark-300/50">
                <p className="text-xs font-bold text-gold">{p.win_rate}%</p>
                <p className="text-[10px] text-gray-500">Win Rate</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-dark-300 overflow-hidden">
              <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${p.win_rate}%` }} />
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-12 text-gray-500">No players found</div>
        )}
      </div>
    </motion.div>
  );
}
