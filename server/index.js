require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3000;
const DEV = process.env.NODE_ENV !== 'production';

const TOKEN = process.env.TOKEN_ADDRESS;
const SELLER = process.env.SELLER_WALLET;
const FACILITATOR_URL = process.env.FACILITATOR_URL || process.env.FACILITATOR || 'https://facilitator.x402.org';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

if (!SELLER) {
  console.warn('WARN: SELLER_WALLET not set. Set it in your .env');
}
if (!TOKEN) {
  console.warn('WARN: TOKEN_ADDRESS not set. Set it after contract deployment');
}

app.get('/mint', (req, res) => {
  try {
    let userAddress = req.headers['x-user-address'] || req.query.address || SELLER;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      userAddress = '0x0000000000000000000000000000000000000001';
    }
    if (!TOKEN || !SELLER) {
      return res.status(500).json({ error: 'Server not configured: set TOKEN_ADDRESS and SELLER_WALLET' });
    }

    const iface = new ethers.Interface(['function mint(address to)']);
    const data = iface.encodeFunctionData('mint', [userAddress]);

    const resourceUrl = `${PUBLIC_URL.replace(/\/$/, '')}/mint`;

    const payment = {
      chainId: 8453,
      token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC Base
      amount: '10000', // 0.01 USDC
      to: SELLER,
      resource: resourceUrl,
      call: {
        to: TOKEN,
        data
      }
    };

    const x402Body = {
      x402Version: 1,
      accepts: [
        {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: payment.amount,
          resource: resourceUrl,
          description: 'Pay 0.01 USDC to mint 100 402DOG',
          mimeType: 'application/json',
          payTo: SELLER,
          maxTimeoutSeconds: 600,
          asset: payment.token,
          extra: { call: { to: TOKEN, function: 'mint(address)', amountPerMint: '100', decimals: 18 } }
        }
      ]
    };

    res
      .status(402)
      .set('Access-Control-Allow-Origin', '*')
      .set('x402-facilitator', FACILITATOR_URL)
      .set('x402-payment', JSON.stringify(payment))
      .json(x402Body);
  } catch (e) {
    console.error(e);
    if (DEV) {
      return res.status(500).json({ error: e.message || String(e) });
    }
    res.status(500).json({ error: 'Internal error' });
  }
});

// New: /mint-v2 with a different price/amount
app.get('/mint-v2', (req, res) => {
  try {
    let userAddress = req.headers['x-user-address'] || req.query.address || SELLER;
    if (!userAddress || !ethers.isAddress(userAddress)) {
      userAddress = '0x0000000000000000000000000000000000000001';
    }
    if (!TOKEN || !SELLER) {
      return res.status(500).json({ error: 'Server not configured: set TOKEN_ADDRESS and SELLER_WALLET' });
    }

    const iface = new ethers.Interface(['function mint(address to)']);
    const data = iface.encodeFunctionData('mint', [userAddress]);

    const resourceUrl = `${PUBLIC_URL.replace(/\/$/, '')}/mint-v2`;

    const payment = {
      chainId: 8453,
      token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      amount: '50000', // 0.05 USDC
      to: SELLER,
      resource: resourceUrl,
      call: {
        to: TOKEN,
        data
      }
    };

    const x402Body = {
      x402Version: 1,
      accepts: [
        {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: payment.amount,
          resource: resourceUrl,
          description: 'Pay 0.05 USDC to mint 600 402DOG',
          mimeType: 'application/json',
          payTo: SELLER,
          maxTimeoutSeconds: 600,
          asset: payment.token,
          extra: { call: { to: TOKEN, function: 'mint(address)', amountPerMint: '600', decimals: 18 } }
        }
      ]
    };

    res
      .status(402)
      .set('Access-Control-Allow-Origin', '*')
      .set('x402-facilitator', FACILITATOR_URL)
      .set('x402-payment', JSON.stringify(payment))
      .json(x402Body);
  } catch (e) {
    console.error(e);
    if (DEV) {
      return res.status(500).json({ error: e.message || String(e) });
    }
    res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`402dog Seller running at http://localhost:${PORT}/mint`);
});
