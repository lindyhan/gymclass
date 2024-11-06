import { createPublicClient, http } from "viem";
import { optimismSepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/GymVote.sol/GymVote.json";
import * as dotenv from "dotenv";
dotenv.config();

const { CONTRACT_ADDRESS } = process.env;

if (!CONTRACT_ADDRESS) {
  throw new Error("Missing CONTRACT_ADDRESS in environment variables.");
}

const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(`https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

async function queryResults() {
  try {
    // Check voting status
    const votingEnded: boolean = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "votingEnded",
    }) as boolean;

    const statusMessage = votingEnded ? "Voting has ended" : "Voting is live";
    console.log("Voting Status:", statusMessage);

    // Fetch vote counts for the proposals using getProposalVotes
    const muayThaiVotes: bigint = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "getProposalVotes",
      args: [0], // Assuming 0 corresponds to Muay Thai
    }) as bigint; // Cast to bigint

    const kickboxingVotes: bigint = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "getProposalVotes",
      args: [1], // Assuming 1 corresponds to Kickboxing
    }) as bigint; // Cast to bigint

    // Determine the winner
    const winner =
      muayThaiVotes > kickboxingVotes
        ? "Muay Thai"
        : kickboxingVotes > muayThaiVotes
        ? "Kickboxing"
        : "It's a tie!";

    // Output the results
    console.log(`Muay Thai: ${muayThaiVotes} votes`);
    console.log(`Kickboxing: ${kickboxingVotes} votes`);
    console.log(`Winner name: ${winner}`);
  } catch (error) {
    console.error("Error querying results:", error);
  }
}

// Execute the query results function
queryResults();

/*
npx ts-node scripts/queryResults.ts

Terminal output
Muay Thai: 0 votes
Kickboxing: 1 votes
Winner name: Kickboxing
*/