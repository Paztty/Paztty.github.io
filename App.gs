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
  var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  var items = [];

  for (var i = 0; i < values.length; i++) {

    var row = values[i];
    if (row[1] instanceof Date) {
      if(row[1].getDate() != new Date().getDate());
      sheet.deleteRow(i);
    }
    // Bỏ qua các dòng trống tên
    if (!row[0]) {
      continue;
    }

    var createdAt = '';
    if (row[1] instanceof Date) {

      createdAt = row[1].toISOString();
    } else if (row[1]) {
      createdAt = String(row[1]);
    }

    items.push({
      name: row[0] || '',
      createdAt: createdAt,
      san: row[2]
    });
  }

  return items;
}

function updateResign(name, date)
{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2');
  var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (!sheet) {
    return '표 읽기 오류';
  }
  var lastRow = sheet.getLastRow();
  var lastRow1 = sheet1.getLastRow();
  var valuesLookup = sheet1.getRange(2, 1, lastRow1 - 1, 3).getValues();

  if(lastRow > 1)
  {
    var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0] === name) {
        return '등록 완료';
      }
    }
  }
  // Tìm level 
  var level = "";
  for (var i = 0; i < valuesLookup.length; i++) {
    var row = valuesLookup[i];
    if (row[1] === name) {
      level = row[2]
    }
  }

  var san = 1;
  if(level.trim() === 'A') san = 1;
  if(level.trim() === 'B') san = 4;
  if(level === '') 
      return '당신은 선수 명단에 없습니다';
  while(true)
  {
    if(san === 0 || san === 5) return;
    if(lastRow <= 1)
        break;
    var sanCheck = values.filter(function(row) {
          return row[2] === san;
        }).length;

    if(sanCheck <= 1)
    {
      break;
    }
    else
    {
      if(level.trim() === 'A') san++;
      if(level.trim() === 'B') san--;
      continue;
    }
  }
  // Ghi dữ liệu vào bảng: Tên, Thời gian, sân đấu
  sheet.appendRow([name, date, san]);
}

function deleteData(name)
{
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2');
  if (!sheet) {
    return [];
  }
  var lastRow = sheet.getLastRow();
  if(lastRow > 1)
  {
    var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0] === name) {
        // i là chỉ số trong mảng values, nhưng dòng thực tế trên sheet bắt đầu từ hàng 2
        var rowIndex = i + 2; 
        sheet.deleteRow(rowIndex);
        break; // thoát vòng lặp sau khi xóa
      }
    }
  }
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
  if (data && data.action === 'delete') {
    deleteData(data.name);
    var items = getRegistrations_();
    return ContentService.createTextOutput(JSON.stringify({ items: items }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // Cập nhật 
  var returnContent = updateResign(data.name, new Date());
  //var returnContent = updateResign('안세린', new Date(), data.mat);
  
  return ContentService.createTextOutput(returnContent)
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  var items = getRegistrations_();
  var output = ContentService.createTextOutput(JSON.stringify({ items: items }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}