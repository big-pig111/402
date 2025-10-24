const axios = require('axios');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = async (req, res) => {
  try {
    const PUBLIC_URL = process.env.PUBLIC_URL;
    if (!PUBLIC_URL) {
      return res.status(400).json({ error: 'PUBLIC_URL not set' });
    }
    const path = req.query.path || '/mint';
    const resourceUrl = `${PUBLIC_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;

    const resource = {
      url: resourceUrl,
      name: '402dog Token',
      description: 'Pay 0.01~0.05 USDC to mint 402DOG tokens',
      tags: ['token', 'erc20', 'base', 'x402'],
      image: `${PUBLIC_URL.replace(/\/$/, '')}/402dog.svg`
    };

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome',
      'Accept': 'application/json, text/plain, */*',
      'Origin': PUBLIC_URL,
      'Referer': PUBLIC_URL
    };

    const maxRetries = 6;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await axios.post('https://www.x402scan.com/api/submit', resource, { headers, timeout: 15000 });
        return res.status(200).json({ ok: true, submitted: resourceUrl });
      } catch (e) {
        const status = e?.response?.status;
        if (status !== 429 && (!status || status < 500 || status >= 600)) {
          return res.status(502).json({ ok: false, status, message: e.message });
        }
        const backoffMs = Math.min(90000, 3000 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 800);
        if (attempt === maxRetries) {
          return res.status(429).json({ ok: false, status, message: 'rate limited after retries' });
        }
        await sleep(backoffMs);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
