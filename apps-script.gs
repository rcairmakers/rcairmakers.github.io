// ===== R&C Airmakers Apps Script v3.0 =====
// Tabs needed: Bookings, Products, Services, Promos

const SECRET = 'rcairmakers2026';

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action || 'data';

  if (action === 'data') {
    var products = getSheetData(ss, 'Products');
    var services = getSheetData(ss, 'Services');
    var promos = getSheetData(ss, 'Promos');
    return ContentService
      .createTextOutput(JSON.stringify({ products: products, services: services, promos: promos }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  if (data.secret !== SECRET) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid secret' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(data.sheet);
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Sheet not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'add') {
    sheet.appendRow(data.row);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Row added' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'update') {
    var row = data.rowIndex;
    for (var i = 0; i < data.row.length; i++) {
      sheet.getRange(row, i + 1).setValue(data.row[i]);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Row updated' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'delete') {
    sheet.deleteRow(data.rowIndex);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Row deleted' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = { _row: i + 1 };
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    result.push(obj);
  }
  return result;
}
