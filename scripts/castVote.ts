import { task } from "hardhat/config";
import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
dotenv.config();

task("cast-vote", "Cast a vote for a proposal")
  .addPositionalParam("proposal", "The proposal index (0 for White Christmas, 1 for Green Christmas)")
  .setAction(async (taskArgs, hre) => {
    try {
      const artifactPath = join(__dirname, "../artifacts/contracts/Ballot.sol/Ballot.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
      
      const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
      const account = privateKeyToAccount(privateKey);
      const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
      const proposalIndex = parseInt(taskArgs.proposal);

      if (isNaN(proposalIndex)) {
        console.error("\nError: Invalid proposal index");
        process.exit(1);
      }

      if (proposalIndex !== 0 && proposalIndex !== 1) {
        console.error("\nError: Proposal index must be 0 (White Christmas) or 1 (Green Christmas)");
        process.exit(1);
      }

      // Create public client to check voter status
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http()
      });

      // Check if voter has rights and hasn't voted
      const voter = await publicClient.readContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'voters',
        args: [account.address]
      });

      const [weight, hasVoted] = voter as [bigint, boolean, string];

      if (weight === 0n) {
        console.error("\nError: You don't have voting rights");
        process.exit(1);
      }

      if (hasVoted) {
        console.error("\nError: You have already voted");
        process.exit(1);
      }

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(),
        account
      });

      console.log(`\nCasting vote for proposal ${proposalIndex}...`);
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'vote',
        args: [proposalIndex]
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
npx hardhat cast-vote --network sepolia 0
*/