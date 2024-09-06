import axios from 'axios';
import { google } from 'googleapis';

// Update the scopes to include Google Drive for permissions management
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ],
});

async function runApifyActor(type, keyword, numResults, sites) {
  const actorId = type === 'google' ? 'lzjHrkj6h55oGvZvv' : 'ptLGAfpjlMEmQildy';
  const apiUrl = `https://api.apify.com/v2/actor-tasks/${actorId}/run-sync-get-dataset-items`;

  let searchQuery = keyword;
  if (type === 'google' && sites) {
    const siteQuery = sites.split(',').map(site => `site:${site.trim()}`).join(' OR ');
    searchQuery += ' ' + siteQuery;
  }

  const params = {
    countryCode: "us",
    includeIcons: false,
    includeUnfilteredResults: false,
    languageCode: "en",
    maxPagesPerQuery: 1,
    mobileResults: false,
    queries: searchQuery,
    resultsPerPage: numResults,
    saveHtml: false,
    saveHtmlToKeyValueStore: false
  };

  try {
    const response = await axios.post(apiUrl, params, {
      headers: {
        'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to call Apify API:", error.response ? error.response.data : error.message);
    throw new Error(`Failed to call Apify API: ${error.message}`);
  }
}


async function writeToGoogleSheets(type, keyword, data) {
  const googleClient = await auth.getClient();
  const googleSheetsApi = google.sheets({ version: 'v4', auth: googleClient });
  const sheetTitle = type === 'google' ? `Search: ${keyword}` : `YouTube: ${keyword}`;

  const spreadsheet = await googleSheetsApi.spreadsheets.create({
    requestBody: {
      properties: {
        title: sheetTitle
      },
      sheets: [{
        properties: {
          title: 'Data'
        }
      }]
    }
  });

  // Extract titles and URLs from the organic results
  const headers = ['Title', 'URL'];
  const values = data.map(item => item.organicResults.map(organic => [organic.title, organic.url])).flat();

  await googleSheetsApi.spreadsheets.values.append({
    spreadsheetId: spreadsheet.data.spreadsheetId,
    range: 'Data!A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [headers, ...values]
    }
  });

  // Call the sharing function here
  await shareSheetWithUser(spreadsheet.data.spreadsheetId, process.env.MY_EMAIL);

  return `Created new sheet: ${spreadsheet.data.spreadsheetUrl}`;
}

async function shareSheetWithUser(spreadsheetId, userEmail) {
  const driveService = google.drive({ version: 'v3', auth: await auth.getClient() });
  const permission = {
    type: 'user',
    role: 'writer',
    emailAddress: userEmail
  };

  await driveService.permissions.create({
    resource: permission,
    fileId: spreadsheetId,
    fields: 'id',
    sendNotificationEmail: false  // Disable email notification
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, keyword, numResults, sites } = req.body;

    try {
      const data = await runApifyActor(type, keyword, numResults, sites);
      const responseMessage = await writeToGoogleSheets(type, keyword, data);
      res.status(200).json({ message: responseMessage });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
