require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()

const PK = process.env.PK || "";
const ETHERSCAN = process.env.ETHERSCAN || "";
const RPC = process.env.RPC || "";

console.log(ETHERSCAN)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  etherscan: {
    apiKey: ETHERSCAN,
  },
  networks: {
    sepolia: {
      accounts: [`0x${PK}`],
      chainId: 11155111,
      url: RPC,
    },
  },
};