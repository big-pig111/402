require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const facilitatorAddress = process.env.FACILITATOR_ADDRESS;
  if (!facilitatorAddress) {
    throw new Error('Missing FACILITATOR_ADDRESS in .env (on-chain facilitator address)');
  }

  const Token = await hre.ethers.getContractFactory('Dog402Token');
  const token = await Token.deploy(facilitatorAddress);
  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log(`Dog402Token deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
