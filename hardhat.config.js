require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
//require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */

CUSTOM_URL = process.env.CUSTOM_URL;
module.exports = {
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true, // use this for this Error -> InvalidInputError: Transaction gas limit is 9999024856 and exceeds block gas limit of 30000000
    },
    // goerli: {
    //   url: "Use your Infura or Alchmey RPC URL",
    //   accounts: ["Use your Account Private Key"],
    // },
    localhost: {
      chainId: 1337,
      url: CUSTOM_URL,
    },
  },
};
