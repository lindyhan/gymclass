import "@nomicfoundation/hardhat-toolbox-viem";
require("@nomiclabs/hardhat-waffle");
import { HardhatUserConfig } from "hardhat/config";
import "./scripts/castVote";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.27",

  networks: {
    optimismSepolia: {
      url: "https://sepolia.optimism.io",
      accounts: [process.env.PRIVATE_KEY || ''],
    },
  },

  etherscan: {
    apiKey: {
      optimismSepolia: process.env.CONTRACT_ADDRESS!,
    }
  },

};

export default config;