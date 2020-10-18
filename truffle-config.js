const path = require("path");
const HDWalletProvider = require("truffle-hdwallet-provider");
require("dotenv").config();

const MNEMONIC = process.env.MNEMONIC;
const RINKEBY_URL = process.env.RINKEBY_URL;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545,
    },
    // Configuration for rinkeby network
    rinkeby: {
      provider: function () {
        // Setting the provider with the Infura Rinkeby address and Token
        return new HDWalletProvider(MNEMONIC, RINKEBY_URL)
      },
      network_id: 4 //Fill in the `network_id` for the Rinkeby network.
    }
  },
  compilers: {
    solc: {
      version: "0.6.12",
    },
  },
};
