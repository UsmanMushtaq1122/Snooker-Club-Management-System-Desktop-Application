import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BillReceipt({ data, onClose }) {
  const { session, orders } = data;
  const [games, setGames] = useState([]);
  const perGamePrice = session.per_game_price || session.price_per_hour || 120;

  useEffect(() => { window.api.getSessionGames(session.id).then(setGames); }, [session.id]);

  const printReceipt = () => {
    window.api.getSessionGames(session.id).then(allGames => {
      const html = generateReceiptHtml(session, orders, allGames, perGamePrice);
      window.api.printBill(html);
    });
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 max-w-sm w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between no-print mb-4">
          <h2 className="text-lg font-bold text-white">Receipt — Table {session.table_number}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-400 transition-all">✕</button>
        </div>

        <div className="font-mono text-xs">
          <div className="text-center mb-3">
            <h2 className="text-sm font-bold text-white">SNOOKER CLUB</h2>
            <p className="text-gray-500 text-[10px]">Bill Receipt</p>
          </div>
          <div className="border-t border-dashed border-dark-400 my-2" />
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Table</span><span className="text-white">#{session.table_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Match</span><span className="text-white">{session.player3 ? 'Team (2v2)' : 'Single (1v1)'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Players</span><span className="text-white text-right">{session.player3 ? `${session.player1} & ${session.player2} vs ${session.player3} & ${session.player4}` : `${session.player1} vs ${session.player2}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-white">{new Date(session.start_time).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="text-white">{new Date(session.start_time).toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">End</span><span className="text-white">{new Date(session.end_time).toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-white">{Math.floor(session.duration_minutes / 60)}h {Math.round(session.duration_minutes % 60)}m</span></div>
          </div>
          <div className="border-t border-dashed border-dark-400 my-2" />
          {games.length > 0 && (
            <>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Games ({games.length})</p>
              {games.map(g => {
                const isTeamGame = !!(g.player3 || g.player4);
                const rate = g.rate || perGamePrice || 120;
                const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
                return (
                  <div key={g.id} className="flex justify-between text-[10px] py-0.5">
                    <span className="text-gray-500">#{g.game_number} ({isTeamGame ? 'Team' : 'Single'})</span>
                    <span className="text-white">₹{amount.toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="border-t border-dashed border-dark-400 my-2" />
            </>
          )}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold"><span className="text-white">Table Bill</span><span className="text-neon">₹{(session.table_bill || 0).toFixed(2)}</span></div>
          </div>
          {orders?.length > 0 && (
            <>
              <div className="border-t border-dashed border-dark-400 my-2" />
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Canteen Orders</p>
              {orders.map((o, i) => (
                <div key={i} className="flex justify-between text-[10px] py-0.5">
                  <span className="text-gray-500">{o.item_name} x{o.quantity}</span>
                  <span className="text-white">₹{o.total.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold mt-1">
                <span className="text-white">Canteen Total</span>
                <span className="text-gold">₹{(session.canteen_bill || 0).toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="border-t border-dashed border-dark-400 my-2" />
          <div className="flex justify-between text-base py-1">
            <span className="text-white font-bold">TOTAL</span>
            <span className="text-neon font-bold">₹{(session.total_bill || 0).toFixed(2)}</span>
          </div>
          <div className="text-center mt-3 text-gray-600 text-[10px]">Thank you for playing!</div>
        </div>

        <div className="flex gap-2 mt-4 no-print">
          <button onClick={onClose} className="btn-ghost flex-1">Close</button>
          <button onClick={printReceipt} className="btn-neon flex-1">Print Receipt</button>
        </div>
      </motion.div>
    </div>
  );
}

export function generateReceiptHtml(session, orders, games, perGamePrice) {
  let gamesHtml = '';
  if (games?.length > 0) {
    gamesHtml = games.map(g => {
      const isTeamGame = !!(g.player3 || g.player4);
      const rate = g.rate || perGamePrice || 120;
      const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
      return `<tr><td>#${g.game_number} (${isTeamGame ? 'Team' : 'Single'})</td><td style="text-align:right">₹${amount.toFixed(2)}</td></tr>`;
    }).join('');
  }
  let ordersHtml = '';
  if (orders?.length > 0) {
    ordersHtml = orders.map(o => `<tr><td>${o.item_name} x${o.quantity}</td><td style="text-align:right">₹${o.total?.toFixed(2)}</td></tr>`).join('');
    ordersHtml += `<tr style="font-weight:600"><td>Canteen Total</td><td style="text-align:right">₹${session?.canteen_bill?.toFixed(2)}</td></tr>`;
  }
  return `<!DOCTYPE html><html><head><style>
    body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; color: #000; max-width: 320px; margin: 0 auto; }
    h2 { text-align: center; font-size: 16px; margin: 0 0 4px; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 3px 0; font-size: 11px; }
    .total { font-size: 16px; font-weight: bold; }
    .footer { text-align: center; margin-top: 12px; font-size: 10px; color: #888; }
  </style></head><body>
    <h2>SNOOKER CLUB</h2>
    <p style="text-align:center;font-size:10px;color:#666;margin:0 0 8px">Bill Receipt</p>
    <div class="divider"></div>
    <table>
      <tr><td>Table</td><td style="text-align:right">#${session?.table_number}</td></tr>
      <tr><td>Players</td><td style="text-align:right">${isTeam ? `${session?.player1} & ${session?.player2} vs ${session?.player3} & ${session?.player4}` : `${session?.player1} vs ${session?.player2}`}</td></tr>
      <tr><td>Date</td><td style="text-align:right">${new Date(session?.start_time).toLocaleDateString()}</td></tr>
      <tr><td>Duration</td><td style="text-align:right">${Math.floor(session?.duration_minutes / 60)}h ${Math.round(session?.duration_minutes % 60)}m</td></tr>
    </table>
    ${gamesHtml ? `<div class="divider"></div><table>${gamesHtml}</table>` : ''}
    <div class="divider"></div>
    <table>
      <tr style="font-weight:bold"><td>Table Bill</td><td style="text-align:right">₹${session?.table_bill?.toFixed(2)}</td></tr>
    </table>
    ${ordersHtml ? `<div class="divider"></div><table>${ordersHtml}</table>` : ''}
    <div class="divider"></div>
    <table><tr class="total"><td>TOTAL</td><td style="text-align:right">₹${session?.total_bill?.toFixed(2)}</td></tr></table>
    <div class="divider"></div>
    <p class="footer">Thank you for playing!</p>
  </body></html>`;
}
