import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCash, HiOutlineCreditCard, HiOutlineReceiptRefund,
  HiOutlinePrinter, HiOutlineSave, HiOutlineCheckCircle,
  HiOutlineTrash, HiOutlineX, HiOutlineSearch
} from 'react-icons/hi';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: HiOutlineCash, color: 'text-neon', bg: 'bg-neon/10', border: 'border-neon/20' },
  { id: 'card', label: 'Card', icon: HiOutlineCreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'jazzcash', label: 'JazzCash', icon: HiOutlineReceiptRefund, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'easypaisa', label: 'EasyPaisa', icon: HiOutlineReceiptRefund, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
];

export default function Invoices({ sessions, onRefresh }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const receiptRef = useRef(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    window.api.getAllSessions().then(all => {
      const completed = all.filter(s => s.status === 'completed');
      const withOrders = completed.map(s => {
        return window.api.getCanteenOrders(s.id).then(orders => {
          return window.api.getSessionGames(s.id).then(games => ({
            ...s,
            orders: orders || [],
            games: games || [],
          }));
        });
      });
      Promise.all(withOrders).then(setInvoices).catch(() => setInvoices(completed));
    }).catch(() => {});
  };

  const filteredInvoices = invoices.filter(inv =>
    !search || String(inv.table_number).includes(search) ||
    inv.player1?.toLowerCase().includes(search.toLowerCase()) ||
    inv.player2?.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (view === 'detail' && selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onBack={() => { setView('list'); setSelectedInvoice(null); }}
        onRefresh={loadInvoices}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Invoices & Billing</h1>
          <p className="text-xs text-gray-500 mt-1">View, print, and manage invoices</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text" placeholder="Search by table, player, or invoice..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button onClick={loadInvoices} className="btn-ghost text-xs">Refresh</button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredInvoices.slice(0, 50).map((inv, idx) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            onClick={() => { setSelectedInvoice(inv); setView('detail'); }}
            className="glass-card p-4 hover:border-neon/20 hover:shadow-neon-sm cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  #{inv.table_number}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Table {inv.table_number} — {inv.match_type === 'team' ? 'Team Match' : 'Single Match'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {inv.match_type === 'team'
                      ? `${inv.player1} & ${inv.player2} vs ${inv.player3} & ${inv.player4}`
                      : `${inv.player1} vs ${inv.player2}`}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                    <span>{new Date(inv.start_time).toLocaleDateString()}</span>
                    <span>{Math.floor((inv.duration_minutes || 0) / 60)}h {Math.round((inv.duration_minutes || 0) % 60)}m</span>
                    <span>{inv.game_count || 0} games</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-neon">₹{(inv.total_bill || 0).toFixed(2)}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Table: ₹{(inv.table_bill || 0).toFixed(2)}</p>
                {(inv.canteen_bill || 0) > 0 && (
                  <p className="text-[10px] text-gold">Canteen: ₹{(inv.canteen_bill || 0).toFixed(2)}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filteredInvoices.length === 0 && (
          <div className="glass-card p-8 text-center text-gray-500">
            <HiOutlineCash className="text-3xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">No completed invoices found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InvoiceDetail({ invoice, onBack, onRefresh }) {
  const [orders, setOrders] = useState(invoice.orders || []);
  const [games, setGames] = useState(invoice.games || []);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [paid, setPaid] = useState(false);
  const [note, setNote] = useState('');
  const receiptRef = useRef(null);

  const isTeam = invoice.match_type === 'team';
  const perGamePrice = invoice.per_game_price || invoice.price_per_hour || 120;
  const gameCount = invoice.game_count || 0;

  useEffect(() => {
    if (!invoice.orders) {
      window.api.getCanteenOrders(invoice.id).then(setOrders);
    }
    if (!invoice.games) {
      window.api.getSessionGames(invoice.id).then(setGames);
    }
  }, [invoice.id]);

  const tableBill = invoice.table_bill || (gameCount * perGamePrice);
  const canteenTotal = orders.reduce((s, o) => s + (o.total || 0), 0);
  const subtotal = (invoice.total_bill !== undefined && invoice.total_bill !== null)
    ? invoice.total_bill
    : tableBill + canteenTotal;

  const discountAmount = discountType === 'percentage'
    ? subtotal * (discount / 100)
    : discount;

  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handlePrint = () => {
    const html = generateInvoiceHtml(invoice, orders, games, perGamePrice, paymentMethod, discountAmount, grandTotal, note);
    window.api.printBill(html);
  };

  const handleComplete = () => {
    window.api.getInvoices().then(all => {
      const inv = all.find(i => i.session_id === invoice.id);
      if (inv) {
        window.api.updateInvoicePayment(inv.id, paymentMethod, discount, discountType, note);
      }
    });
    setPaid(true);
    if (onRefresh) onRefresh();
  };

  const paymentIcons = { cash: HiOutlineCash, card: HiOutlineCreditCard, jazzcash: HiOutlineReceiptRefund, easypaisa: HiOutlineReceiptRefund };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost text-sm">&larr; Back</button>
          <h1 className="text-xl font-bold text-white">
            Invoice — Table {invoice.table_number}
          </h1>
          {paid && (
            <span className="badge badge-available">Paid</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-neon flex items-center gap-1.5 text-xs">
            <HiOutlinePrinter className="text-sm" /> Print
          </button>
          <button onClick={handleComplete} className="btn-ghost flex items-center gap-1.5 text-xs">
            <HiOutlineSave className="text-sm" /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div ref={receiptRef} className="glass-card p-6 font-mono text-xs">
            <div className="text-center mb-4 border-b border-dashed border-dark-400 pb-4">
              <h2 className="text-lg font-bold text-white text-center">🎱 SNOOKER CLUB</h2>
              <p className="text-gray-500 text-[10px] mt-0.5">Official Invoice</p>
              <p className="text-gray-600 text-[9px] mt-1">Invoice #: INV-{String(invoice.table_number).padStart(2, '0')}-{Date.now()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <p className="text-gray-500 text-[9px] uppercase tracking-wider">Session Details</p>
                <div className="flex justify-between"><span className="text-gray-500">Table</span><span className="text-white font-semibold">#{invoice.table_number}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Match Type</span><span className="text-white">{isTeam ? 'Team (2v2)' : 'Single (1v1)'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Players</span><span className="text-white text-right max-w-[160px]">{isTeam ? `${invoice.player1} & ${invoice.player2} vs ${invoice.player3} & ${invoice.player4}` : `${invoice.player1} vs ${invoice.player2}`}</span></div>
              </div>
              <div className="space-y-1.5">
                <p className="text-gray-500 text-[9px] uppercase tracking-wider">Time</p>
                <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="text-white">{new Date(invoice.start_time).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">End</span><span className="text-white">{new Date(invoice.end_time).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-white font-semibold">{Math.floor((invoice.duration_minutes || 0) / 60)}h {Math.round((invoice.duration_minutes || 0) % 60)}m</span></div>
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
                      const gp1 = g.player1 || invoice.player1;
                      const gp2 = g.player2 || invoice.player2;
                      const gp3 = g.player3 || invoice.player3;
                      const gp4 = g.player4 || invoice.player4;
                      const isTeamGame = !!(gp3 || gp4);
                      const rate = g.rate || perGamePrice || 120;
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
                          <td className="py-1">
                            <span className="text-neon font-semibold">{g.winner}</span>
                          </td>
                          <td className="py-1 text-right text-gray-400">₹{rate}</td>
                          <td className="py-1 text-right text-white font-medium">₹{amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 text-center py-2">No individual game records</p>
              )}
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
                        <td className="py-1 text-right text-gray-400">₹{o.price?.toFixed(2)}</td>
                        <td className="py-1 text-right text-white font-medium">₹{(o.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 text-center py-2">No canteen orders</p>
              )}
            </div>

            <div className="border-t border-dashed border-dark-400 pt-3">
              <div className="space-y-1.5">
                <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-1">Table Charges Breakdown</p>
                {games.map(g => {
                  const isTeamGame = !!(g.player3 || g.player4);
                  const rate = g.rate || perGamePrice || 120;
                  const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
                  return (
                    <div key={g.id} className="flex justify-between text-xs">
                      <span className="text-gray-400">Game #{g.game_number} ({isTeamGame ? 'Team' : 'Single'}, ₹{rate} × {isTeamGame ? '2' : '1'})</span>
                      <span className="text-white font-medium">₹{amount.toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm border-t border-dark-400/30 pt-1 mt-1">
                  <span className="text-gray-400">Total Table Charges</span>
                  <span className="text-white font-medium">₹{(tableBill || 0).toFixed(2)}</span>
                </div>
                {canteenTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Canteen Charges ({orders.length} item{orders.length !== 1 ? 's' : ''})</span>
                    <span className="text-gold font-medium">₹{canteenTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Discount ({discountType === 'percentage' ? `${discount}%` : `₹${discount}`})</span>
                    <span className="text-red-400 font-medium">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-dark-300 pt-1.5 mt-1.5">
                  <div className="flex justify-between text-base">
                    <span className="text-white font-bold">Grand Total</span>
                    <span className="text-neon font-bold">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {paymentMethod && paid && (
                <div className="mt-3 pt-3 border-t border-dark-400/50 text-center">
                  <span className="text-[10px] text-gray-500">Paid via </span>
                  <span className="text-[10px] text-white font-semibold uppercase">{paymentMethod}</span>
                </div>
              )}
              {note && (
                <div className="mt-2 text-[9px] text-gray-600 italic text-center">{note}</div>
              )}
              <div className="mt-4 text-center text-gray-600 text-[9px]">
                <p>Thank you for playing at Snooker Club!</p>
                <p className="mt-0.5">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <HiOutlineCash className="text-neon" />
              Payment
            </h3>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                const isActive = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => !paid && setPaymentMethod(method.id)}
                    disabled={paid}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? `${method.bg} ${method.color} ${method.border} border`
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-300/50 border border-transparent'
                    }`}
                  >
                    <Icon className="text-base" />
                    {method.label}
                    {isActive && <HiOutlineCheckCircle className="ml-auto text-neon" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Discount</h3>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => { setDiscountType('percentage'); setDiscount(0); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  discountType === 'percentage' ? 'bg-neon/10 text-neon border border-neon/20' : 'text-gray-500 border border-transparent'
                }`}
              >%</button>
              <button
                onClick={() => { setDiscountType('fixed'); setDiscount(0); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  discountType === 'fixed' ? 'bg-neon/10 text-neon border border-neon/20' : 'text-gray-500 border border-transparent'
                }`}
              >₹</button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                {discountType === 'percentage' ? '%' : '₹'}
              </span>
              <input
                type="number" min="0" max={discountType === 'percentage' ? 100 : subtotal}
                value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="input-field pl-7"
                disabled={paid}
              />
            </div>
            {discount > 0 && (
              <p className="text-[10px] text-red-400 mt-1">- ₹{discountAmount.toFixed(2)}</p>
            )}
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Note</h3>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a note..."
              className="input-field resize-none h-16 text-xs"
              disabled={paid}
            />
          </div>

          <div className="glass-card p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-red-400">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-dark-300 pt-2">
                <div className="flex justify-between text-base">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-neon font-bold text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {!paid ? (
            <button
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-neon text-white font-semibold text-sm hover:bg-neon-600 shadow-neon transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <HiOutlineCheckCircle className="text-lg" />
              Complete Payment — ₹{grandTotal.toFixed(2)}
            </button>
          ) : (
            <div className="glass-card p-4 text-center border-neon/30">
              <HiOutlineCheckCircle className="text-2xl text-neon mx-auto mb-1" />
              <p className="text-sm font-semibold text-neon">Payment Completed</p>
              <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{paymentMethod}</p>
              <button onClick={handlePrint} className="btn-neon w-full mt-3 text-xs">Print Receipt</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function generateInvoiceHtml(session, orders, games, perGamePrice, paymentMethod, discountAmount, grandTotal, note) {
  const isTeam = session?.match_type === 'team';
  const gameCount = session?.game_count || 0;
  const tableBill = session?.table_bill || 0;
  const canteenTotal = orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;
  const subtotal = session?.total_bill !== undefined ? session.total_bill : tableBill + canteenTotal;

  let gamesHtml = '';
  if (games?.length > 0) {
    gamesHtml = games.map(g => {
      const isTeamGame = !!(g.player3 || g.player4);
      const rate = g.rate || perGamePrice || 120;
      const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
      return `
      <tr>
        <td style="padding:2px 4px">#${g.game_number}</td>
        <td style="padding:2px 4px">${isTeamGame ? 'Team' : 'Single'}</td>
        <td style="padding:2px 4px;text-align:right">${g.winner}</td>
        <td style="padding:2px 4px;text-align:right">₹${rate}</td>
        <td style="padding:2px 4px;text-align:right;font-weight:bold">₹${amount.toFixed(2)}</td>
      </tr>`;
    }).join('');
  }
  let ordersHtml = '';
  if (orders?.length > 0) {
    ordersHtml = orders.map(o => `
      <tr>
        <td style="padding:2px 4px">${o.item_name} x${o.quantity}</td>
        <td style="padding:2px 4px;text-align:right">₹${o.total?.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  const paymentLabels = { cash: 'Cash', card: 'Card', jazzcash: 'JazzCash', easypaisa: 'EasyPaisa' };

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'Courier New', monospace; font-size: 11px; padding: 24px; color: #000; max-width: 420px; margin: 0 auto; }
  h1 { text-align: center; font-size: 18px; margin: 0 0 2px; letter-spacing: 1px; }
  .subtitle { text-align: center; font-size: 9px; color: #666; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 2px; }
  .invoice-no { text-align: center; font-size: 9px; color: #999; margin: 0 0 8px; }
  .divider { border-top: 1px dashed #333; margin: 8px 0; }
  .divider-double { border-top: 3px double #333; margin: 12px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 8px; color: #666; text-transform: uppercase; padding: 4px; border-bottom: 1px solid #ccc; }
  td { padding: 3px 4px; font-size: 10px; }
  .section-title { font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 4px; font-weight: bold; }
  .total-row td { padding: 4px; font-weight: bold; }
  .grand-total { font-size: 16px; font-weight: bold; }
  .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #888; }
  .paid-stamp { text-align: center; margin: 8px 0; padding: 4px; border: 2px solid #22C55E; color: #22C55E; font-weight: bold; font-size: 12px; letter-spacing: 3px; display: inline-block; }
</style>
</head><body>
  <h1>🎱 SNOOKER CLUB</h1>
  <p class="subtitle">Official Invoice</p>
  <p class="invoice-no">Invoice #: INV-${String(session?.table_number).padStart(2, '0')}-${Date.now()}</p>
  <div class="divider"></div>
  <table>
    <tr><td style="color:#666">Table</td><td style="text-align:right;font-weight:bold">#${session?.table_number}</td></tr>
    <tr><td style="color:#666">Match</td><td style="text-align:right">${isTeam ? 'Team (2v2)' : 'Single (1v1)'}</td></tr>
    <tr><td style="color:#666">Players</td><td style="text-align:right">${isTeam ? `${session?.player1} & ${session?.player2} vs ${session?.player3} & ${session?.player4}` : `${session?.player1} vs ${session?.player2}`}</td></tr>
    <tr><td style="color:#666">Date</td><td style="text-align:right">${new Date(session?.start_time).toLocaleDateString()}</td></tr>
    <tr><td style="color:#666">Start Time</td><td style="text-align:right">${new Date(session?.start_time).toLocaleTimeString()}</td></tr>
    <tr><td style="color:#666">End Time</td><td style="text-align:right">${new Date(session?.end_time).toLocaleTimeString()}</td></tr>
    <tr><td style="color:#666">Duration</td><td style="text-align:right;font-weight:bold">${Math.floor((session?.duration_minutes || 0) / 60)}h ${Math.round((session?.duration_minutes || 0) % 60)}m</td></tr>
  </table>
  ${gamesHtml ? `
  <div class="divider"></div>
  <p class="section-title">Game History</p>
  <table>
    <tr><th style="text-align:left">#</th><th style="text-align:left">Type</th><th style="text-align:left">Winner</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr>
    ${gamesHtml}
  </table>` : ''}
  ${ordersHtml ? `
  <div class="divider"></div>
  <p class="section-title">Canteen Orders</p>
  <table>${ordersHtml}</table>` : ''}
  <div class="divider-double"></div>
  ${games?.length > 0 ? games.map(g => {
    const isTeamGame = !!(g.player3 || g.player4);
    const rate = g.rate || perGamePrice || 120;
    const amount = g.amount || (rate * (isTeamGame ? 2 : 1));
    return `<tr><td style="color:#888;font-size:9px">Game #${g.game_number} (${isTeamGame ? 'Team' : 'Single'}, ₹${rate} × ${isTeamGame ? '2' : '1'})</td><td style="text-align:right;font-size:9px">₹${amount.toFixed(2)}</td></tr>`;
  }).join('') : ''}
  <tr><td style="color:#666;font-weight:bold">Total Table Charges</td><td style="text-align:right;font-weight:bold">₹${(tableBill || 0).toFixed(2)}</td></tr>
  ${canteenTotal > 0 ? `<tr><td style="color:#666">Canteen Charges</td><td style="text-align:right">₹${canteenTotal.toFixed(2)}</td></tr>` : ''}
    <tr><td style="color:#666">Subtotal</td><td style="text-align:right">₹${subtotal.toFixed(2)}</td></tr>
    ${discountAmount > 0 ? `<tr><td style="color:#EF4444">Discount</td><td style="text-align:right;color:#EF4444">-₹${discountAmount.toFixed(2)}</td></tr>` : ''}
    <tr class="total-row"><td style="font-size:14px">GRAND TOTAL</td><td style="text-align:right;font-size:14px;color:#22C55E">₹${grandTotal.toFixed(2)}</td></tr>
  </table>
  ${paymentMethod ? `<div style="text-align:center;margin:8px 0;font-size:9px;color:#666">Payment Method: <strong>${(paymentLabels[paymentMethod] || paymentMethod).toUpperCase()}</strong></div>` : ''}
  <div style="text-align:center;margin:8px 0"><span class="paid-stamp">PAID</span></div>
  ${note ? `<div style="text-align:center;font-size:8px;color:#999;font-style:italic;margin:4px 0">${note}</div>` : ''}
  <div class="divider"></div>
  <p class="footer">Thank you for playing at Snooker Club!</p>
  <p class="footer" style="font-size:8px">${new Date().toLocaleString()}</p>
</body></html>`;
}
