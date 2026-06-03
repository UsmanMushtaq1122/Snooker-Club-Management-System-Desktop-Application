import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineRefresh, HiOutlineCash, HiOutlineCreditCard, HiOutlineReceiptRefund, HiOutlinePrinter, HiOutlineCheckCircle } from 'react-icons/hi';
import TableCard from '../../components/TableCard';
import StartGameModal from '../../components/StartGameModal';
import CanteenModal from '../../components/CanteenModal';
import BillReceipt from '../../components/BillReceipt';
import RecordGameModal from '../../components/RecordGameModal';
import StartNextGameModal from '../../components/StartNextGameModal';

export default function LiveTables({ sessions, onRefresh }) {
  const [tables, setTables] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [startGameTable, setStartGameTable] = useState(null);
  const [canteenSession, setCanteenSession] = useState(null);
  const [viewBillSession, setViewBillSession] = useState(null);
  const [showEndGame, setShowEndGame] = useState(null);
  const [recordGameSession, setRecordGameSession] = useState(null);
  const [showStartNextGame, setShowStartNextGame] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    window.api.getTables().then(setTables).catch(() => {});
  }, [sessions]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getSessionForTable = useCallback((tableNumber) => {
    return sessions.find(s => s.table_number === tableNumber) || null;
  }, [sessions]);

  const handleRefresh = () => {
    window.api.getTables().then(setTables);
    if (onRefresh) onRefresh();
  };

  const filteredTables = filterStatus === 'all'
    ? tables
    : tables.filter(t => {
        const session = getSessionForTable(t.table_number);
        const status = session ? 'running' : t.status;
        return status === filterStatus;
      });

  const statusCounts = { all: tables.length, available: 0, running: 0, reserved: 0, maintenance: 0 };
  tables.forEach(t => {
    const session = getSessionForTable(t.table_number);
    const status = session ? 'running' : t.status;
    if (statusCounts[status] !== undefined) statusCounts[status]++;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Live Tables</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time table monitoring and management</p>
        </div>
        <button onClick={handleRefresh} className="btn-ghost flex items-center gap-2">
          <HiOutlineRefresh className="text-sm" />
          Refresh
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All', count: statusCounts.all, color: 'text-gray-400' },
            { id: 'available', label: 'Available', count: statusCounts.available, color: 'text-neon' },
            { id: 'running', label: 'Running', count: statusCounts.running, color: 'text-blue-400' },
            { id: 'reserved', label: 'Reserved', count: statusCounts.reserved, color: 'text-gold' },
            { id: 'maintenance', label: 'Maintenance', count: statusCounts.maintenance, color: 'text-red-400' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === f.id
                  ? 'bg-neon/10 text-neon border border-neon/20'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              <span className={f.color}>{f.count}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-5 gap-4"
      >
        {filteredTables.map((table, i) => (
          <motion.div
            key={table.table_number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            layout
          >
            <TableCard
              table={table}
              session={getSessionForTable(table.table_number)}
              now={now}
              onStartGame={() => setStartGameTable(table.table_number)}
              onEndGame={() => {
                const session = getSessionForTable(table.table_number);
                if (session) setShowEndGame(session);
              }}
              onEndCurrentGame={() => {
                const session = getSessionForTable(table.table_number);
                if (session) setRecordGameSession(session);
              }}
              onStartNextGame={() => {
                const session = getSessionForTable(table.table_number);
                if (session) {
                  window.api.getSessionGames(session.id).then(games => {
                    const lastGame = games?.length > 0 ? games[games.length - 1] : null;
                    setShowStartNextGame({ session, lastGame });
                  });
                }
              }}
              onAddCanteen={() => {
                const session = getSessionForTable(table.table_number);
                if (session) setCanteenSession(session);
              }}
              onViewBill={() => {
                window.api.getLatestSessionByTable(table.table_number).then(session => {
                  if (!session) return;
                  window.api.getCanteenOrders(session.id).then(orders => {
                    setViewBillSession({ session, orders });
                  });
                });
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {startGameTable && (
        <StartGameModal
          tableNumber={startGameTable}
          onStart={() => { setStartGameTable(null); handleRefresh(); }}
          onClose={() => setStartGameTable(null)}
        />
      )}

      {showEndGame && (
        <EndGameModal
          session={showEndGame}
          onEnd={(result) => {
            setShowEndGame(null);
            window.api.getCanteenOrders(result.id).then(orders => {
              setViewBillSession({ session: result, orders: orders || [] });
            }).catch(() => setViewBillSession({ session: result, orders: [] }));
            handleRefresh();
          }}
          onClose={() => setShowEndGame(null)}
        />
      )}

      {recordGameSession && (
        <RecordGameModal
          session={recordGameSession}
          onRecord={() => { setRecordGameSession(null); handleRefresh(); }}
          onClose={() => setRecordGameSession(null)}
        />
      )}

      {showStartNextGame && (
        <StartNextGameModal
          session={showStartNextGame.session}
          lastGame={showStartNextGame.lastGame}
          onStart={() => { setShowStartNextGame(null); handleRefresh(); }}
          onClose={() => setShowStartNextGame(null)}
        />
      )}

      {canteenSession && (
        <CanteenModal
          session={canteenSession}
          onAdd={() => { handleRefresh(); }}
          onClose={() => setCanteenSession(null)}
        />
      )}

      {viewBillSession && (
        <BillReceipt
          data={viewBillSession}
          onClose={() => setViewBillSession(null)}
        />
      )}
    </motion.div>
  );
}

function EndGameModal({ session, onEnd, onClose }) {
  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [paid, setPaid] = useState(false);
  const [note, setNote] = useState('');
  const [step, setStep] = useState('confirm');
  const isTeam = session?.match_type === 'team';

  useEffect(() => {
    if (session?.id) {
      window.api.getSessionGames(session.id).then(setGames);
      window.api.getCanteenOrders(session.id).then(setOrders);
    }
  }, [session?.id]);

  const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: HiOutlineCash, color: 'text-neon', bg: 'bg-neon/10' },
    { id: 'card', label: 'Card', icon: HiOutlineCreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'jazzcash', label: 'JazzCash', icon: HiOutlineReceiptRefund, color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 'easypaisa', label: 'EasyPaisa', icon: HiOutlineReceiptRefund, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  const handleEndSession = () => {
    setError('');
    window.api.endGame(session.id).then(result => {
      setBill(result);
      setStep('invoice');
    }).catch(err => setError(err.message || String(err)));
  };

  const subtotal = bill ? (bill.total_bill || 0) : 0;
  const discountAmount = discountType === 'percentage' ? subtotal * (discount / 100) : discount;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleComplete = () => {
    if (bill?.invoice_id) {
      window.api.updateInvoicePayment(bill.invoice_id, paymentMethod, discount, discountType, note);
    }
    setPaid(true);
  };

  const handleClose = () => {
    if (paid) onEnd(bill);
    else onClose();
  };

  const handlePrint = () => {
    const html = generateInvoiceHtml(bill, orders, games, bill?.per_game_price || 120, paymentMethod, discountAmount, grandTotal, '');
    window.api.printBill(html);
  };

  if (step === 'invoice' && bill) {
    return (
      <div className="modal-overlay-custom" onClick={handleClose}>
        <div className="glass-card p-0 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-dark-300/50 sticky top-0 bg-dark-100/90 backdrop-blur-xl z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Invoice — Table {bill.table_number}</h2>
              {paid && <span className="badge badge-available">Paid</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="btn-neon flex items-center gap-1.5 text-xs"><HiOutlinePrinter className="text-sm" /> Print</button>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-400 transition-all">✕</button>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-dark-300/50">
            <div className="col-span-2 p-5 font-mono text-xs">
              <div className="text-center mb-4 border-b border-dashed border-dark-400 pb-4">
                <h2 className="text-lg font-bold text-white">🎱 SNOOKER CLUB</h2>
                <p className="text-gray-500 text-[10px]">Official Invoice</p>
                <p className="text-gray-600 text-[9px] mt-1">INV-{String(bill.table_number).padStart(2, '0')}-{Date.now()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-gray-500 text-[9px] uppercase tracking-wider">Session</p>
                  <div className="flex justify-between"><span className="text-gray-500">Table</span><span className="text-white font-semibold">#{bill.table_number}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Match</span><span className="text-white">{bill.match_type === 'team' ? 'Team (2v2)' : 'Single (1v1)'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Players</span><span className="text-white text-right max-w-[160px]">{bill.match_type === 'team' ? `${bill.player1} & ${bill.player2} vs ${bill.player3} & ${bill.player4}` : `${bill.player1} vs ${bill.player2}`}</span></div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-[9px] uppercase tracking-wider">Time</p>
                  <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="text-white">{new Date(bill.start_time).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">End</span><span className="text-white">{new Date(bill.end_time).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-white font-semibold">{Math.floor(bill.duration_minutes / 60)}h {Math.round(bill.duration_minutes % 60)}m</span></div>
                </div>
              </div>

              <div className="border-t border-dashed border-dark-400 pt-3 mb-3">
                <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-2">Game History</p>
                {games.length > 0 ? (
                  <table className="w-full mb-3">
                    <thead>
                      <tr className="text-gray-600 text-[9px] uppercase">
                        <th className="text-left py-1">#</th>
                        <th className="text-left py-1">Type</th>
                        <th className="text-left py-1">Players</th>
                        <th className="text-left py-1">Winner</th>
                        <th className="text-right py-1">Rate</th>
                        <th className="text-right py-1">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map(g => {
                        const gp1 = g.player1 || bill.player1;
                        const gp2 = g.player2 || bill.player2;
                        const gp3 = g.player3 || bill.player3;
                        const gp4 = g.player4 || bill.player4;
                        const isTeamGame = !!(gp3 || gp4);
                        const rate = g.rate || bill?.per_game_price || 120;
                        const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
                        return (
                          <tr key={g.id} className="border-t border-dark-400/30">
                            <td className="py-1 text-gray-400">{g.game_number}</td>
                            <td className="py-1">
                              <span className={isTeamGame ? 'text-gold' : 'text-blue-400'}>{isTeamGame ? 'Team' : 'Single'}</span>
                            </td>
                            <td className="py-1 text-gray-300 text-[9px]">
                              {isTeamGame
                                ? `${gp1} & ${gp2} vs ${gp3} & ${gp4}`
                                : `${gp1} vs ${gp2}`}
                            </td>
                            <td className="py-1 text-neon font-semibold">{g.winner}</td>
                            <td className="py-1 text-right text-gray-400">PKR{rate}</td>
                            <td className="py-1 text-right text-white font-medium">PKR{amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : <p className="text-gray-600 text-center py-2">No individual game records</p>}
              </div>

              <div className="border-t border-dashed border-dark-400 pt-3 mb-3">
                <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-2">Canteen Orders</p>
                {orders.length > 0 ? (
                  <table className="w-full mb-3">
                    <thead>
                      <tr className="text-gray-600 text-[9px] uppercase">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={i} className="border-t border-dark-400/30">
                          <td className="py-1 text-gray-300">{o.item_name}</td>
                          <td className="py-1 text-center text-gray-400">×{o.quantity}</td>
                          <td className="py-1 text-right text-gray-400">PKR{o.price?.toFixed(2)}</td>
                          <td className="py-1 text-right text-white font-medium">PKR{(o.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-gray-600 text-center py-2">No canteen orders</p>}
              </div>

              <div className="border-t border-dashed border-dark-400 pt-3">
                <div className="space-y-1.5">
                  <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">Table Charges Breakdown</p>
                  {games.map(g => {
                    const isTeamGame = !!(g.player3 || g.player4);
                    const rate = g.rate || bill?.per_game_price || 120;
                    const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
                    return (
                      <div key={g.id} className="flex justify-between text-xs">
                        <span className="text-gray-400">Game #{g.game_number} ({isTeamGame ? 'Team' : 'Single'}, PKR{rate} × {isTeamGame ? '2' : '1'})</span>
                        <span className="text-white font-medium">PKR{amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-sm border-t border-dark-400/30 pt-1 mt-1">
                    <span className="text-gray-400">Total Table Charges</span>
                    <span className="text-white font-medium">PKR{(bill.table_bill || 0).toFixed(2)}</span>
                  </div>
                  {(bill.canteen_bill || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Canteen Charges ({orders.length} items)</span>
                      <span className="text-gold font-medium">PKR{(bill.canteen_bill || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white font-medium">PKR{subtotal.toFixed(2)}</span></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Discount ({discountType === 'percentage' ? `${discount}%` : `PKR${discount}`})</span>
                      <span className="text-red-400 font-medium">-PKR{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dark-300 pt-1.5 mt-1.5">
                    <div className="flex justify-between text-base">
                      <span className="text-white font-bold">Grand Total</span>
                      <span className="text-neon font-bold">PKR{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {paid && (
                  <div className="mt-3 pt-3 border-t border-dark-400/50 text-center">
                    <span className="badge badge-available">Paid via {paymentMethod.toUpperCase()}</span>
                  </div>
                )}
                <div className="mt-4 text-center text-gray-600 text-[9px]">
                  <p>Thank you for playing at Snooker Club!</p>
                  <p className="mt-0.5">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2"><HiOutlineCash className="text-neon" /> Payment</h3>
                <div className="space-y-1.5">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.icon;
                    const isActive = paymentMethod === method.id;
                    return (
                      <button key={method.id} onClick={() => !paid && setPaymentMethod(method.id)} disabled={paid}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive ? `${method.bg} ${method.color} border border-current/20` : 'text-gray-400 hover:text-gray-200 hover:bg-dark-300/50 border border-transparent'
                        }`}>
                        <Icon className="text-base" />
                        {method.label}
                        {isActive && <HiOutlineCheckCircle className="ml-auto text-neon" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Note</h3>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="input-field resize-none h-14 text-xs"
                  disabled={paid}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Discount</h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <button onClick={() => { setDiscountType('percentage'); setDiscount(0); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${discountType === 'percentage' ? 'bg-neon/10 text-neon border border-neon/20' : 'text-gray-500 border border-transparent'}`}>%</button>
                  <button onClick={() => { setDiscountType('fixed'); setDiscount(0); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${discountType === 'fixed' ? 'bg-neon/10 text-neon border border-neon/20' : 'text-gray-500 border border-transparent'}`}>PKR</button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{discountType === 'percentage' ? '%' : 'PKR'}</span>
                  <input type="number" min="0" max={discountType === 'percentage' ? 100 : subtotal} value={discount}
                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="input-field pl-7" disabled={paid} />
                </div>
              </div>

              <div className="border-t border-dark-300 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">PKR{subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-red-400">-PKR{discountAmount.toFixed(2)}</span></div>}
                <div className="border-t border-dark-300 pt-1.5"><div className="flex justify-between text-sm"><span className="text-white font-bold">Total</span><span className="text-neon font-bold">PKR{grandTotal.toFixed(2)}</span></div></div>
              </div>

              {!paid ? (
                <button onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-neon text-white font-semibold text-sm hover:bg-neon-600 shadow-neon transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <HiOutlineCheckCircle className="text-lg" />
                  Complete — PKR{grandTotal.toFixed(2)}
                </button>
              ) : (
                <div className="glass-card p-3 text-center border-neon/30">
                  <HiOutlineCheckCircle className="text-xl text-neon mx-auto mb-1" />
                  <p className="text-xs font-semibold text-neon">Payment Completed</p>
                  <p className="text-[10px] text-gray-500 uppercase mt-0.5">{paymentMethod}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">End Session — Table {session?.table_number}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-400 transition-all">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{isTeam ? 'Teams' : 'Players'}</p>
            {isTeam ? (
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-center"><p className="text-gray-400 text-xs">Team A</p><p className="text-white font-medium">{session?.player1} & {session?.player2}</p></div>
                <span className="text-gray-600">vs</span>
                <div className="text-center"><p className="text-gray-400 text-xs">Team B</p><p className="text-white font-medium">{session?.player3} & {session?.player4}</p></div>
              </div>
            ) : (
              <p className="text-center text-white font-medium">{session?.player1} vs {session?.player2}</p>
            )}
          </div>
          {games.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Games Played ({games.length})</p>
              <div className="space-y-1">
                {games.map(g => (
                  <div key={g.id} className="flex justify-between text-xs px-2 py-1 rounded bg-dark-300/50">
                    <span className="text-gray-400">Game #{g.game_number}</span>
                    <span><span className="text-neon">{g.winner}</span> beat <span className="text-red-400">{g.loser}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleEndSession} className="btn-neon flex-1">Generate Invoice</button>
        </div>
      </div>
    </div>
  );
}

function generateInvoiceHtml(session, orders, games, perGamePrice, paymentMethod, discountAmount, grandTotal, note) {
  const isTeam = session?.match_type === 'team';
  const gameCount = session?.game_count || 0;
  const subtotal = session?.total_bill || 0;
  const paymentLabels = { cash: 'Cash', card: 'Card', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa' };

  let gamesHtml = '';
  if (games?.length > 0) {
    gamesHtml = games.map(g => {
      const isTeamGame = !!(g.player3 || g.player4);
      const rate = g.rate || perGamePrice || 120;
      const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
      return `<tr><td style="padding:2px 4px">#${g.game_number}</td><td style="padding:2px 4px">${isTeamGame ? 'Team' : 'Single'}</td><td style="padding:2px 4px"><span style="color:#22C55E">${g.winner}</span></td><td style="padding:2px 4px;text-align:right">PKR${rate}</td><td style="padding:2px 4px;text-align:right;font-weight:bold">PKR${amount.toFixed(2)}</td></tr>`;
    }).join('');
  }
  let ordersHtml = '';
  if (orders?.length > 0) {
    ordersHtml = orders.map(o => `<tr><td style="padding:2px 4px">${o.item_name} x${o.quantity}</td><td style="padding:2px 4px;text-align:right">PKR${o.total?.toFixed(2)}</td></tr>`).join('');
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: 'Courier New', monospace; font-size: 11px; padding: 24px; color: #000; max-width: 420px; margin: 0 auto; }
    h1 { text-align: center; font-size: 18px; margin: 0 0 2px; letter-spacing: 1px; }
    .subtitle { text-align: center; font-size: 9px; color: #666; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 2px; }
    .divider { border-top: 1px dashed #333; margin: 8px 0; }
    .divider-double { border-top: 3px double #333; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 8px; color: #666; text-transform: uppercase; padding: 4px; border-bottom: 1px solid #ccc; }
    td { padding: 3px 4px; font-size: 10px; }
    .section-title { font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 4px; font-weight: bold; }
    .grand-total { font-size: 16px; font-weight: bold; }
    .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #888; }
    .paid-stamp { text-align: center; margin: 8px 0; padding: 4px; border: 2px solid #22C55E; color: #22C55E; font-weight: bold; font-size: 12px; letter-spacing: 3px; display: inline-block; }
  </style></head><body>
    <h1>🎱 SNOOKER CLUB</h1>
    <p class="subtitle">Official Invoice</p>
    <p style="text-align:center;font-size:9px;color:#999;margin:0 0 8px">INV-${String(session?.table_number).padStart(2, '0')}-${Date.now()}</p>
    <div class="divider"></div>
    <table>
      <tr><td style="color:#666">Table</td><td style="text-align:right;font-weight:bold">#${session?.table_number}</td></tr>
      <tr><td style="color:#666">Match</td><td style="text-align:right">${isTeam ? 'Team (2v2)' : 'Single (1v1)'}</td></tr>
      <tr><td style="color:#666">Players</td><td style="text-align:right">${isTeam ? `${session?.player1} & ${session?.player2} vs ${session?.player3} & ${session?.player4}` : `${session?.player1} vs ${session?.player2}`}</td></tr>
      <tr><td style="color:#666">Start</td><td style="text-align:right">${new Date(session?.start_time).toLocaleString()}</td></tr>
      <tr><td style="color:#666">End</td><td style="text-align:right">${new Date(session?.end_time).toLocaleString()}</td></tr>
      <tr><td style="color:#666">Duration</td><td style="text-align:right;font-weight:bold">${Math.floor((session?.duration_minutes || 0) / 60)}h ${Math.round((session?.duration_minutes || 0) % 60)}m</td></tr>
    </table>
    ${gamesHtml ? `<div class="divider"></div><p class="section-title">Game History</p><table><tr><th style="text-align:left">#</th><th style="text-align:left">Type</th><th style="text-align:left">Winner</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr>${gamesHtml}</table>` : ''}
    ${ordersHtml ? `<div class="divider"></div><p class="section-title">Canteen Orders</p><table>${ordersHtml}</table>` : ''}
    <div class="divider-double"></div>
    ${games?.length > 0 ? games.map(g => {
      const isTeamGame = !!(g.player3 || g.player4);
      const rate = g.rate || perGamePrice || 120;
      const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
      return `<tr><td style="color:#888;font-size:9px">Game #${g.game_number} (${isTeamGame ? 'Team' : 'Single'}, PKR${rate} × ${isTeamGame ? '2' : '1'})</td><td style="text-align:right;font-size:9px">PKR${amount.toFixed(2)}</td></tr>`;
    }).join('') : ''}
    <tr><td style="color:#666;font-weight:bold">Total Table Charges</td><td style="text-align:right;font-weight:bold">PKR${(session?.table_bill || 0).toFixed(2)}</td></tr>
    ${(session?.canteen_bill || 0) > 0 ? `<tr><td style="color:#666">Canteen Charges</td><td style="text-align:right">PKR${(session?.canteen_bill || 0).toFixed(2)}</td></tr>` : ''}
      <tr><td style="color:#666">Subtotal</td><td style="text-align:right">PKR${subtotal.toFixed(2)}</td></tr>
      ${discountAmount > 0 ? `<tr><td style="color:#EF4444">Discount</td><td style="text-align:right;color:#EF4444">-PKR${discountAmount.toFixed(2)}</td></tr>` : ''}
      <tr><td style="font-size:14px;font-weight:bold">GRAND TOTAL</td><td style="text-align:right;font-size:14px;font-weight:bold;color:#22C55E">PKR${grandTotal.toFixed(2)}</td></tr>
    </table>
    ${paymentMethod ? `<div style="text-align:center;margin:8px 0;font-size:9px;color:#666">Payment: <strong>${(paymentLabels[paymentMethod] || paymentMethod).toUpperCase()}</strong></div>` : ''}
    <div style="text-align:center;margin:8px 0"><span class="paid-stamp">PAID</span></div>
    ${note ? `<div style="text-align:center;font-size:8px;color:#999;font-style:italic;margin:4px 0">${note}</div>` : ''}
    <div class="divider"></div>
    <p class="footer">Thank you for playing at Snooker Club!</p>
    <p class="footer" style="font-size:8px">${new Date().toLocaleString()}</p>
  </body></html>`;
}



