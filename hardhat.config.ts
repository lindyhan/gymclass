import "@nomicfoundation/hardhat-toolbox-viem";
import { HardhatUserConfig } from "hardhat/config";
import "./tasks/giveRights";
import "./tasks/castVote";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.27",

  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY || ''],
    },
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY || ''],
    },
    optimismSepolia: {
      url: "https://sepolia.optimism.io",
      accounts: [process.env.PRIVATE_KEY || ''],
    },
    baseSepolia: {
      url: "https://base-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY || ''],
    },
  },

  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY!,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY!,
      optimismSepolia: process.env.OPTIMISM_SEPOLIA_USDC_ADDRESS!,
      baseSepolia: process.env.BASE_SEPOLIA_USDC_ADDRESS!,
    }
  },

  sourcify: {
    enabled: true
  },

};

export default config;