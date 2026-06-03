import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function StartGameModal({ tableNumber, onStart, onClose }) {
  const [matchType, setMatchType] = useState('single');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player3, setPlayer3] = useState('');
  const [player4, setPlayer4] = useState('');

  const valid = matchType === 'single'
    ? player1.trim() && player2.trim() && player1.trim() !== player2.trim()
    : player1.trim() && player2.trim() && player3.trim() && player4.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    window.api.startGame(tableNumber, player1.trim(), player2.trim(), matchType,
      matchType === 'team' ? player3.trim() : null, matchType === 'team' ? player4.trim() : null
    ).then(() => onStart());
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
          <h2 className="text-lg font-bold text-gradient">Start Session — Table {tableNumber}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300/50 text-gray-400 hover:text-white hover:bg-dark-400/70 hover:border-red-500/30 border border-transparent transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Match Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMatchType('single')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  matchType === 'single' ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'
                }`}>Single (1v1)</button>
              <button type="button" onClick={() => setMatchType('team')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  matchType === 'team' ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'
                }`}>Team (2v2)</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{matchType === 'team' ? 'Team A — Player 1' : 'Player 1'}</label>
              <input type="text" placeholder="Enter name" value={player1} onChange={e => setPlayer1(e.target.value)} className="input-field" autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{matchType === 'team' ? 'Team A — Player 2' : 'Player 2'}</label>
              <input type="text" placeholder="Enter name" value={player2} onChange={e => setPlayer2(e.target.value)} className="input-field" />
            </div>
          </div>
          {matchType === 'team' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Team B — Player 1</label>
                <input type="text" placeholder="Enter name" value={player3} onChange={e => setPlayer3(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Team B — Player 2</label>
                <input type="text" placeholder="Enter name" value={player4} onChange={e => setPlayer4(e.target.value)} className="input-field" />
              </div>
            </div>
          )}
          {matchType === 'single' && player1.trim() && player2.trim() && player1.trim() === player2.trim() && (
            <p className="text-xs text-red-400">Player names must be different</p>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={!valid} className="btn-neon flex-1">Start Session</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
