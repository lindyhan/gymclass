import { task } from "hardhat/config";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

const networks = {
  sepolia, arbitrumSepolia, optimismSepolia, baseSepolia,
} as const;

// Map each network to its specific contract address from .env
const CONTRACT_ADDRESSES = {
  sepolia: process.env.SEPOLIA_CONTRACT_ADDRESS,
  arbitrumSepolia: process.env.ARBITRUM_SEPOLIA_CONTRACT_ADDRESS,
  optimismSepolia: process.env.OPTIMISM_SEPOLIA_CONTRACT_ADDRESS,
  baseSepolia: process.env.BASE_SEPOLIA_CONTRACT_ADDRESS,
} as const;

// Function to retrieve the contract address based on the network
function getContractAddress(networkName: keyof typeof CONTRACT_ADDRESSES): `0x${string}` {
  const address = CONTRACT_ADDRESSES[networkName];
  if (!address) {
    throw new Error(`Contract address not configured for network: ${networkName}`);
  }
  return address as `0x${string}`;
}

task("give-rights", "Gives right to vote to an address")
  .addPositionalParam("voter", "The address to give voting rights to")
  .setAction(async (taskArgs, hre) => {
    const networkName = hre.network.name as keyof typeof networks;
    const currentNetwork = networks[networkName];
    const contractAddress = getContractAddress(networkName);

    try {
      const artifactPath = join(__dirname, "../artifacts/contracts/GymVote.sol/GymVote.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

      const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
      const account = privateKeyToAccount(privateKey);

      const publicClient = createPublicClient({
        chain: currentNetwork,
        transport: http(currentNetwork.rpcUrls.default.http[0]),
      });

      // Check if the voter already has rights or has voted
      const voterInfo = await publicClient.readContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'voters',
        args: [taskArgs.voter as `0x${string}`]
      });

      const [weight, hasVoted] = voterInfo as [bigint, boolean, string];

      if (hasVoted) {
        console.error("\nError: This voter has already voted");
        process.exit(1);
      }
      if (weight > 0n) {
        console.error("\nError: This voter already has voting rights");
        process.exit(1);
      }

      const walletClient = createWalletClient({
        chain: currentNetwork,
        transport: http(currentNetwork.rpcUrls.default.http[0]),
        account
      });

      console.log(`\nGiving voting rights to ${taskArgs.voter}...`);
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'giveRightToVote',
        args: [taskArgs.voter as `0x${string}`]
      });

      console.log("Transaction hash:", hash);

    } catch (error) {
      console.error(`\nError: ${error instanceof Error ? error.message : "An unexpected error occurred"}`);
      process.exit(1);
    }
});

/*
npx hardhat give-rights --network sepolia 0x0d68B5eAE929d9CB2BEcd80098C90497e35E64b8
*/