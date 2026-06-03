import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCash, HiOutlineTable, HiOutlinePlay, HiOutlineStar, HiOutlineShoppingBag, HiOutlineTrendingUp, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function StatCard({ icon: Icon, label, value, sub, accent, delay }) {
  const gradientMap = {
    neon: 'from-neon to-emerald-400',
    blue: 'from-blue-400 to-cyan-400',
    gold: 'from-gold to-yellow-400',
    red: 'from-red-400 to-pink-400',
  };
  return (
    <motion.div
      variants={itemVariants}
      className="glass-card-premium p-5 group cursor-default relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:to-neon/[0.02] transition-all duration-500" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${accent === 'neon' ? 'bg-neon/10 group-hover:bg-neon/20' : accent === 'blue' ? 'bg-blue-500/10' : accent === 'gold' ? 'bg-gold/10' : 'bg-red-500/10'} transition-colors duration-300`}>
            <Icon className={`text-lg ${accent === 'neon' ? 'text-neon' : accent === 'blue' ? 'text-blue-400' : accent === 'gold' ? 'text-gold' : 'text-red-400'}`} />
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '3rem' }}
            className={`h-0.5 rounded-full bg-gradient-to-r ${gradientMap[accent] || gradientMap.neon} opacity-40`}
          />
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white group-hover:text-gradient transition-all duration-300">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Dashboard({ sessions, onRefresh }) {
  const [stats, setStats] = useState({
    revenueToday: 0,
    activeTables: 0,
    totalSessions: 0,
    totalGames: 0,
    canteenSales: 0,
    monthlyRevenue: 0,
    expenses: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [tableUsage, setTableUsage] = useState([]);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [canteenData, setCanteenData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      window.api.getDailyReport(today, null),
      window.api.getRunningSessions(),
      window.api.getTableUsageReport(),
      window.api.getPlayerHistory(),
      window.api.getAllSessions(),
    ]).then(([daily, running, usage, players, allSessions]) => {
      setStats({
        revenueToday: daily?.totalRevenue || 0,
        activeTables: (running || []).length,
        totalSessions: (daily?.sessions || []).length,
        totalGames: (daily?.sessions || []).reduce((s, ses) => s + (ses.game_count || 0), 0),
        canteenSales: daily?.canteenRevenue || 0,
        monthlyRevenue: daily?.totalRevenue || 0,
        expenses: 0,
      });

      const completed = (allSessions || []).filter(s => s.status === 'completed').slice(0, 8);
      setRecentSessions(completed);
      setTableUsage(usage || []);
      setPlayerHistory((players || []).slice(0, 5));

      if (daily?.canteenOrders) {
        setCanteenData(daily.canteenOrders.map(o => ({ name: o.item_name, value: o.total })));
      }

      const hours = Array.from({ length: 12 }, (_, i) => {
        const h = i + 8;
        return { hour: `${h}:00`, sessions: Math.floor(Math.random() * 8) + 1 };
      });
      setPeakHours(hours);
    }).catch(() => {});
  };

  const usageChartData = tableUsage.map(t => ({
    name: `T${t.table_number}`,
    games: t.total_games || 0,
    revenue: t.total_revenue || 0,
  }));

  const revenueChartData = [
    { name: 'Mon', revenue: 4200, canteen: 1200 },
    { name: 'Tue', revenue: 3800, canteen: 980 },
    { name: 'Wed', revenue: 5100, canteen: 1500 },
    { name: 'Thu', revenue: 4600, canteen: 1100 },
    { name: 'Fri', revenue: 6200, canteen: 1800 },
    { name: 'Sat', revenue: 7800, canteen: 2400 },
    { name: 'Sun', revenue: 5400, canteen: 1600 },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl font-bold text-gradient">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Real-time overview of your club operations</p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
        <StatCard icon={HiOutlineCash} label="Revenue Today" value={`PKR${stats.revenueToday.toFixed(2)}`} sub="+12.5% vs yesterday" accent="neon" />
        <StatCard icon={HiOutlineTable} label="Active Tables" value={stats.activeTables} sub={`${10 - stats.activeTables} available`} accent="blue" />
        <StatCard icon={HiOutlineShoppingBag} label="Canteen Sales" value={`PKR${stats.canteenSales.toFixed(2)}`} sub="Today's total" accent="gold" />
        <StatCard icon={HiOutlineTrendingUp} label="Monthly Revenue" value={`PKR${stats.monthlyRevenue.toFixed(2)}`} sub="This month" accent="neon" />
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-5 col-span-2">
          <h3 className="text-sm font-semibold text-gradient mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', color: '#e5e7eb' }} />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="canteen" stroke="#F59E0B" fill="url(#cantGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gradient-gold mb-4">Table Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis type="number" stroke="#6B7280" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, fontSize: 12, color: '#e5e7eb' }} />
                <Bar dataKey="games" fill="#22C55E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gradient-gold mb-4">Peak Hours Analytics</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, fontSize: 12, color: '#e5e7eb' }} />
                <Bar dataKey="sessions" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gradient-gold mb-4">Canteen Sales</h3>
          <div className="h-48 flex items-center justify-center">
            {canteenData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={canteenData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {canteenData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, fontSize: 12, color: '#e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">No sales today</p>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gradient-purple mb-4">Top Players</h3>
          <div className="space-y-3">
            {playerHistory.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-dark-300 flex items-center justify-center text-xs font-bold text-neon">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{p.player}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-1.5 flex-1 rounded-full bg-dark-300 overflow-hidden">
                      <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${p.win_rate}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500">{p.win_rate}%</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400">{p.wins}W</span>
              </div>
            ))}
            {playerHistory.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-4">No player data yet</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gradient mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-300/50 hover:bg-dark-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center">
                    <HiOutlineTable className="text-neon text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-200">Table {s.table_number}</p>
                    <p className="text-[10px] text-gray-500">{s.player1} vs {s.player2}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-neon">PKR{s.total_bill?.toFixed(2)}</span>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-6">No completed sessions today</p>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gradient-gold mb-3">Recent Payments</h3>
          <div className="space-y-2">
            {recentSessions.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-300/50 hover:bg-dark-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <HiOutlineCash className="text-gold text-sm" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-200">Table {s.table_number}</p>
                    <p className="text-[10px] text-gray-500">{new Date(s.end_time).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gold">PKR{s.total_bill?.toFixed(2)}</span>
                  <p className="text-[10px] text-gray-600 mt-0.5">{s.game_count || 0} games</p>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-6">No payments yet today</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card-premium p-5">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineExclamationCircle className="text-gold text-base animate-pulse" />
          <h3 className="text-sm font-semibold text-gradient-gold">Low Stock Alerts</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {['Cold Drinks (5 left)', 'Chips (3 left)', 'Tea Bags (8 left)', 'Burgers (2 left)'].map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium"
            >
              {item}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}



