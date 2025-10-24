require('dotenv').config();
const axios = require('axios');

const PUBLIC_URL = process.env.PUBLIC_URL;
if (!PUBLIC_URL) {
  throw new Error('Set PUBLIC_URL in your .env (e.g., https://402-flame.vercel.app)');
}

const resource = {
  url: `${PUBLIC_URL.replace(/\/$/, '')}/mint`,
  name: '402dog Token',
  description: 'Pay 0.01 USDC to mint 100 402DOG tokens',
  tags: ['token', 'erc20', 'base', 'x402'],
  image: `${PUBLIC_URL.replace(/\/$/, '')}/402dog.svg`
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function submitWithRetry(maxRetries = 5) {
  let attempt = 0;
  // modest default headers to avoid anti-bot challenges
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Origin': PUBLIC_URL,
    'Referer': PUBLIC_URL
  };

  while (attempt < maxRetries) {
    try {
      await axios.post('https://www.x402scan.com/api/submit', resource, { headers });
      console.log('Submitted to x402scan!');
      return;
    } catch (e) {
      const status = e?.response?.status;
      attempt += 1;
      if (status !== 429 && (!status || status < 500 || status >= 600)) {
        // non-retryable
        console.error('Submit failed (non-retryable):', status, e.message);
        throw e;
      }
      const backoffMs = Math.min(60000, 2000 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 500);
      console.warn(`Rate limited or server busy (status ${status}). Retry ${attempt}/${maxRetries} after ${Math.round(backoffMs/1000)}s...`);
      await sleep(backoffMs);
    }
  }
  throw new Error('Submit failed after retries');
}

submitWithRetry().catch((e) => {
  console.error(e);
  process.exit(1);
});
