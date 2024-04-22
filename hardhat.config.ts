import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    goerli: {
      url: ``,
      accounts: []
    },
    sepolia: {
      url: ``,
      accounts: []
    },
    hardhat: {
    }
  },
  etherscan: {
    apiKey: ``
  },
  gasReporter: {
    enabled: true,
    currency: 'EUR',
    gasPrice: 17,
    coinmarketcap: '9ce1674f-8587-4207-877a-705d1429764b'
  }
}

export default config;