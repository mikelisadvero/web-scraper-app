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
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: scraperType, keyword, numResults, sites }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Scraper Tool</h1>
      <div className={styles.toggle}>
        <span>Google Scraper</span>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={scraperType === 'youtube'}
            onChange={(e) => setScraperType(e.target.checked ? 'youtube' : 'google')}
          />
          <span className={styles.slider}></span>
        </label>
        <span>YouTube Scraper</span>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Number of Results"
          value={numResults}
          onChange={(e) => setNumResults(e.target.value)}
          required
        />
        {scraperType === 'google' && (
          <input
            type="text"
            placeholder="Sites to Include (optional)"
            value={sites}
            onChange={(e) => setSites(e.target.value)}
          />
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}