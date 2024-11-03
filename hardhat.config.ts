import "@nomicfoundation/hardhat-toolbox-viem";
import { HardhatUserConfig, task } from "hardhat/config";
import "./scripts/giveRights";
import "./scripts/castVote";
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
};

export default config;