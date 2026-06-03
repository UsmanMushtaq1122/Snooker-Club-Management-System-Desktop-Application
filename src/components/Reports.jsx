import React, { useState, useEffect } from 'react';

export default function Reports() {
  const [tab, setTab] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [tableUsage, setTableUsage] = useState([]);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [sessionGames, setSessionGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyTableFilter, setDailyTableFilter] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceTableFilter, setInvoiceTableFilter] = useState(null);

  useEffect(() => {
    loadDailyReport();
    loadTableUsage();
    loadPlayerHistory();
    loadMatchHistory();
    loadInvoices();
  }, []);

  useEffect(() => {
    if (tab === 'daily') loadDailyReport();
    if (tab === 'tables') loadTableUsage();
    if (tab === 'players') loadPlayerHistory();
    if (tab === 'matches') loadMatchHistory();
    if (tab === 'invoices') loadInvoices();
  }, [tab]);

  const loadDailyReport = () => {
    window.api.getDailyReport(selectedDate, dailyTableFilter).then(setDailyReport);
  };

  const loadTableUsage = () => {
    window.api.getTableUsageReport().then(setTableUsage);
  };

  const loadPlayerHistory = () => {
    window.api.getPlayerHistory().then(setPlayerHistory);
  };

  const loadMatchHistory = () => {
    window.api.getAllSessions().then(data => {
      setMatchHistory(data.filter(s => s.status === 'completed'));
    });
  };

  const loadInvoices = () => {
    window.api.getInvoicesByDate(invoiceDate, invoiceTableFilter).then(setInvoices);
  };

  const toggleSessionGames = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSessionGames([]);
    } else {
      setExpandedSession(sessionId);
      window.api.getSessionGames(sessionId).then(setSessionGames);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    window.api.getDailyReport(date, dailyTableFilter).then(setDailyReport);
  };

  const handleDailyTableFilter = (table) => {
    setDailyTableFilter(table);
    window.api.getDailyReport(selectedDate, table).then(setDailyReport);
  };

  const handleInvoiceDateChange = (date) => {
    setInvoiceDate(date);
    window.api.getInvoicesByDate(date, invoiceTableFilter).then(setInvoices);
  };

  const handleInvoiceTableFilter = (table) => {
    setInvoiceTableFilter(table);
    window.api.getInvoicesByDate(invoiceDate, table).then(setInvoices);
  };

  const tableOptions = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>Reports</h2>
      </div>

      <div className="reports-tabs">
        <button
          className={`report-tab ${tab === 'daily' ? 'active' : ''}`}
          onClick={() => setTab('daily')}
        >Daily Report</button>
        <button
          className={`report-tab ${tab === 'tables' ? 'active' : ''}`}
          onClick={() => setTab('tables')}
        >Table Usage</button>
        <button
          className={`report-tab ${tab === 'players' ? 'active' : ''}`}
          onClick={() => setTab('players')}
        >Player History</button>
        <button
          className={`report-tab ${tab === 'matches' ? 'active' : ''}`}
          onClick={() => setTab('matches')}
        >Match History</button>
        <button
          className={`report-tab ${tab === 'invoices' ? 'active' : ''}`}
          onClick={() => setTab('invoices')}
        >Invoices</button>
      </div>

      <div className="reports-content">
        {tab === 'daily' && (
          <div className="report-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => handleDateChange(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label>Table:</label>
                <select
                  value={dailyTableFilter ?? ''}
                  onChange={e => handleDailyTableFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="date-input"
                >
                  <option value="">All Tables</option>
                  {tableOptions.filter(t => t !== null).map(n => (
                    <option key={n} value={n}>Table {n}</option>
                  ))}
                </select>
              </div>
            </div>
            {dailyReport && (
              <div className="report-cards">
                <div className="stat-card">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value accent">PKR{dailyReport.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Table Revenue</div>
                  <div className="stat-value info">PKR{dailyReport.tableRevenue.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Canteen Revenue</div>
                  <div className="stat-value warning">PKR{dailyReport.canteenRevenue.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Sessions</div>
                  <div className="stat-value">{dailyReport.sessions.length}</div>
                </div>
              </div>
            )}
            {dailyReport && dailyReport.canteenOrders && dailyReport.canteenOrders.length > 0 && (
              <div className="report-section">
                <h3>Canteen Sales Breakdown</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReport.canteenOrders.map((item, i) => (
                      <tr key={i}>
                        <td>{item.item_name}</td>
                        <td>{item.quantity}</td>
                        <td>PKR{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {dailyReport && dailyReport.sessions.length > 0 && (
              <div className="report-section">
                <h3>{dailyTableFilter ? `Table ${dailyTableFilter} Sessions` : 'All Sessions'}</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Table</th>
                      <th>Players</th>
                      <th>Duration</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReport.sessions.map(s => (
                      <tr key={s.id}>
                        <td>#{s.table_number}</td>
                      <td>{s.match_type === 'team' ? `${s.player1} & ${s.player2} vs ${s.player3} & ${s.player4}` : `${s.player1} vs ${s.player2}`}</td>
                        <td>{Math.floor(s.duration_minutes / 60)}h {Math.round(s.duration_minutes % 60)}m</td>
                        <td>PKR{s.total_bill.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'tables' && (
          <div className="report-panel">
            <div className="report-cards">
              {tableUsage.map(t => (
                <div key={t.table_number} className="stat-card">
                  <div className="stat-label">Table {t.table_number}</div>
                  <div className="stat-value">{t.total_games || 0} games</div>
                  <div className="stat-sub">{Math.floor((t.total_minutes || 0) / 60)}h {Math.round((t.total_minutes || 0) % 60)}m</div>
                  <div className="stat-sub accent">PKR{(t.total_revenue || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'players' && (
          <div className="report-panel">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Games</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {playerHistory.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.player}</td>
                    <td>{p.games_played}</td>
                    <td style={{ color: 'var(--accent)' }}>{p.wins}</td>
                    <td style={{ color: 'var(--danger)' }}>{p.losses}</td>
                    <td>
                      <div className="win-bar-container">
                        <div className="win-bar" style={{ width: `${p.win_rate}%` }}></div>
                        <span>{p.win_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {playerHistory.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'matches' && (
          <div className="report-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Filter by Table:</label>
                <select
                  value={selectedTable || ''}
                  onChange={e => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
                  className="date-input"
                >
                  <option value="">All Tables</option>
                  {tableOptions.filter(t => t !== null).map(n => (
                    <option key={n} value={n}>Table {n}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Players</th>
                  <th>Duration</th>
                  <th>Games</th>
                  <th>Bill</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {matchHistory
                  .filter(s => !selectedTable || s.table_number === selectedTable)
                  .slice(0, 50)
                  .map(s => (
                    <React.Fragment key={s.id}>
                      <tr
                        onClick={() => toggleSessionGames(s.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>#{s.table_number}</td>
                        <td>{s.match_type === 'team' ? `${s.player1} & ${s.player2} vs ${s.player3} & ${s.player4}` : `${s.player1} vs ${s.player2}`}</td>
                        <td>{Math.floor(s.duration_minutes / 60)}h {Math.round(s.duration_minutes % 60)}m</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{s.game_count || 1} game{s.game_count !== 1 ? 's' : ''}</td>
                        <td>PKR{s.total_bill.toFixed(2)}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(s.start_time).toLocaleDateString()}
                        </td>
                      </tr>
                      {expandedSession === s.id && (
                        <tr>
                          <td colSpan={6} style={{ padding: 0 }}>
                            <div className="expanded-games">
                              <table className="report-table" style={{ margin: 0, border: 'none' }}>
                                <thead>
                                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                                    <th style={{ padding: '4px 12px' }}>Game</th>
                                    <th style={{ padding: '4px 12px' }}>Players</th>
                                    <th style={{ padding: '4px 12px' }}>Winner</th>
                                    <th style={{ padding: '4px 12px' }}>Loser</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sessionGames.map(g => {
                                    const isGameTeam = g.player3 && g.player4;
                                    return (
                                      <tr key={g.id}>
                                        <td style={{ padding: '4px 12px' }}>#{g.game_number}</td>
                                        <td style={{ padding: '4px 12px', fontSize: 12 }}>
                                          {isGameTeam
                                            ? `${g.player1 || s.player1} & ${g.player2 || s.player2} vs ${g.player3 || s.player3} & ${g.player4 || s.player4}`
                                            : `${g.player1 || s.player1} vs ${g.player2 || s.player2}`}
                                        </td>
                                        <td style={{ padding: '4px 12px', color: 'var(--accent)' }}>{g.winner}</td>
                                        <td style={{ padding: '4px 12px', color: 'var(--danger)' }}>{g.loser}</td>
                                      </tr>
                                    );
                                  })}
                                  {sessionGames.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No individual game records</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                {matchHistory.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No matches recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'invoices' && (
          <div className="report-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={e => handleInvoiceDateChange(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="filter-group">
                <label>Table:</label>
                <select
                  value={invoiceTableFilter ?? ''}
                  onChange={e => handleInvoiceTableFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="date-input"
                >
                  <option value="">All Tables</option>
                  {tableOptions.filter(t => t !== null).map(n => (
                    <option key={n} value={n}>Table {n}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Table</th>
                  <th>Players</th>
                  <th>Games</th>
                  <th>Rate</th>
                  <th>Table Bill</th>
                  <th>Canteen</th>
                  <th>Total</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>{inv.invoice_number}</td>
                    <td>#{inv.table_number}</td>
                    <td style={{ fontSize: 12 }}>
                      {inv.match_type === 'team'
                        ? `${inv.player1} & ${inv.player2} vs ${inv.player3} & ${inv.player4}`
                        : `${inv.player1} vs ${inv.player2}`}
                    </td>
                    <td>{inv.game_count}</td>
                    <td>PKR{inv.per_game_price}</td>
                    <td>PKR{inv.table_bill.toFixed(2)}</td>
                    <td>PKR{inv.canteen_bill.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>PKR{inv.total_bill.toFixed(2)}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(inv.generated_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No invoices for this date</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



