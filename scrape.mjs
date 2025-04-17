import puppeteer from 'puppeteer';
import fs from 'fs';

const SCRAPE_URL = process.env.SCRAPE_URL;

if (!SCRAPE_URL) {
  console.error('Please provide a URL to scrape via the SCRAPE_URL environment variable.');
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', // Use the new headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium' // Correct Chromium path
  });

  const page = await browser.newPage();
  await page.goto(SCRAPE_URL, { waitUntil: 'domcontentloaded' });

  const data = await page.evaluate(() => {
    return {
      title: document.title,
      heading: document.querySelector('h1')?.innerText || 'No H1 found',
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName,
        text: h.innerText.trim()
      })),
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })),
      metaDescription: document.querySelector('meta[name="description"]')?.content || 'No meta description found'
    };
  });

  fs.writeFileSync('scraped_data.json', JSON.stringify(data, null, 2));
  console.log('Scraping completed and data saved to scraped_data.json');

  await browser.close();
})();
