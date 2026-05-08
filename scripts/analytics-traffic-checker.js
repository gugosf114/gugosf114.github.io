/**
 * Google Analytics Data API v1 - Traffic Checker
 * Run this to check traffic for the 84 URLs Search Console flagged.
 * 
 * Setup:
 * 1. npm install @google-analytics/data
 * 2. Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON.
 * 3. Replace 'YOUR-GA4-PROPERTY-ID' below.
 */
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const propertyId = 'YOUR-GA4-PROPERTY-ID';
const analyticsDataClient = new BetaAnalyticsDataClient();

// List the broken/flagged URLs you want to check here
const flaggedUrls = [
  '/blog-best-wedding-cake-flavors',
  '/old-contact-page',
  // add more paths here...
];

async function checkTraffic() {
  console.log('Fetching 30-day traffic for flagged URLs...');
  
  const [response] = await analyticsDataClient.runReport({
    property: 'properties/' + propertyId,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        inListFilter: {
          values: flaggedUrls,
        },
      },
    },
  });

  if (!response.rows || response.rows.length === 0) {
    console.log('No traffic found for these URLs in the last 30 days. Safe to delete or redirect without losing traffic.');
    return;
  }

  console.log('\n--- Traffic Report ---');
  response.rows.forEach(row => {
    console.log('URL: ' + row.dimensionValues[0].value);
    console.log('  Views: ' + row.metricValues[0].value);
    console.log('  Users: ' + row.metricValues[1].value);
    console.log('----------------------');
  });
}

checkTraffic().catch(console.error);