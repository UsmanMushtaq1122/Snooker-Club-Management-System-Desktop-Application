import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch, HiOutlineBell, HiOutlineSun, HiOutlineMoon,
  HiOutlineChevronDown, HiOutlineTable,
} from 'react-icons/hi';

export default function Navbar({ theme, onToggleTheme, activeTables }) {
  const [time, setTime] = useState(new Date());
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 glass border-b border-dark-300/40 flex items-center justify-between px-6 flex-shrink-0 relative"
    >
      <div className="absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-dark-400/50 to-transparent" />
      <div className="flex items-center gap-5">
        <motion.div
          animate={{ width: searchFocused ? 340 : 240 }}
          className={cn(
            'relative flex items-center transition-all duration-300',
            searchFocused ? 'ring-1 ring-neon/40 shadow-[0_0_15px_rgba(34,197,94,0.08)]' : ''
          )}
        >
          <HiOutlineSearch className={cn('absolute left-3 text-base transition-colors', searchFocused ? 'text-neon' : 'text-gray-500')} />
          <input
            type="text"
            placeholder="Search players, tables..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-3 py-2 bg-dark-300/40 border border-dark-400/40 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon/40 transition-all"
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          animate={{ scale: activeTables > 0 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-neon/10 border border-neon/20 rounded-xl"
        >
          <span className="relative flex h-2 w-2">
            {activeTables > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-40" />}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
          </span>
          <HiOutlineTable className="text-neon text-sm" />
          <span className="text-xs font-semibold text-neon">{activeTables} Active</span>
        </motion.div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-300/30 border border-dark-400/30 rounded-xl">
          <span className="text-[10px] text-gray-500 font-mono tabular-nums leading-none">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="w-px h-3 bg-dark-400/60" />
          <span className="text-[10px] text-gray-300 font-mono tabular-nums font-medium leading-none">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-neon hover:bg-neon/10 border border-transparent hover:border-neon/20 transition-all"
        >
          {theme === 'dark' ? <HiOutlineSun className="text-base" /> : <HiOutlineMoon className="text-base" />}
        </button>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all">
          <HiOutlineBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon rounded-full animate-pulse-dot" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-dark-400/40">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-neon-sm">
            SC
          </div>
          <div className="text-[11px] leading-tight">
            <p className="text-gray-200 font-semibold">Cashier</p>
            <p className="text-[10px] text-gray-500">Administrator</p>
          </div>
          <HiOutlineChevronDown className="text-gray-500 text-xs" />
        </div>
      </div>
    </motion.header>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}


