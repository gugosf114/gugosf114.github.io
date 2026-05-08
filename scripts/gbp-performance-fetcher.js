/**
 * Google Business Profile Performance API - Metrics Fetcher
 * 
 * Setup:
 * 1. npm install googleapis
 * 2. Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON.
 *    (Ensure the service account is added as an owner/manager to your GBP location).
 * 3. Find your 'locationId' (e.g., 'locations/1234567890').
 */
const { google } = require('googleapis');

// Replace with your actual location ID
const LOCATION_NAME = 'locations/YOUR_LOCATION_ID'; 

async function getGbpPerformance() {
  console.log('Authenticating with Google...');
  
  // Authenticate using the service account credential file
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/business.manage']
  });

  const client = await auth.getClient();
  
  // The GBP Performance API endpoint
  const businessprofileperformance = google.businessprofileperformance({
    version: 'v1',
    auth: client
  });

  console.log(`Fetching last 30 days of performance data for ${LOCATION_NAME}...`);

  try {
    // We request Search keywords and basic metrics (calls, website clicks, direction requests)
    const response = await businessprofileperformance.locations.fetchMultiDailyMetricsTimeSeries({
      location: LOCATION_NAME,
      dailyMetrics: [
        'WEBSITE_CLICKS',
        'CALL_CLICKS',
        'DIRECTIONS_REQUESTS',
        'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
        'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
        'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
        'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'
      ],
      dailyRange_startDate_year: new Date().getFullYear(),
      dailyRange_startDate_month: new Date().getMonth() === 0 ? 12 : new Date().getMonth(), // roughly 30 days ago
      dailyRange_startDate_day: new Date().getDate(),
      dailyRange_endDate_year: new Date().getFullYear(),
      dailyRange_endDate_month: new Date().getMonth() + 1,
      dailyRange_endDate_day: new Date().getDate(),
    });

    console.log('\n--- GBP Performance Report ---');
    if (response.data.multiDailyMetricTimeSeries) {
      response.data.multiDailyMetricTimeSeries.forEach(metric => {
        console.log(`Metric: ${metric.dailyMetric}`);
        // Sum up the values over the days
        let total = 0;
        if (metric.timeSeries && metric.timeSeries.timeSeriesDays) {
          metric.timeSeries.timeSeriesDays.forEach(day => {
            if (day.dailyValue) total += parseInt(day.dailyValue, 10);
          });
        }
        console.log(`  Total (last ~30 days): ${total}`);
      });
    } else {
      console.log('No data returned. Make sure the API is enabled and location ID is correct.');
    }
  } catch (error) {
    console.error('Error fetching GBP data:', error.message);
    if (error.code === 403) {
      console.error('Permission denied. Ensure your service account is added to the GBP listing and the API is enabled.');
    }
  }
}

getGbpPerformance().catch(console.error);