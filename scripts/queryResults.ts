import { createPublicClient, http, hexToString } from "viem";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi } from "../artifacts/contracts/GymVote.sol/GymVote.json";

const networks = {
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
} as const;

// Function to get the appropriate public client and contract address
function getClientAndAddress(chainName: keyof typeof networks) {
  let contractAddress: string;

  switch (chainName) {
    case 'sepolia':
      contractAddress = process.env.SEPOLIA_CONTRACT_ADDRESS!;
      break;
    case 'arbitrumSepolia':
      contractAddress = process.env.ARBITRUM_SEPOLIA_CONTRACT_ADDRESS!;
      break;
    case 'optimismSepolia':
      contractAddress = process.env.OPTIMISM_SEPOLIA_CONTRACT_ADDRESS!;
      break;
    case 'baseSepolia':
      contractAddress = process.env.BASE_SEPOLIA_CONTRACT_ADDRESS!;
      break;
    default:
      throw new Error("Unsupported network");
  }

  const publicClient = createPublicClient({
    chain: networks[chainName],
    transport: http(networks[chainName].rpcUrls.default.http[0]),
  });

  return { publicClient, contractAddress };
}

async function main() {
  const hre = require("hardhat");
  const chainName = hre.network.name as keyof typeof networks;
  const { publicClient, contractAddress } = getClientAndAddress(chainName);

  const voteCounts: bigint[] = [];
  let totalVotes = BigInt(0);

  try {
    // Check proposals (assuming we have 2 fixed proposals)
    const proposalsToCheck = 2; // Update this number if you add more proposals
    const proposalNames = ["Muay Thai", "Kickboxing"]; // Assuming these are the proposal names

    for (let i = 0; i < proposalsToCheck; i++) {
      try {
        const proposal = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi,
          functionName: 'proposals',
          args: [i],
        });

        if (Array.isArray(proposal) && proposal.length >= 2) {
          const voteCount = proposal[1] as bigint;
          voteCounts.push(voteCount);
          totalVotes += voteCount;
          console.log(`${proposalNames[i]}: ${voteCount.toString()} votes`);
        } else {
          console.error(`Invalid proposal data for index ${i}`);
        }
      } catch (error) {
        console.error(`Failed to fetch proposal for index ${i}:`, error);
      }
    }

    // Determine the winner
    if (totalVotes === BigInt(0)) {
      console.log("Winner name: Not Applicable (tie)");
    } else {
      const uniqueVoteCounts = new Set(voteCounts);
      if (uniqueVoteCounts.size === 1) {
        console.log("Winner name: Not Applicable (tie)");
      } else {
        const maxVotes = Math.max(...voteCounts.map(Number));
        const winners = voteCounts
          .map((count, index) => (count === BigInt(maxVotes) ? proposalNames[index] : null))
          .filter(name => name !== null);

        console.log("Winner name:", winners.length > 1 ? "Not Applicable (tie)" : winners[0]);
      }
    }
  } catch (error) {
    console.error("Error during query:", error);
  }
}

main().catch(console.error);



//npx hardhat run scripts/queryResults.ts --network sepolia