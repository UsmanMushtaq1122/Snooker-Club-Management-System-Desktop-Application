import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlay, HiOutlineStop, HiOutlinePlus, HiOutlineShoppingBag, HiOutlineDocumentText, HiOutlineUserAdd } from 'react-icons/hi';

function formatDuration(startTime, now) {
  if (!startTime) return '00:00:00';
  const start = new Date(startTime).getTime();
  const elapsed = Math.floor((now - start) / 1000);
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatGameTimer(startTime, now) {
  if (!startTime) return '0:00';
  const start = new Date(startTime).getTime();
  const elapsed = Math.floor((now - start) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const statusConfig = {
  available: { label: 'Available', color: 'text-neon', bg: 'bg-neon/10', border: 'border-neon/20', badge: 'badge-available' },
  running: { label: 'Running', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'badge-running' },
  reserved: { label: 'Reserved', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20', badge: 'badge-reserved' },
  maintenance: { label: 'Maintenance', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', badge: 'badge-maintenance' },
};

export default function TableCard({ table, session, now, onStartGame, onEndGame, onEndCurrentGame, onStartNextGame, onAddCanteen, onViewBill }) {
  const status = session ? 'running' : (table.status || 'available');
  const config = statusConfig[status] || statusConfig.available;
  const isTeam = session?.match_type === 'team';
  const currentGame = session?.current_game;
  const gamePlaying = currentGame?.status === 'playing';
  const completedGames = session?.game_count || 0;

  const gp1 = currentGame?.player1 || session?.player1;
  const gp2 = currentGame?.player2 || session?.player2;
  const gp3 = currentGame?.player3 || session?.player3;
  const gp4 = currentGame?.player4 || session?.player4;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`glass-card-premium overflow-hidden group cursor-default ${session ? 'border-blue-500/20' : 'border-dark-300/40'}`}
    >
      <div className={`relative p-3.5 border-b ${config.border}`}>
        <div className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-current/10 to-transparent" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.span
              animate={status === 'running' ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`relative flex h-2.5 w-2.5 ${status === 'running' ? 'bg-blue-400' : status === 'available' ? 'bg-neon' : 'bg-gold'} rounded-full`}
            >
              {status === 'running' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40" />}
            </motion.span>
            <span className="text-sm font-bold text-white">Table {table.table_number}</span>
          </div>
          <span className={`badge ${config.badge}`}>{config.label}</span>
        </div>

        {status === 'running' && session && (
          <div className="space-y-2">
            {isTeam ? (
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Team A</p>
                  <p className="text-xs font-medium text-gray-200">{gp1}</p>
                  <p className="text-xs font-medium text-gray-200">{gp2}</p>
                </div>
                <span className="text-[10px] text-gray-600 font-bold">VS</span>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase">Team B</p>
                  <p className="text-xs font-medium text-gray-200">{gp3}</p>
                  <p className="text-xs font-medium text-gray-200">{gp4}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-gray-200 bg-dark-300/50 px-2 py-1 rounded-lg truncate max-w-[80px]">{gp1}</span>
                <span className="text-[10px] text-gray-600 font-bold">VS</span>
                <span className="text-xs font-semibold text-gray-200 bg-dark-300/50 px-2 py-1 rounded-lg truncate max-w-[80px]">{gp2}</span>
              </div>
            )}

            {gamePlaying ? (
              <div className="text-center py-1">
                <p className="text-[10px] text-gray-500">Game #{currentGame.game_number}</p>
                <p className="text-lg font-mono font-bold text-blue-400 tabular-nums">
                  {formatGameTimer(currentGame.start_time, now)}
                </p>
              </div>
            ) : completedGames > 0 ? (
              <div className="text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon/10 text-neon text-[10px] font-medium">
                  {completedGames} Game{completedGames > 1 ? 's' : ''} Completed
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-[10px] text-gray-600">Ready to start</span>
              </div>
            )}
          </div>
        )}

        {status === 'available' && (
          <div className="flex flex-col items-center justify-center py-3">
            <span className="text-lg mb-1">🎱</span>
            <p className="text-xs text-gray-600">Available</p>
          </div>
        )}

        {status === 'completed' && (
          <div className="flex flex-col items-center justify-center py-3">
            <span className="text-lg mb-1">✅</span>
            <p className="text-xs text-gray-600">Session Complete</p>
          </div>
        )}
      </div>

      <div className="p-2.5 flex gap-1.5 flex-wrap">
        {status === 'available' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onStartGame}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neon text-white text-xs font-semibold hover:bg-neon-600 hover:shadow-neon-strong transition-all"
            >
              <HiOutlinePlay className="text-sm" />
              Start
            </motion.button>
        )}

        {status === 'running' && session && gamePlaying && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEndCurrentGame}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              <HiOutlineStop className="text-sm" />
              End Game
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddCanteen}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-300 text-gray-400 text-xs font-semibold hover:bg-dark-400 transition-colors"
            >
              <HiOutlineShoppingBag className="text-sm" />
              Food
            </motion.button>
          </>
        )}

        {status === 'running' && session && !gamePlaying && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartNextGame}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neon/10 text-neon border border-neon/20 text-xs font-semibold hover:bg-neon/20 transition-colors"
            >
              <HiOutlinePlay className="text-sm" />
              Next
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEndGame}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors"
            >
              <HiOutlineStop className="text-sm" />
              End
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddCanteen}
              className="px-2 py-2 rounded-lg bg-dark-300 text-gray-400 text-xs font-semibold hover:bg-dark-400 transition-colors"
            >
              <HiOutlineShoppingBag className="text-sm" />
            </motion.button>
          </>
        )}

        {status === 'completed' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewBill}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-300 text-gray-400 text-xs font-semibold hover:bg-dark-400 transition-colors"
          >
            <HiOutlineDocumentText className="text-sm" />
            Bill
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
