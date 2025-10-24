require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { PRIVATE_KEY, BASE_RPC, BASE_SEPOLIA_RPC } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      chainId: 8453,
      url: BASE_RPC || "https://mainnet.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    base_sepolia: {
      chainId: 84532,
      url: BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
