require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const grantee = process.env.GRANTEE_ADDRESS;
  if (!tokenAddress || !grantee) {
    throw new Error('Set TOKEN_ADDRESS and GRANTEE_ADDRESS in .env');
  }
  const token = await hre.ethers.getContractAt('Dog402Token', tokenAddress);
  const MINTER_ROLE = hre.ethers.id('MINTER');
  const has = await token.hasRole(MINTER_ROLE, grantee);
  console.log('Address', grantee, 'MINTER_ROLE =', has);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
