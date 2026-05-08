/**
 * Google Business Profile - Business Information API Helper
 * 
 * Setup:
 * 1. npm install googleapis
 * 2. Set GOOGLE_APPLICATION_CREDENTIALS env var.
 */
const { google } = require('googleapis');

const LOCATIONS = [
  { name: 'MBC Sunset', id: 'locations/7400791082088496035' },
  { name: 'MBC Daly City', id: 'locations/12421971385194836773' }
];

async function updateBusinessInfo() {
  console.log('Authenticating with Google...');
  
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/business.manage']
  });

  const client = await auth.getClient();
  
  const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
    version: 'v1',
    auth: client
  });

  for (const location of LOCATIONS) {
    console.log(`\nFetching current business information for ${location.name} (${location.id})...`);

    try {
      const locationResponse = await mybusinessbusinessinformation.locations.get({
        name: location.id,
        readMask: 'storefrontAddress,regularHours,specialHours,profile'
      });
      
      console.log(`--- Current Location Data for ${location.name} ---`);
      console.log(JSON.stringify(locationResponse.data, null, 2));

      // Example of an update you could perform:
      // Adding special holiday hours for both bakeries
      /*
      const updatedLocation = {
        ...locationResponse.data,
        specialHours: {
          specialHourPeriods: [
            {
              startDate: { year: 2026, month: 12, day: 25 },
              endDate: { year: 2026, month: 12, day: 25 },
              closed: true
            }
          ]
        }
      };

      console.log(`\nUpdating location ${location.name} with special holiday hours...`);
      const updateResponse = await mybusinessbusinessinformation.locations.patch({
        name: location.id,
        updateMask: 'specialHours',
        requestBody: updatedLocation
      });
      console.log(`Update successful for ${location.name}:`, updateResponse.data);
      */

    } catch (error) {
      console.error(`Error fetching/updating Business Info for ${location.name}:`, error.message);
    }
  }
}

updateBusinessInfo().catch(console.error);