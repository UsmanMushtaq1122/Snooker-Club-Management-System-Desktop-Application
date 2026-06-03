const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let db = null;
let SQL = null;

function getDbPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'snooker-pos.db');
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = getDbPath();
  fs.writeFileSync(dbPath, buffer);
}

function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH') || sql.trim().toUpperCase().startsWith('PRAGMA')) {
    const results = [];
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } else {
    stmt.bind(params);
    stmt.step();
    stmt.free();
    saveDb();
    return { changes: db.getRowsModified() };
  }
}

function get(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : undefined;
}

function run(sql, params = []) {
  return query(sql, params);
}

function exec(sql) {
  db.exec(sql);
  saveDb();
}

async function initDatabase() {
  SQL = await initSqlJs();
  const dbPath = getDbPath();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      table_number INTEGER NOT NULL,
      match_type TEXT NOT NULL DEFAULT 'single',
      player1 TEXT,
      player2 TEXT,
      player3 TEXT,
      player4 TEXT,
      game_count INTEGER DEFAULT 0,
      per_game_price REAL DEFAULT 0,
      table_bill REAL DEFAULT 0,
      canteen_bill REAL DEFAULT 0,
      total_bill REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'cash',
      FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    );
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      price_per_hour REAL NOT NULL DEFAULT 120
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL,
      player1 TEXT NOT NULL,
      player2 TEXT NOT NULL,
      player3 TEXT,
      player4 TEXT,
      match_type TEXT NOT NULL DEFAULT 'single',
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_minutes REAL,
      winner TEXT,
      loser TEXT,
      total_bill REAL DEFAULT 0,
      table_bill REAL DEFAULT 0,
      canteen_bill REAL DEFAULT 0,
      price_per_hour REAL DEFAULT 120,
      status TEXT NOT NULL DEFAULT 'running',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS canteen_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      game_number INTEGER NOT NULL,
      match_type TEXT DEFAULT 'single',
      rate REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      winner TEXT,
      loser TEXT,
      player1 TEXT,
      player2 TEXT,
      player3 TEXT,
      player4 TEXT,
      start_time TEXT,
      end_time TEXT,
      duration_seconds REAL,
      status TEXT NOT NULL DEFAULT 'playing',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    );
  `);

  const invCols = query("PRAGMA table_info(invoices)").map(c => c.name);
  if (!invCols.includes('payment_method')) exec("ALTER TABLE invoices ADD COLUMN payment_method TEXT DEFAULT 'cash'");
  if (!invCols.includes('discount')) exec("ALTER TABLE invoices ADD COLUMN discount REAL DEFAULT 0");
  if (!invCols.includes('discount_type')) exec("ALTER TABLE invoices ADD COLUMN discount_type TEXT DEFAULT 'percentage'");
  if (!invCols.includes('notes')) exec("ALTER TABLE invoices ADD COLUMN notes TEXT DEFAULT ''");

  const tableCols = query("PRAGMA table_info(tables)").map(c => c.name);
  if (!tableCols.includes('price_per_hour')) {
    exec("ALTER TABLE tables ADD COLUMN price_per_hour REAL NOT NULL DEFAULT 120");
  }
  const gsCols = query("PRAGMA table_info(game_sessions)").map(c => c.name);
  if (!gsCols.includes('price_per_hour')) {
    exec("ALTER TABLE game_sessions ADD COLUMN price_per_hour REAL DEFAULT 120");
  }
  if (!gsCols.includes('match_type')) {
    exec("ALTER TABLE game_sessions ADD COLUMN match_type TEXT NOT NULL DEFAULT 'single'");
  }
  if (!gsCols.includes('player3')) {
    exec("ALTER TABLE game_sessions ADD COLUMN player3 TEXT");
  }
  if (!gsCols.includes('player4')) {
    exec("ALTER TABLE game_sessions ADD COLUMN player4 TEXT");
  }
  if (!gsCols.includes('game_count')) {
    exec("ALTER TABLE game_sessions ADD COLUMN game_count INTEGER DEFAULT 0");
  }
  let sgCols = query("PRAGMA table_info(session_games)").map(c => c.name);
  if (sgCols.length === 0) {
    exec(`
      CREATE TABLE IF NOT EXISTS session_games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        game_number INTEGER NOT NULL,
        match_type TEXT DEFAULT 'single',
        rate REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        winner TEXT,
        loser TEXT,
        player1 TEXT,
        player2 TEXT,
        player3 TEXT,
        player4 TEXT,
        start_time TEXT,
        end_time TEXT,
        duration_seconds REAL,
        status TEXT NOT NULL DEFAULT 'playing',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
      )
    `);
  } else {
    if (!sgCols.includes('start_time')) exec("ALTER TABLE session_games ADD COLUMN start_time TEXT");
    if (!sgCols.includes('end_time')) exec("ALTER TABLE session_games ADD COLUMN end_time TEXT");
    if (!sgCols.includes('duration_seconds')) exec("ALTER TABLE session_games ADD COLUMN duration_seconds REAL");
    if (!sgCols.includes('player1')) exec("ALTER TABLE session_games ADD COLUMN player1 TEXT");
    if (!sgCols.includes('player2')) exec("ALTER TABLE session_games ADD COLUMN player2 TEXT");
    if (!sgCols.includes('player3')) exec("ALTER TABLE session_games ADD COLUMN player3 TEXT");
    if (!sgCols.includes('player4')) exec("ALTER TABLE session_games ADD COLUMN player4 TEXT");
    if (!sgCols.includes('status')) {
      exec("ALTER TABLE session_games ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'");
      exec("UPDATE session_games SET status = 'completed' WHERE status IS NULL");
    }
    const winnerCol = query("PRAGMA table_info(session_games)").find(c => c.name === 'winner');
    if (winnerCol && winnerCol.notnull) {
      exec("ALTER TABLE session_games ADD COLUMN start_time TEXT");
      exec("ALTER TABLE session_games ADD COLUMN end_time TEXT");
      exec("ALTER TABLE session_games ADD COLUMN duration_seconds REAL");
      exec("ALTER TABLE session_games ADD COLUMN player1 TEXT");
      exec("ALTER TABLE session_games ADD COLUMN player2 TEXT");
      exec("ALTER TABLE session_games ADD COLUMN player3 TEXT");
      exec("ALTER TABLE session_games ADD COLUMN player4 TEXT");
      if (!sgCols.includes('status')) {
        exec("ALTER TABLE session_games ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'");
      }
      exec(`
        CREATE TABLE session_games_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          game_number INTEGER NOT NULL,
          winner TEXT,
          loser TEXT,
          player1 TEXT,
          player2 TEXT,
          player3 TEXT,
          player4 TEXT,
          start_time TEXT,
          end_time TEXT,
          duration_seconds REAL,
          status TEXT NOT NULL DEFAULT 'playing',
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
          FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
        )
      `);
      exec(`INSERT INTO session_games_new
        (id, session_id, game_number, winner, loser, player1, player2, player3, player4,
         start_time, end_time, duration_seconds, status, created_at)
        SELECT sg.id, sg.session_id, sg.game_number, sg.winner, sg.loser,
          gs.player1, gs.player2, gs.player3, gs.player4,
          sg.start_time, sg.end_time, sg.duration_seconds,
          COALESCE(sg.status, 'completed'), sg.created_at
        FROM session_games sg
        JOIN game_sessions gs ON gs.id = sg.session_id`);
      exec("DROP TABLE session_games");
      exec("ALTER TABLE session_games_new RENAME TO session_games");
    } else if (!sgCols.includes('player1')) {
      exec(`UPDATE session_games SET
        player1 = (SELECT player1 FROM game_sessions WHERE id = session_id),
        player2 = (SELECT player2 FROM game_sessions WHERE id = session_id),
        player3 = (SELECT player3 FROM game_sessions WHERE id = session_id),
        player4 = (SELECT player4 FROM game_sessions WHERE id = session_id)
        WHERE player1 IS NULL`);
    }
  }

  sgCols = query("PRAGMA table_info(session_games)").map(c => c.name);
  if (!sgCols.includes('match_type')) {
    exec("ALTER TABLE session_games ADD COLUMN match_type TEXT DEFAULT 'single'");
  }
  if (!sgCols.includes('rate')) {
    exec("ALTER TABLE session_games ADD COLUMN rate REAL DEFAULT 0");
  }
  if (!sgCols.includes('amount')) {
    exec("ALTER TABLE session_games ADD COLUMN amount REAL DEFAULT 0");
  }

  const tableCount = get('SELECT COUNT(*) as count FROM tables');
  if (!tableCount || tableCount.count === 0) {
    const prices = { 1: 200, 2: 150, 3: 150 };
    const insert = db.prepare('INSERT INTO tables (table_number, status, price_per_hour) VALUES (?, ?, ?)');
    for (let i = 1; i <= 10; i++) {
      insert.bind([i, 'available', prices[i] || 120]);
      insert.step();
      insert.reset();
    }
    insert.free();
    saveDb();
  } else {
    run("UPDATE tables SET price_per_hour = 200 WHERE table_number = 1 AND price_per_hour IS NULL");
    run("UPDATE tables SET price_per_hour = 150 WHERE table_number = 2 AND price_per_hour IS NULL");
    run("UPDATE tables SET price_per_hour = 150 WHERE table_number = 3 AND price_per_hour IS NULL");
    run("UPDATE tables SET price_per_hour = 120 WHERE table_number >= 4 AND price_per_hour IS NULL");
  }

  const playerCount = get('SELECT COUNT(*) as count FROM players');
  if (playerCount && playerCount.count === 0) {
    const names = query(`
      SELECT DISTINCT name FROM (
        SELECT player1 as name FROM game_sessions WHERE player1 IS NOT NULL AND player1 != ''
        UNION SELECT player2 FROM game_sessions WHERE player2 IS NOT NULL AND player2 != ''
        UNION SELECT player3 FROM game_sessions WHERE player3 IS NOT NULL AND player3 != ''
        UNION SELECT player4 FROM game_sessions WHERE player4 IS NOT NULL AND player4 != ''
        UNION SELECT player1 FROM session_games WHERE player1 IS NOT NULL AND player1 != ''
        UNION SELECT player2 FROM session_games WHERE player2 IS NOT NULL AND player2 != ''
        UNION SELECT player3 FROM session_games WHERE player3 IS NOT NULL AND player3 != ''
        UNION SELECT player4 FROM session_games WHERE player4 IS NOT NULL AND player4 != ''
        UNION SELECT winner FROM session_games WHERE winner IS NOT NULL AND winner != ''
        UNION SELECT loser FROM session_games WHERE loser IS NOT NULL AND loser != ''
      )
    `);
    names.forEach(n => {
      run('INSERT OR IGNORE INTO players (name) VALUES (?)', [n.name]);
    });
  }

  const theme = get("SELECT value FROM settings WHERE key = 'theme'");
  if (!theme) {
    run("INSERT INTO settings (key, value) VALUES ('theme', 'dark')");
  }
}

function getSettings() {
  const rows = query('SELECT key, value FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  return settings;
}

function saveSetting(key, value) {
  run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
}

function getTables() {
  return query('SELECT * FROM tables ORDER BY table_number');
}

function getRunningSessions() {
  const sessions = query("SELECT * FROM game_sessions WHERE status = 'running'");
  return sessions.map(s => {
    const game = getRunningGame(s.id);
    return { ...s, current_game: game };
  });
}

function getSessionByTable(tableNumber) {
  return get("SELECT * FROM game_sessions WHERE table_number = ? AND status = 'running' ORDER BY id DESC LIMIT 1", [tableNumber]);
}

function startGame(tableNumber, player1, player2, matchType, player3, player4) {
  const startTime = new Date().toISOString();
  const type = matchType === 'team' ? 'team' : 'single';
  ensurePlayer(player1);
  ensurePlayer(player2);
  if (player3) ensurePlayer(player3);
  if (player4) ensurePlayer(player4);
  run(
    "INSERT INTO game_sessions (table_number, player1, player2, player3, player4, match_type, start_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'running')",
    [tableNumber, player1, player2, player3 || null, player4 || null, type, startTime]
  );
  run('UPDATE tables SET status = ? WHERE table_number = ?', ['running', tableNumber]);
  const result = get("SELECT id, start_time FROM game_sessions WHERE start_time = ? AND table_number = ? ORDER BY id DESC LIMIT 1", [startTime, tableNumber]);
  const firstGame = startNextGame(result.id, player1, player2, player3, player4, type);
  return { id: result.id, start_time: startTime, match_type: type, game: firstGame };
}

function addGame(sessionId, winner, loser) {
  const count = get('SELECT COUNT(*) as c FROM session_games WHERE session_id = ?', [sessionId]);
  const gameNumber = (count ? count.c : 0) + 1;
  run(
    'INSERT INTO session_games (session_id, game_number, winner, loser) VALUES (?, ?, ?, ?)',
    [sessionId, gameNumber, winner, loser]
  );
  run('UPDATE game_sessions SET game_count = ? WHERE id = ?', [gameNumber, sessionId]);
  const g = get('SELECT * FROM session_games WHERE id = last_insert_rowid()');
  return { ...g, game_number: gameNumber };
}

function getSessionGames(sessionId) {
  return query('SELECT * FROM session_games WHERE session_id = ? ORDER BY game_number', [sessionId]);
}

function startNextGame(sessionId, p1, p2, p3, p4, matchType) {
  const playing = getRunningGame(sessionId);
  if (playing) return playing;
  if (!p1) {
    const session = get('SELECT * FROM game_sessions WHERE id = ?', [sessionId]);
    if (session) { p1 = session.player1; p2 = session.player2; p3 = session.player3; p4 = session.player4; }
  }
  if (p1) ensurePlayer(p1);
  if (p2) ensurePlayer(p2);
  if (p3) ensurePlayer(p3);
  if (p4) ensurePlayer(p4);
  const count = get('SELECT COUNT(*) as c FROM session_games WHERE session_id = ?', [sessionId]);
  const gameNumber = (count ? count.c : 0) + 1;
  const startTime = new Date().toISOString();
  const sessionInfo = get('SELECT table_number FROM game_sessions WHERE id = ?', [sessionId]);
  const table = get('SELECT price_per_hour FROM tables WHERE table_number = ?', [sessionInfo?.table_number]);
  const flatRate = table ? table.price_per_hour : 120;
  const mt = matchType || (p3 || p4 ? 'team' : 'single');
  run(
    "INSERT INTO session_games (session_id, game_number, player1, player2, player3, player4, start_time, status, match_type, rate, amount) VALUES (?, ?, ?, ?, ?, ?, ?, 'playing', ?, ?, 0)",
    [sessionId, gameNumber, p1 || null, p2 || null, p3 || null, p4 || null, startTime, mt, flatRate]
  );
  run('UPDATE game_sessions SET game_count = ? WHERE id = ?', [gameNumber, sessionId]);
  return get('SELECT * FROM session_games WHERE id = last_insert_rowid()');
}

function endCurrentGame(sessionId, winner, loser) {
  const game = get("SELECT * FROM session_games WHERE session_id = ? AND status = 'playing' ORDER BY id DESC LIMIT 1", [sessionId]);
  if (!game) throw new Error('No active game found');
  const endTime = new Date().toISOString();
  const startMs = new Date(game.start_time).getTime();
  const endMs = new Date(endTime).getTime();
  const durationSeconds = Math.round((endMs - startMs) / 1000);
  const session = get('SELECT * FROM game_sessions WHERE id = ?', [sessionId]);
  const table = get('SELECT price_per_hour FROM tables WHERE table_number = ?', [session.table_number]);
  const flatRate = table ? table.price_per_hour : 120;
  const isTeamGame = !!(game.player3 || game.player4);
  const gameAmount = flatRate * (isTeamGame ? 2 : 1);
  run(
    'UPDATE session_games SET end_time = ?, duration_seconds = ?, winner = ?, loser = ?, status = ?, amount = ? WHERE id = ?',
    [endTime, durationSeconds, winner, loser, 'completed', gameAmount, game.id]
  );
  return get('SELECT * FROM session_games WHERE id = ?', [game.id]);
}

function getRunningGame(sessionId) {
  return get("SELECT * FROM session_games WHERE session_id = ? AND status = 'playing' ORDER BY id DESC LIMIT 1", [sessionId]);
}

function endGame(sessionId) {
  const session = get('SELECT * FROM game_sessions WHERE id = ?', [sessionId]);
  if (!session) throw new Error('Session not found');

  const playing = getRunningGame(sessionId);
  if (playing) {
    run(
      "UPDATE session_games SET end_time = ?, duration_seconds = 0, status = 'cancelled' WHERE id = ?",
      [new Date().toISOString(), playing.id]
    );
  }

  const endTime = new Date().toISOString();
  const start = new Date(session.start_time);
  const end = new Date(endTime);
  const durationMinutes = (end - start) / (1000 * 60);

  const completedGames = query("SELECT * FROM session_games WHERE session_id = ? AND status = 'completed'", [sessionId]);
  const gameCount = completedGames.length;
  const tableBill = completedGames.reduce((sum, g) => sum + (g.amount || 0), 0);
  const perGamePrice = gameCount > 0 ? Math.round((tableBill / gameCount) * 100) / 100 : 0;

  const canteenResult = get(
    'SELECT COALESCE(SUM(total), 0) as total FROM canteen_orders WHERE session_id = ?',
    [sessionId]
  );
  const canteenTotal = canteenResult ? canteenResult.total : 0;

  const totalBill = Math.round((tableBill + canteenTotal) * 100) / 100;

  const games = getSessionGames(sessionId);

  run(`
    UPDATE game_sessions 
    SET end_time = ?, duration_minutes = ?,
        total_bill = ?, table_bill = ?, canteen_bill = ?, price_per_hour = ?,
        game_count = ?, status = 'completed'
    WHERE id = ?
  `, [endTime, Math.round(durationMinutes * 100) / 100,
      totalBill, tableBill, canteenTotal, perGamePrice, gameCount, sessionId]);

  run('UPDATE tables SET status = ? WHERE table_number = ?', ['available', session.table_number]);

  const invoiceNumber = 'INV-' + String(session.table_number).padStart(2, '0') + '-' + Date.now();
  run(`
    INSERT INTO invoices (session_id, invoice_number, table_number, match_type,
      player1, player2, player3, player4,
      game_count, per_game_price, table_bill, canteen_bill, total_bill)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [sessionId, invoiceNumber, session.table_number, session.match_type || 'single',
      session.player1, session.player2, session.player3, session.player4,
      gameCount, perGamePrice, tableBill, canteenTotal, totalBill]);
  const invoiceId = get('SELECT last_insert_rowid() as id').id;

  return {
    id: sessionId,
    invoice_id: invoiceId,
    table_number: session.table_number,
    player1: session.player1,
    player2: session.player2,
    player3: session.player3,
    player4: session.player4,
    match_type: session.match_type || 'single',
    start_time: session.start_time,
    end_time: endTime,
    duration_minutes: Math.round(durationMinutes * 100) / 100,
    table_bill: tableBill,
    canteen_bill: canteenTotal,
    total_bill: totalBill,
    per_game_price: perGamePrice,
    game_count: gameCount,
    games,
  };
}

function addCanteenOrder(sessionId, itemName, quantity, price) {
  const total = Math.round(quantity * price * 100) / 100;
  run(
    'INSERT INTO canteen_orders (session_id, item_name, quantity, price, total) VALUES (?, ?, ?, ?, ?)',
    [sessionId, itemName, quantity, price, total]
  );
  const result = get('SELECT * FROM canteen_orders WHERE id = last_insert_rowid()');
  return result;
}

function getCanteenOrders(sessionId) {
  return query('SELECT * FROM canteen_orders WHERE session_id = ? ORDER BY id', [sessionId]);
}

function getCompletedSessions() {
  return query("SELECT * FROM game_sessions WHERE status = 'completed' ORDER BY end_time DESC");
}

function getMatchHistoryByTable(tableNumber) {
  return query(
    "SELECT * FROM game_sessions WHERE table_number = ? AND status = 'completed' ORDER BY end_time DESC LIMIT 10",
    [tableNumber]
  );
}

function getDailyReport(date, tableNumber) {
  const dayStart = date + 'T00:00:00';
  const dayEnd = date + 'T23:59:59';

  const tableFilter = tableNumber ? 'AND table_number = ?' : '';
  const tableParams = tableNumber ? [dayStart, dayEnd, tableNumber] : [dayStart, dayEnd];

  const sessions = query(`
    SELECT * FROM game_sessions 
    WHERE start_time >= ? AND start_time <= ? AND status = 'completed' ${tableFilter}
    ORDER BY start_time
  `, tableParams);

  const totalRevenue = sessions.reduce((sum, s) => sum + (s.total_bill || 0), 0);
  const tableRevenue = sessions.reduce((sum, s) => sum + (s.table_bill || 0), 0);
  const canteenRevenue = sessions.reduce((sum, s) => sum + (s.canteen_bill || 0), 0);

  const canteenParams = tableNumber ? [dayStart, dayEnd, tableNumber] : [dayStart, dayEnd];
  const canteenOrders = query(`
    SELECT co.item_name, SUM(co.quantity) as quantity, SUM(co.total) as total
    FROM canteen_orders co
    JOIN game_sessions gs ON co.session_id = gs.id
    WHERE gs.start_time >= ? AND gs.start_time <= ? ${tableFilter}
    GROUP BY co.item_name
    ORDER BY total DESC
  `, canteenParams);

  return { sessions, totalRevenue, tableRevenue, canteenRevenue, canteenOrders };
}

function getTableUsageReport() {
  return query(`
    SELECT table_number, COUNT(*) as total_games, 
           SUM(duration_minutes) as total_minutes,
           SUM(total_bill) as total_revenue
    FROM game_sessions 
    WHERE status = 'completed'
    GROUP BY table_number
    ORDER BY table_number
  `);
}

function ensurePlayer(name) {
  if (!name || !name.trim()) return null;
  const existing = get('SELECT * FROM players WHERE name = ?', [name.trim()]);
  if (existing) return existing;
  run('INSERT INTO players (name) VALUES (?)', [name.trim()]);
  return get('SELECT * FROM players WHERE name = ?', [name.trim()]);
}

function getPlayerHistory() {
  const players = query('SELECT * FROM players ORDER BY name');
  const gameWins = query('SELECT winner as player, COUNT(*) as cnt FROM session_games WHERE winner IS NOT NULL GROUP BY winner');
  const gameLosses = query('SELECT loser as player, COUNT(*) as cnt FROM session_games WHERE loser IS NOT NULL GROUP BY loser');

  const winsMap = {};
  gameWins.forEach(r => winsMap[r.player] = (winsMap[r.player] || 0) + r.cnt);

  const lossesMap = {};
  gameLosses.forEach(r => lossesMap[r.player] = (lossesMap[r.player] || 0) + r.cnt);

  return players.map(p => {
    const wins = winsMap[p.name] || 0;
    const losses = lossesMap[p.name] || 0;
    const games_played = wins + losses;
    return {
      player: p.name,
      games_played,
      wins,
      losses,
      win_rate: games_played > 0 ? Math.round((wins / games_played) * 100) : 0,
    };
  }).sort((a, b) => b.games_played - a.games_played);
}

function getInvoices(tableNumber) {
  if (tableNumber) {
    return query('SELECT * FROM invoices WHERE table_number = ? ORDER BY generated_at DESC', [tableNumber]);
  }
  return query('SELECT * FROM invoices ORDER BY generated_at DESC');
}

function getInvoice(id) {
  return get('SELECT * FROM invoices WHERE id = ?', [id]);
}

function getInvoicesByDate(date, tableNumber) {
  const dayStart = date + ' 00:00:00';
  const dayEnd = date + ' 23:59:59';
  if (tableNumber) {
    return query('SELECT * FROM invoices WHERE generated_at >= ? AND generated_at <= ? AND table_number = ? ORDER BY generated_at', [dayStart, dayEnd, tableNumber]);
  }
  return query('SELECT * FROM invoices WHERE generated_at >= ? AND generated_at <= ? ORDER BY generated_at', [dayStart, dayEnd]);
}

function getAllSessions() {
  return query('SELECT * FROM game_sessions ORDER BY start_time DESC');
}

function getLatestSessionByTable(tableNumber) {
  return get('SELECT * FROM game_sessions WHERE table_number = ? ORDER BY id DESC LIMIT 1', [tableNumber]);
}

function completeTableOrder(tableNumber) {
  run('UPDATE tables SET status = ? WHERE table_number = ?', ['available', tableNumber]);
}

function updateTablePrice(tableNumber, price) {
  run('UPDATE tables SET price_per_hour = ? WHERE table_number = ?', [price, tableNumber]);
}

function updateInvoicePayment(invoiceId, paymentMethod, discount, discountType, notes) {
  run(`
    UPDATE invoices SET payment_method = ?, discount = ?, discount_type = ?, notes = ?
    WHERE id = ?
  `, [paymentMethod, discount || 0, discountType || 'percentage', notes || '', invoiceId]);
  return get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
}

module.exports = {
  initDatabase,
  getSettings,
  saveSetting,
  getTables,
  updateTablePrice,
  getRunningSessions,
  getSessionByTable,
  startGame,
  endGame,
  addGame,
  getSessionGames,
  startNextGame,
  endCurrentGame,
  getRunningGame,
  addCanteenOrder,
  getCanteenOrders,
  getCompletedSessions,
  getMatchHistoryByTable,
  getDailyReport,
  getTableUsageReport,
  getPlayerHistory,
  ensurePlayer,
  getInvoices,
  getInvoice,
  updateInvoicePayment,
  getInvoicesByDate,
  getAllSessions,
  getLatestSessionByTable,
  completeTableOrder,
};
