require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const grantee = process.env.GRANTEE_ADDRESS; // address to grant MINTER_ROLE
  if (!tokenAddress || !grantee) {
    throw new Error('Set TOKEN_ADDRESS and GRANTEE_ADDRESS in .env');
  }

  const token = await hre.ethers.getContractAt('Dog402Token', tokenAddress);
  const MINTER_ROLE = hre.ethers.id('MINTER');

  const tx = await token.grantRole(MINTER_ROLE, grantee);
  console.log('Granting MINTER_ROLE tx:', tx.hash);
  await tx.wait();
  console.log('Granted MINTER_ROLE to', grantee);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
