/**
 * Google Apps Script backend cho chương trình Rút Thăm Chợ Đông Ba Nam Cali & Nha Khoa Nụ Cười Việt.
 *
 * Cách dùng:
 * 1) Tạo Google Sheet mới.
 * 2) Extensions > Apps Script > dán toàn bộ file này.
 * 3) Project Settings > Script Properties:
 *    ADMIN_TOKEN = tự đặt token riêng, ví dụ CDB-NCV-2026-PRIVATE
 * 4) Deploy > New deployment > Web app:
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) Copy Web App URL dán vào API_ENDPOINT trong index.html và admin.html.
 */

const SHEET_ENTRIES = 'Entries';
const SHEET_WINNERS = 'Winners';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    setupSheets_();

    if (body.action === 'submit') return json_(submitEntry_(body));
    if (body.action === 'list') return json_(requireAdmin_(body, listData_));
    if (body.action === 'draw') return json_(requireAdmin_(body, () => drawWinner_(body.prizeName)));

    return json_({ ok: false, message: 'Action không hợp lệ.' });
  } catch (err) {
    return json_({ ok: false, message: err.message || String(err) });
  }
}

function setupSheets_() {
  const ss = SpreadsheetApp.getActive();
  let entries = ss.getSheetByName(SHEET_ENTRIES);
  if (!entries) entries = ss.insertSheet(SHEET_ENTRIES);
  if (entries.getLastRow() === 0) {
    entries.appendRow([
      'ticket','fullName','phone','city','source','sourceOther','dentalInterest',
      'followConfirmed','sourcePage','createdAt','status'
    ]);
  }

  let winners = ss.getSheetByName(SHEET_WINNERS);
  if (!winners) winners = ss.insertSheet(SHEET_WINNERS);
  if (winners.getLastRow() === 0) {
    winners.appendRow(['drawnAt','ticket','fullName','phone','city','source','dentalInterest','prizeName']);
  }
}

function submitEntry_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ticket = clean_(body.ticket).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const fullName = clean_(body.fullName);
    const phone = clean_(body.phone);
    const city = clean_(body.city);
    const source = clean_(body.source);
    const sourceOther = clean_(body.sourceOther);
    const dentalInterest = clean_(body.dentalInterest);
    const followConfirmed = body.followConfirmed === true || body.followConfirmed === 'true';

    if (!/^CDB\d{6,}$/.test(ticket)) throw new Error('Mã Phiếu Rút Thăm không đúng. Vui lòng kiểm tra lại.');
    if (!fullName || !phone || !city || !source || !dentalInterest || !followConfirmed) throw new Error('Vui lòng điền đủ thông tin bắt buộc.');
    if (source === 'Khác' && !sourceOther) throw new Error('Vui lòng ghi rõ nguồn thông tin khác.');

    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_ENTRIES);
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === ticket) {
        return { ok: false, message: 'Mã Phiếu này đã được đăng ký. Vui lòng kiểm tra lại.' };
      }
    }

    sh.appendRow([
      ticket, fullName, phone, city, source, sourceOther, dentalInterest,
      followConfirmed ? 'YES' : 'NO', clean_(body.sourcePage), new Date(), 'ACTIVE'
    ]);
    return { ok: true, message: 'Phiếu đã được ghi nhận.' };
  } finally {
    lock.releaseLock();
  }
}

function listData_() {
  const entries = readSheet_(SHEET_ENTRIES).filter(r => r.status !== 'DRAWN');
  const winners = readSheet_(SHEET_WINNERS);
  return { ok: true, entries, winners };
}

function drawWinner_(prizeName) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_ENTRIES);
    const rows = sh.getDataRange().getValues();
    const active = [];
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][10] || 'ACTIVE') !== 'DRAWN') active.push({ row: i + 1, data: rows[i] });
    }
    if (active.length === 0) throw new Error('Không còn phiếu hợp lệ để quay.');

    const pick = active[Math.floor(Math.random() * active.length)];
    sh.getRange(pick.row, 11).setValue('DRAWN');

    const winner = {
      ticket: pick.data[0],
      fullName: pick.data[1],
      phone: pick.data[2],
      city: pick.data[3],
      source: pick.data[4],
      dentalInterest: pick.data[6],
      prizeName: clean_(prizeName),
      drawnAt: new Date()
    };

    SpreadsheetApp.getActive().getSheetByName(SHEET_WINNERS)
      .appendRow([winner.drawnAt, winner.ticket, winner.fullName, winner.phone, winner.city, winner.source, winner.dentalInterest, winner.prizeName]);

    return { ok: true, winner };
  } finally {
    lock.releaseLock();
  }
}

function requireAdmin_(body, fn) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!expected) throw new Error('Chưa thiết lập ADMIN_TOKEN trong Script Properties.');
  if (clean_(body.adminToken) !== expected) throw new Error('Admin Token không đúng.');
  return fn();
}

function readSheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function clean_(v) { return String(v || '').trim(); }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
