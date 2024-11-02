import { task } from "hardhat/config";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
dotenv.config();

task("give-rights", "Gives right to vote to an address")
  .addPositionalParam("voter", "The address to give voting rights to")
  .setAction(async (taskArgs, hre) => {
    try {
      const artifactPath = join(__dirname, "../artifacts/contracts/GymVote.sol/GymVote.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
      
      const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
      const account = privateKeyToAccount(privateKey);
      const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

      // Create public client for reading state
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      });

      // Check voter's current status
      const voter = await publicClient.readContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'voters',
        args: [taskArgs.voter as `0x${string}`]
      });

      // voter returns a tuple with [weight, voted, delegate, vote]
      const [weight, hasVoted, delegate] = voter as [bigint, boolean, string];

      if (hasVoted) {
        console.error("\nError: This voter has already voted");
        process.exit(1);
      }
      if (weight > 0n) {
        console.error("\nError: This voter already has voting rights");
        process.exit(1);
      }

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(),
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
      if (error instanceof Error) {
        console.error(`\nError: ${error.message}`);
      } else {
        console.error("\nAn unexpected error occurred");
      }
      process.exit(1);
    }
});

/*
npx hardhat give-rights --network sepolia 0x0d68B5eAE929d9CB2BEcd80098C90497e35E64b8
*/