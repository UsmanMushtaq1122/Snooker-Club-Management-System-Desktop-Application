import React, { useState, useEffect, useCallback, useRef } from 'react';
import TableCard from './TableCard';
import StartGameModal from './StartGameModal';
import StartNextGameModal from './StartNextGameModal';
import CanteenModal from './CanteenModal';
import BillReceipt from './BillReceipt';
import RecordGameModal from './RecordGameModal';

export default function Dashboard({ onRefresh }) {
  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [startGameTable, setStartGameTable] = useState(null);
  const [canteenSession, setCanteenSession] = useState(null);
  const [viewBillSession, setViewBillSession] = useState(null);
  const [showEndGame, setShowEndGame] = useState(null);
  const [recordGameSession, setRecordGameSession] = useState(null);
  const [showStartNextGame, setShowStartNextGame] = useState(null);
  const intervalRef = useRef(null);

  const loadData = useCallback(() => {
    Promise.all([
      window.api.getTables(),
      window.api.getRunningSessions(),
    ]).then(([tablesData, sessionsData]) => {
      setTables(tablesData || []);
      setSessions(sessionsData || []);
    }).catch(err => {
      console.error('loadData error:', err);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const getSessionForTable = useCallback((tableNumber) => {
    return sessions.find(s => s.table_number === tableNumber) || null;
  }, [sessions]);

  const handleStartGame = (tableNumber) => {
    setStartGameTable(tableNumber);
  };

  const handleEndGame = (tableNumber) => {
    const session = getSessionForTable(tableNumber);
    if (session) {
      setShowEndGame(session);
    }
  };

  const handleEndCurrentGame = (tableNumber) => {
    const session = getSessionForTable(tableNumber);
    if (session) {
      setRecordGameSession(session);
    }
  };

  const handleStartNextGame = (tableNumber) => {
    const session = getSessionForTable(tableNumber);
    if (session) {
      window.api.getSessionGames(session.id).then(games => {
        const lastGame = games && games.length > 0 ? games[games.length - 1] : null;
        setShowStartNextGame({ session, lastGame });
      });
    }
  };

  const handleNextGameStarted = () => {
    setShowStartNextGame(null);
    loadData();
  };

  const handleAddCanteen = (tableNumber) => {
    const session = getSessionForTable(tableNumber);
    if (session) {
      setCanteenSession(session);
    }
  };

  const handleViewBill = (tableNumber) => {
    window.api.getLatestSessionByTable(tableNumber).then(session => {
      if (!session) return;
      window.api.getCanteenOrders(session.id).then(orders => {
        setViewBillSession({ session, orders });
      });
    });
  };

  const handleGameRecorded = () => {
    setRecordGameSession(null);
    loadData();
  };

  const handleGameStarted = () => {
    setStartGameTable(null);
    loadData();
    if (onRefresh) onRefresh();
  };

  const handleGameEnded = (result) => {
    console.log('endGame result:', JSON.stringify(result));
    setShowEndGame(null);
    window.api.getCanteenOrders(result.id).then(orders => {
      console.log('canteen orders:', orders);
      setViewBillSession({ session: result, orders: orders || [] });
    }).catch(err => {
      console.error('getCanteenOrders failed:', err);
      setViewBillSession({ session: result, orders: [] });
    });
    loadData();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Table Overview</h2>
        <button className="btn btn-primary btn-sm" onClick={loadData}>
          ↻ Refresh
        </button>
      </div>
      <div className="table-grid">
        {tables.map(table => (
           <TableCard
            key={table.table_number}
            table={table}
            session={getSessionForTable(table.table_number)}
            now={now}
            onStartGame={() => handleStartGame(table.table_number)}
            onEndGame={() => handleEndGame(table.table_number)}
            onEndCurrentGame={() => handleEndCurrentGame(table.table_number)}
            onStartNextGame={() => handleStartNextGame(table.table_number)}
            onAddCanteen={() => handleAddCanteen(table.table_number)}
            onViewBill={() => handleViewBill(table.table_number)}
          />
        ))}
      </div>

      {startGameTable && (
        <StartGameModal
          tableNumber={startGameTable}
          onStart={handleGameStarted}
          onClose={() => setStartGameTable(null)}
        />
      )}

      {showEndGame && (
        <EndGameModal
          session={showEndGame}
          onEnd={handleGameEnded}
          onClose={() => setShowEndGame(null)}
        />
      )}

      {recordGameSession && (
        <RecordGameModal
          session={recordGameSession}
          onRecord={handleGameRecorded}
          onClose={() => setRecordGameSession(null)}
        />
      )}

      {showStartNextGame && (
        <StartNextGameModal
          session={showStartNextGame.session}
          lastGame={showStartNextGame.lastGame}
          onStart={handleNextGameStarted}
          onClose={() => setShowStartNextGame(null)}
        />
      )}

      {canteenSession && (
        <CanteenModal
          session={canteenSession}
          onAdd={() => { loadData(); if (onRefresh) onRefresh(); }}
          onClose={() => setCanteenSession(null)}
        />
      )}

      {viewBillSession && (
        <BillReceipt
          data={viewBillSession}
          onClose={() => setViewBillSession(null)}
        />
      )}
    </div>
  );
}

function EndGameModal({ session, onEnd, onClose }) {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [bill, setBill] = useState(null);
  const isTeam = session.match_type === 'team';

  useEffect(() => {
    window.api.getSessionGames(session.id).then(setGames);
  }, [session.id]);

  const handleSubmit = () => {
    setError('');
    window.api.endGame(session.id).then(result => {
      window.api.getCanteenOrders(result.id).then(orders => {
        setBill({ ...result, orders: orders || [] });
      }).catch(() => {
        setBill({ ...result, orders: [] });
      });
    }).catch(err => {
      setError(err.message || String(err));
    });
  };

  const handleClose = () => {
    if (bill) onEnd(bill);
    else onClose();
  };

  const handlePrint = () => {
    const html = generateReceiptHtml(bill, bill.orders, bill.games, bill.per_game_price);
    window.api.printBill(html);
  };

  if (bill) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal modal-receipt" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Bill Receipt - Table {bill.table_number}</h2>
            <button className="modal-close" onClick={handleClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="receipt">
              <div className="receipt-header">
                <h2>SNOOKER CLUB</h2>
                <p>Bill Receipt</p>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-info">
                <div className="receipt-row">
                  <span>Table</span>
                  <span>#{bill.table_number}</span>
                </div>
                <div className="receipt-row">
                  <span>Match</span>
                  <span>{bill.match_type === 'team' ? 'Team (2v2)' : 'Single (1v1)'}</span>
                </div>
                <div className="receipt-row">
                  <span>Players</span>
                  <span>
                    {bill.match_type === 'team'
                      ? `${bill.player1} & ${bill.player2} vs ${bill.player3} & ${bill.player4}`
                      : `${bill.player1} vs ${bill.player2}`}
                  </span>
                </div>
                <div className="receipt-row">
                  <span>Date</span>
                  <span>{new Date(bill.start_time).toLocaleDateString()}</span>
                </div>
                <div className="receipt-row">
                  <span>Start</span>
                  <span>{new Date(bill.start_time).toLocaleTimeString()}</span>
                </div>
                <div className="receipt-row">
                  <span>End</span>
                  <span>{new Date(bill.end_time).toLocaleTimeString()}</span>
                </div>
                <div className="receipt-row">
                  <span>Duration</span>
                  <span>{Math.floor(bill.duration_minutes / 60)}h {Math.round(bill.duration_minutes % 60)}m</span>
                </div>
              </div>
              {bill.games && bill.games.length > 0 && (
                <>
                  <div className="receipt-divider"></div>
                  <div className="receipt-section">
                    <h3>Games ({bill.games.length})</h3>
                    {bill.games.map(g => (
                      <div className="receipt-row" key={g.id}>
                        <span>Game #{g.game_number}</span>
                        <span><span style={{ color: 'var(--accent)' }}>{g.winner}</span> beat <span style={{ color: 'var(--danger)' }}>{g.loser}</span></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="receipt-divider"></div>
              <div className="receipt-section">
                <h3>Table Charges</h3>
                <div className="receipt-row">
                  <span>Games Played</span>
                  <span>{bill.game_count}</span>
                </div>
                <div className="receipt-row">
                  <span>Per Game {bill.match_type === 'team' ? '(×2 Team)' : ''}</span>
                  <span>PKR{bill.per_game_price}</span>
                </div>
                <div className="receipt-row receipt-total">
                  <span>Table Bill ({bill.game_count} × PKR{bill.per_game_price})</span>
                  <span>PKR{bill.table_bill.toFixed(2)}</span>
                </div>
              </div>
              {bill.orders && bill.orders.length > 0 && (
                <>
                  <div className="receipt-divider"></div>
                  <div className="receipt-section">
                    <h3>Canteen Orders</h3>
                    {bill.orders.map((order, i) => (
                      <div className="receipt-row" key={i}>
                        <span>{order.item_name} x{order.quantity}</span>
                        <span>PKR{order.total.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="receipt-row receipt-total">
                      <span>Canteen Bill</span>
                      <span>PKR{bill.canteen_bill.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="receipt-divider"></div>
              <div className="receipt-grand-total">
                <div className="receipt-row">
                  <span style={{ fontSize: 18, fontWeight: 800 }}>TOTAL</span>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>PKR{bill.total_bill.toFixed(2)}</span>
                </div>
              </div>
              <div className="receipt-footer">
                <p>Thank you for playing!</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>Close</button>
            <button className="btn btn-primary" onClick={handlePrint}>🖨 Print Receipt</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>End Session - Table {session.table_number}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>{isTeam ? 'Teams' : 'Players'}</label>
            <div style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>
              {isTeam ? (
                <div className="team-display">
                  <div className="team-side">
                    <div className="team-label">Team A</div>
                    <div>{session.player1} & {session.player2}</div>
                  </div>
                  <span className="vs">vs</span>
                  <div className="team-side">
                    <div className="team-label">Team B</div>
                    <div>{session.player3} & {session.player4}</div>
                  </div>
                </div>
              ) : (
                <span>{session.player1} vs {session.player2}</span>
              )}
            </div>
          </div>

          {games.length > 0 && (
            <div className="form-group">
              <label>Games Played ({games.length})</label>
              <div style={{ marginTop: 8 }}>
                <table className="endgame-games-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Winner</th>
                      <th>Loser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(g => (
                      <tr key={g.id}>
                        <td>{g.game_number}</td>
                        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{g.winner}</td>
                        <td style={{ color: 'var(--danger)' }}>{g.loser}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {games.length === 0 && (
            <div className="form-group">
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                No games recorded yet. Use the + Game button to record games.
              </p>
            </div>
          )}
        </div>
        {error && (
          <div className="form-group">
            <p style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>{error}</p>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            End Session & Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}



