import "@nomicfoundation/hardhat-toolbox-viem";
import { HardhatUserConfig, task } from "hardhat/config";
import "./scripts/giveRights";
import "./scripts/castVote";
import "./scripts/delegate";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.viem.getWalletClients();
  for (const account of accounts) {
    console.log(account.account.address);
  }
});

import * as dotenv from "dotenv";
dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [deployerPrivateKey]
    }
  },
};

export default config;