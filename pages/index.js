import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [scraperType, setScraperType] = useState('google');
  const [keyword, setKeyword] = useState('');
  const [numResults, setNumResults] = useState('');
  const [sites, setSites] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Processing...');
    try {
      console.log('Sending request with body:', { type: scraperType, keyword, numResults, sites });
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: scraperType, keyword, numResults, sites }),
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const text = await response.text();
      console.log('Response text:', text);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
      }
      const data = JSON.parse(text);
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`An error occurred: ${error.message}`);
    }
  };

  // ... rest of your component code ...
}