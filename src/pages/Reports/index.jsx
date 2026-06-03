import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { HiOutlineDownload, HiOutlineFilter } from 'react-icons/hi';

export default function Reports({ onRefresh }) {
  const [tab, setTab] = useState('sales');
  const [dailyReport, setDailyReport] = useState(null);
  const [tableUsage, setTableUsage] = useState([]);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [tab, selectedDate]);

  const loadData = () => {
    window.api.getDailyReport(selectedDate, null).then(setDailyReport);
    window.api.getTableUsageReport().then(setTableUsage);
    window.api.getPlayerHistory().then(setPlayerHistory);
  };

  const tabs = [
    { id: 'sales', label: 'Sales' },
    { id: 'tables', label: 'Tables' },
    { id: 'players', label: 'Players' },
    { id: 'canteen', label: 'Canteen' },
  ];

  const usageChartData = tableUsage.map(t => ({
    name: `T${t.table_number}`,
    Revenue: t.total_revenue || 0,
    Hours: Math.round((t.total_minutes || 0) / 60 * 10) / 10,
  }));

  const tableStats = [
    { label: 'Total Revenue', value: dailyReport ? `PKR${dailyReport.totalRevenue.toFixed(2)}` : '—', color: 'text-neon' },
    { label: 'Table Revenue', value: dailyReport ? `PKR${dailyReport.tableRevenue.toFixed(2)}` : '—', color: 'text-blue-400' },
    { label: 'Canteen Revenue', value: dailyReport ? `PKR${dailyReport.canteenRevenue.toFixed(2)}` : '—', color: 'text-gold' },
    { label: 'Sessions', value: dailyReport?.sessions?.length || 0, color: 'text-white' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">Data-driven insights for your club</p>
        </div>
        <button className="btn-ghost flex items-center gap-2"><HiOutlineDownload className="text-sm" /> Export</button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id ? 'bg-neon/10 text-neon border border-neon/20' : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field w-40 text-xs" />
          </div>
        </div>
      </div>

      {tab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {tableStats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Table Revenue Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="Revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {dailyReport?.sessions?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-dark-300">
                <h3 className="text-sm font-semibold text-white">Sessions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-dark-300">
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Table</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Players</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Duration</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Games</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Table Bill</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Canteen</th>
                    <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Total</th>
                  </tr></thead>
                  <tbody>
                    {dailyReport.sessions.map(s => (
                      <tr key={s.id} className="border-b border-dark-300/50 hover:bg-dark-300/30">
                        <td className="p-3 font-medium text-white">#{s.table_number}</td>
                        <td className="p-3 text-gray-300 text-xs">{s.match_type === 'team' ? `${s.player1} & ${s.player2} vs ${s.player3} & ${s.player4}` : `${s.player1} vs ${s.player2}`}</td>
                        <td className="p-3 text-gray-400 text-xs">{Math.floor(s.duration_minutes / 60)}h {Math.round(s.duration_minutes % 60)}m</td>
                        <td className="p-3 text-gray-300">{s.game_count || 0}</td>
                        <td className="p-3 text-neon">PKR{(s.table_bill || 0).toFixed(2)}</td>
                        <td className="p-3 text-gold">PKR{(s.canteen_bill || 0).toFixed(2)}</td>
                        <td className="p-3 font-semibold text-white">PKR{(s.total_bill || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'tables' && (
        <div className="grid grid-cols-4 gap-4">
          {tableUsage.map((t, i) => (
            <motion.div key={t.table_number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 text-center">
              <p className="text-xs text-gray-500 uppercase mb-1">Table {t.table_number}</p>
              <p className="text-2xl font-bold text-white">{t.total_games || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{Math.floor((t.total_minutes || 0) / 60)}h {Math.round((t.total_minutes || 0) % 60)}m</p>
              <p className="text-sm font-semibold text-neon mt-1">PKR{(t.total_revenue || 0).toFixed(2)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'players' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-300">
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Player</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Games</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Wins</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Losses</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Win Rate</th>
              </tr></thead>
              <tbody>
                {playerHistory.map((p, i) => (
                  <tr key={i} className="border-b border-dark-300/50 hover:bg-dark-300/30">
                    <td className="p-3 font-medium text-white">{p.player}</td>
                    <td className="p-3 text-gray-300">{p.games_played}</td>
                    <td className="p-3 text-neon">{p.wins}</td>
                    <td className="p-3 text-red-400">{p.losses}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-dark-300 overflow-hidden">
                          <div className="h-full rounded-full bg-neon" style={{ width: `${p.win_rate}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{p.win_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {playerHistory.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'canteen' && dailyReport?.canteenOrders?.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-dark-300"><h3 className="text-sm font-semibold text-white">Canteen Sales Breakdown</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-300">
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Item</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Quantity</th>
                <th className="text-left p-3 text-[10px] text-gray-500 uppercase">Revenue</th>
              </tr></thead>
              <tbody>
                {dailyReport.canteenOrders.map((item, i) => (
                  <tr key={i} className="border-b border-dark-300/50 hover:bg-dark-300/30">
                    <td className="p-3 text-white font-medium">{item.item_name}</td>
                    <td className="p-3 text-gray-300">{item.quantity}</td>
                    <td className="p-3 text-gold font-semibold">PKR{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'canteen' && (!dailyReport?.canteenOrders || dailyReport.canteenOrders.length === 0) && (
        <div className="glass-card p-8 text-center text-gray-500"><p>No canteen orders for this date</p></div>
      )}
    </motion.div>
  );
}



