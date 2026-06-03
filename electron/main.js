const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    show: false,
    backgroundColor: '#0f0f0f',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers() {
  ipcMain.handle('db:get-settings', () => db.getSettings());
  ipcMain.handle('db:save-setting', (_, key, value) => db.saveSetting(key, value));
  ipcMain.handle('db:get-tables', () => db.getTables());
  ipcMain.handle('db:update-table-price', (_, tableNumber, price) => db.updateTablePrice(tableNumber, price));
  ipcMain.handle('db:get-running-sessions', () => db.getRunningSessions());
  ipcMain.handle('db:get-session-by-table', (_, tableNumber) => db.getSessionByTable(tableNumber));
  ipcMain.handle('db:start-game', (_, tableNumber, player1, player2, matchType, player3, player4) => db.startGame(tableNumber, player1, player2, matchType, player3, player4));
  ipcMain.handle('db:end-game', (_, sessionId) => db.endGame(sessionId));
  ipcMain.handle('db:add-game', (_, sessionId, winner, loser) => db.addGame(sessionId, winner, loser));
  ipcMain.handle('db:get-session-games', (_, sessionId) => db.getSessionGames(sessionId));
  ipcMain.handle('db:start-next-game', (_, sessionId, p1, p2, p3, p4, matchType) => db.startNextGame(sessionId, p1, p2, p3, p4, matchType));
  ipcMain.handle('db:end-current-game', (_, sessionId, winner, loser) => db.endCurrentGame(sessionId, winner, loser));
  ipcMain.handle('db:get-running-game', (_, sessionId) => db.getRunningGame(sessionId));
  ipcMain.handle('db:add-canteen-order', (_, sessionId, itemName, quantity, price) => db.addCanteenOrder(sessionId, itemName, quantity, price));
  ipcMain.handle('db:get-canteen-orders', (_, sessionId) => db.getCanteenOrders(sessionId));
  ipcMain.handle('db:get-completed-sessions', () => db.getCompletedSessions());
  ipcMain.handle('db:get-match-history-by-table', (_, tableNumber) => db.getMatchHistoryByTable(tableNumber));
  ipcMain.handle('db:get-daily-report', (_, date, tableNumber) => db.getDailyReport(date, tableNumber));
  ipcMain.handle('db:get-table-usage-report', () => db.getTableUsageReport());
  ipcMain.handle('db:get-player-history', () => db.getPlayerHistory());
  ipcMain.handle('db:ensure-player', (_, name) => db.ensurePlayer(name));
  ipcMain.handle('db:get-invoices', (_, tableNumber) => db.getInvoices(tableNumber));
  ipcMain.handle('db:get-invoice', (_, id) => db.getInvoice(id));
  ipcMain.handle('db:get-invoices-by-date', (_, date, tableNumber) => db.getInvoicesByDate(date, tableNumber));
  ipcMain.handle('db:get-all-sessions', () => db.getAllSessions());
  ipcMain.handle('db:get-latest-session-by-table', (_, tableNumber) => db.getLatestSessionByTable(tableNumber));
  ipcMain.handle('db:complete-table-order', (_, tableNumber) => db.completeTableOrder(tableNumber));
  ipcMain.handle('db:update-invoice-payment', (_, invoiceId, paymentMethod, discount, discountType, notes) => db.updateInvoicePayment(invoiceId, paymentMethod, discount, discountType, notes));

  ipcMain.handle('db:get-staff', () => db.getStaff());
  ipcMain.handle('db:get-staff-member', (_, id) => db.getStaffMember(id));
  ipcMain.handle('db:add-staff', (_, name, role, username, password, phone, email, salary) => db.addStaff(name, role, username, password, phone, email, salary));
  ipcMain.handle('db:update-staff', (_, id, name, role, username, password, phone, email, salary, status) => db.updateStaff(id, name, role, username, password, phone, email, salary, status));
  ipcMain.handle('db:delete-staff', (_, id) => db.deleteStaff(id));
  ipcMain.handle('db:staff-login', (_, staffId) => db.staffLogin(staffId));
  ipcMain.handle('db:staff-logout', (_, sessionId) => db.staffLogout(sessionId));
  ipcMain.handle('db:get-staff-sessions', () => db.getStaffSessions());
  ipcMain.handle('db:get-shift-reports', (_, staffId) => db.getShiftReports(staffId));
  ipcMain.handle('db:add-shift-report', (_, staffId, date, clockIn, clockOut, notes) => db.addShiftReport(staffId, date, clockIn, clockOut, notes));
  ipcMain.handle('db:get-performance-reports', (_, staffId) => db.getPerformanceReports(staffId));
  ipcMain.handle('db:add-performance-report', (_, staffId, reviewDate, rating, notes) => db.addPerformanceReport(staffId, reviewDate, rating, notes));
  ipcMain.handle('db:get-membership-plans', () => db.getMembershipPlans());
  ipcMain.handle('db:add-membership-plan', (_, name, durationDays, price, benefits) => db.addMembershipPlan(name, durationDays, price, benefits));
  ipcMain.handle('db:update-membership-plan', (_, id, name, durationDays, price, benefits, status) => db.updateMembershipPlan(id, name, durationDays, price, benefits, status));
  ipcMain.handle('db:delete-membership-plan', (_, id) => db.deleteMembershipPlan(id));

  ipcMain.handle('print:bill', (_, htmlContent) => {
    const win = new BrowserWindow({
      width: 400,
      height: 600,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    win.webContents.on('did-finish-load', () => {
      win.webContents.print({}, () => win.close());
    });
  });
}

app.whenReady().then(async () => {
  await db.initDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
