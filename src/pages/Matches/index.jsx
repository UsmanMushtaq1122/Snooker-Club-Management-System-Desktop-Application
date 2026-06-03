import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';

export default function Matches({ onRefresh }) {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.api.getAllSessions().then(all => {
      const completed = all.filter(s => s.status === 'completed');
      const gameList = [];
      completed.forEach(s => {
        gameList.push({ type: 'session', ...s });
      });
      setGames(gameList);
    }).catch(() => {});
  }, []);

  const filtered = games.filter(g =>
    !search || g.player1?.toLowerCase().includes(search.toLowerCase()) ||
    g.player2?.toLowerCase().includes(search.toLowerCase()) || String(g.table_number).includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Match History</h1>
        <p className="text-xs text-gray-500 mt-1">View completed matches and game results</p>
      </div>
      <div className="glass-card p-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input type="text" placeholder="Search matches..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-300">
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Table</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Players</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Games</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Total</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(g => (
                <tr key={g.id} className="border-b border-dark-300/50 hover:bg-dark-300/30 transition-colors">
                  <td className="p-3 font-medium text-white">#{g.table_number}</td>
                  <td className="p-3 text-gray-300 text-xs">{g.match_type === 'team' ? `${g.player1} & ${g.player2} vs ${g.player3} & ${g.player4}` : `${g.player1} vs ${g.player2}`}</td>
                  <td className="p-3"><span className={`badge ${g.match_type === 'team' ? 'badge-reserved' : 'badge-available'}`}>{g.match_type === 'team' ? 'Team' : 'Single'}</span></td>
                  <td className="p-3 text-gray-400 text-xs">{g.duration_minutes ? `${Math.floor(g.duration_minutes / 60)}h ${Math.round(g.duration_minutes % 60)}m` : '—'}</td>
                  <td className="p-3 font-medium text-neon">{g.game_count || 0}</td>
                  <td className="p-3 text-gold font-semibold">₹{(g.total_bill || 0).toFixed(2)}</td>
                  <td className="p-3 text-gray-500 text-xs">{new Date(g.start_time).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-gray-500 text-sm">No matches found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
