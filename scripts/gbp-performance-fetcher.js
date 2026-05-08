/**
 * Google Business Profile Performance API - Metrics Fetcher
 * 
 * Setup:
 * 1. npm install googleapis
 * 2. Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON.
 *    (Ensure the service account is added as an owner/manager to your GBP location).
 */
const { google } = require('googleapis');

const LOCATIONS = [
  { name: 'MBC Sunset', id: 'locations/7400791082088496035' },
  { name: 'MBC Daly City', id: 'locations/12421971385194836773' }
];

async function getGbpPerformance() {
  console.log('Authenticating with Google...');
  
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/business.manage']
  });

  const client = await auth.getClient();
  
  const businessprofileperformance = google.businessprofileperformance({
    version: 'v1',
    auth: client
  });

  for (const location of LOCATIONS) {
    console.log(`\nFetching last 30 days of performance data for ${location.name} (${location.id})...`);

    try {
      const response = await businessprofileperformance.locations.fetchMultiDailyMetricsTimeSeries({
        location: location.id,
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

      console.log(`--- GBP Performance Report for ${location.name} ---`);
      if (response.data.multiDailyMetricTimeSeries) {
        response.data.multiDailyMetricTimeSeries.forEach(metric => {
          let total = 0;
          if (metric.timeSeries && metric.timeSeries.timeSeriesDays) {
            metric.timeSeries.timeSeriesDays.forEach(day => {
              if (day.dailyValue) total += parseInt(day.dailyValue, 10);
            });
          }
          console.log(`  ${metric.dailyMetric}: ${total}`);
        });
      } else {
        console.log('No data returned for this location.');
      }
    } catch (error) {
      console.error(`Error fetching GBP data for ${location.name}:`, error.message);
    }
  }
}

getGbpPerformance().catch(console.error);