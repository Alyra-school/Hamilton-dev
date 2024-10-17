require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PK = process.env.PK || "";
const RPC_URL=process.env.INFURA_URL || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    holesky : {
      url: RPC_URL ,
      chainId: 17000,
      accounts: [`0x${PK}`]
    },
    hardhat: {
      forking: {
        url: RPC_URL,
      }
    }
  },
  solidity: "0.8.27",
  etherscan:{
    apiKey:{
      holesky:ETHERSCAN
    }
  }
};
