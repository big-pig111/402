const { ethers } = require('ethers');

module.exports = async (req, res) => {
  const TOKEN = process.env.TOKEN_ADDRESS;
  const SELLER = process.env.SELLER_WALLET;
  const FACILITATOR_URL = process.env.FACILITATOR_URL || process.env.FACILITATOR || 'https://facilitator.x402.org';
  const PUBLIC_URL = process.env.PUBLIC_URL || (req.headers['x-forwarded-proto'] ? `${req.headers['x-forwarded-proto']}://${req.headers.host}` : 'https://example.com');

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

    const resourceUrl = `${PUBLIC_URL.replace(/\/$/, '')}/api/mint`;

    const payment = {
      chainId: 8453,
      token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      amount: '10000',
      to: SELLER,
      resource: resourceUrl,
      call: { to: TOKEN, data }
    };

    const x402Body = {
      x402Version: 1,
      error: {},
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
          outputSchema: {
            input: { type: 'http', method: 'GET', discoverable: true }
          },
          extra: {
            name: 'USD Coin',
            version: '2',
            call: { to: TOKEN, function: 'mint(address)', amountPerMint: '100', decimals: 18 }
          }
        }
      ]
    };

    res
      .status(402)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'x-user-address,content-type')
      .setHeader('Access-Control-Expose-Headers', 'x402-payment,x402-facilitator')
      .setHeader('x402-facilitator', FACILITATOR_URL)
      .setHeader('x402-payment', JSON.stringify(payment))
      .json(x402Body);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  }
};
