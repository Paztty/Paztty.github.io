function getRegistrations_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2');
  if (!sheet) {
    return [];
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    // Chỉ có dòng tiêu đề hoặc hoàn toàn trống
    return [];
  }

  // Bỏ qua dòng tiêu đề, chỉ lấy từ hàng 2 trở đi, cột A:C
  var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];

    // Bỏ qua các dòng trống tên + email
    if (!row[0] && !row[1]) {
      continue;
    }

    var createdAt = '';
    if (row[2] instanceof Date) {
      createdAt = row[2].toISOString();
    } else if (row[2]) {
      createdAt = String(row[2]);
    }

    items.push({
      name: row[0] || '',
      email: row[1] || '',
      createdAt: createdAt,
    });
  }

  return items;
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2'); // đổi tên sheet cho đúng
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  var data;

  try {
    data = JSON.parse(raw);
  } catch (err) {
    data = {};
  }

  // Nếu action = 'list' thì trả về toàn bộ danh sách, không ghi thêm
  if (data && data.action === 'list') {
    var items = getRegistrations_();
    return ContentService.createTextOutput(JSON.stringify({ items: items }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Ghi dữ liệu vào bảng: Tên, Email, Thời gian
  sheet.appendRow([data.name, data.email, new Date()]);

  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  var items = getRegistrations_();
  var output = ContentService.createTextOutput(JSON.stringify({ items: items }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}