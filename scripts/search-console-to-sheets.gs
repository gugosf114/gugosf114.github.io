/**
 * Google Apps Script: Search Console to Google Sheets
 * 
 * Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script.
 * 2. Paste this code.
 * 3. Go to Services (left sidebar) -> Add "Google Search Console API".
 * 4. Run the syncSearchConsoleData function.
 * 
 * This creates a daily backup of your SEO performance so you can easily spot
 * when "mybakingcreations.com" drops in impressions.
 */
function syncSearchConsoleData() {
  const siteUrl = 'sc-domain:mybakingcreations.com'; 
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Clear old data
  sheet.clear();
  sheet.appendRow(['Date', 'Query', 'Clicks', 'Impressions', 'CTR', 'Position']);
  
  // Set date range (Last 7 days)
  const today = new Date();
  const endDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const startDateObj = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startDate = Utilities.formatDate(startDateObj, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const request = {
    startDate: startDate,
    endDate: endDate,
    dimensions: ['date', 'query'],
    rowLimit: 1000
  };

  try {
    const response = SearchConsole.Searchanalytics.query(request, siteUrl);
    
    if (response.rows && response.rows.length > 0) {
      const data = response.rows.map(row => {
        return [
          row.keys[0], // Date
          row.keys[1], // Query
          row.clicks,
          row.impressions,
          row.ctr,
          row.position
        ];
      });
      sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
      Logger.log('Data synced successfully!');
    } else {
      Logger.log('No data found for this date range.');
    }
  } catch (e) {
    Logger.log('Error: ' + e.message);
    Logger.log('Make sure Search Console API is enabled in Advanced Services.');
  }
}