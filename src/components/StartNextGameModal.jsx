import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function StartNextGameModal({ session, lastGame, onStart, onClose }) {
  const prev = lastGame || {};
  const [matchType, setMatchType] = useState('single');
  const [p1, setP1] = useState(prev.player1 || session?.player1 || '');
  const [p2, setP2] = useState(prev.player2 || session?.player2 || '');
  const [p3, setP3] = useState(prev.player3 || session?.player3 || '');
  const [p4, setP4] = useState(prev.player4 || session?.player4 || '');

  const isTeam = matchType === 'team';
  const valid = isTeam
    ? p1.trim() && p2.trim() && p3.trim() && p4.trim()
    : p1.trim() && p2.trim();

  const handleSubmit = () => {
    if (!valid) return;
    window.api.startNextGame(session.id, p1, p2, isTeam ? p3 : null, isTeam ? p4 : null, matchType).then(() => onStart());
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card-premium p-6 max-w-lg w-full mx-4 shadow-glass"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gradient">Start Next Game — Table {session?.table_number}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300/50 text-gray-400 hover:text-white hover:bg-dark-400/70 border border-transparent hover:border-red-500/30 transition-all">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Match Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setMatchType('single'); setP3(''); setP4(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  matchType === 'single' ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'
                }`}>Single (1v1)</button>
              <button type="button" onClick={() => setMatchType('team')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  matchType === 'team' ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'
                }`}>Team (2v2)</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
              {isTeam ? 'Team A Players' : 'Players'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Player 1" value={p1} onChange={e => setP1(e.target.value)} className="input-field" autoFocus />
              <input type="text" placeholder="Player 2" value={p2} onChange={e => setP2(e.target.value)} className="input-field" />
            </div>
          </div>

          {isTeam && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Team B Players</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Player 3" value={p3} onChange={e => setP3(e.target.value)} className="input-field" />
                <input type="text" placeholder="Player 4" value={p4} onChange={e => setP4(e.target.value)} className="input-field" />
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-600">Players can be changed for each game.</p>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={!valid} className="btn-neon flex-1">Start Game</button>
        </div>
      </motion.div>
    </div>
  );
}
