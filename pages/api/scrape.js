export default async function handler(req, res) {
  // Log the request method for debugging
  console.log('Request method:', req.method);

  if (req.method === 'POST') {
    // Log the request body for debugging
    console.log('Request body:', req.body);

    const { type, keyword, numResults, sites } = req.body;

    try {
      // For now, let's just return a success message without actually running the scraper
      res.status(200).json({ message: 'Scraping request received successfully' });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}