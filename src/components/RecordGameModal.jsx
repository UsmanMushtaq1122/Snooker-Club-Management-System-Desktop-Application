import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RecordGameModal({ session, onRecord, onClose }) {
  const [winner, setWinner] = useState('');
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    window.api.getRunningGame(session.id).then(setCurrentGame);
    const interval = setInterval(() => { window.api.getRunningGame(session.id).then(setCurrentGame); }, 1000);
    return () => clearInterval(interval);
  }, [session.id]);

  const gp1 = currentGame?.player1 || session?.player1;
  const gp2 = currentGame?.player2 || session?.player2;
  const gp3 = currentGame?.player3 || session?.player3;
  const gp4 = currentGame?.player4 || session?.player4;
  const isTeam = !!(gp3 || gp4);
  const gameNumber = currentGame?.game_number || '?';

  const handleSubmit = () => {
    if (!winner || !currentGame) return;
    const loser = isTeam ? (winner === 'Team A' ? 'Team B' : 'Team A') : (winner === gp1 ? gp2 : gp1);
    window.api.endCurrentGame(session.id, winner, loser).then(() => onRecord());
  };

  const formatTimer = (startTime) => {
    if (!startTime) return '00:00';
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card-premium p-6 max-w-md w-full mx-4 shadow-glass"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gradient-purple">End Game #{gameNumber}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300/50 text-gray-400 hover:text-white hover:bg-dark-400/70 border border-transparent hover:border-red-500/30 transition-all">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{isTeam ? 'Teams' : 'Players'}</p>
            {isTeam ? (
              <div className="flex items-center justify-center gap-4">
                <div className="text-center"><p className="text-[10px] text-gray-500">Team A</p><p className="text-sm text-white font-medium">{gp1} & {gp2}</p></div>
                <span className="text-gray-600 text-xs font-bold">VS</span>
                <div className="text-center"><p className="text-[10px] text-gray-500">Team B</p><p className="text-sm text-white font-medium">{gp3} & {gp4}</p></div>
              </div>
            ) : (
              <p className="text-center text-sm text-white font-medium">{gp1} vs {gp2}</p>
            )}
          </div>
          {currentGame && (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="text-2xl font-mono font-bold text-neon">{formatTimer(currentGame.start_time)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Winner</p>
            <div className="flex gap-2">
              {isTeam ? (
                <>
                  <button onClick={() => setWinner('Team A')}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${winner === 'Team A' ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'}`}>
                    Team A<br /><span className="text-[10px] font-normal">{gp1} & {gp2}</span>
                  </button>
                  <button onClick={() => setWinner('Team B')}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${winner === 'Team B' ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'}`}>
                    Team B<br /><span className="text-[10px] font-normal">{gp3} & {gp4}</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setWinner(gp1)}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${winner === gp1 ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'}`}>{gp1}</button>
                  <button onClick={() => setWinner(gp2)}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${winner === gp2 ? 'bg-neon text-white shadow-neon-strong' : 'bg-dark-300/50 text-gray-400 hover:text-gray-200 hover:bg-dark-300'}`}>{gp2}</button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={!winner || !currentGame} className="btn-neon flex-1">End Game #{gameNumber}</button>
        </div>
      </motion.div>
    </div>
  );
}


