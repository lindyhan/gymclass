import { createPublicClient, http, hexToString } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS as string;

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  });

  const winningProposalIndex = await publicClient.readContract({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: 'winningProposal'
  });

  const winnerName = await publicClient.readContract({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: 'winnerName'
  });

  console.log("Winning proposal index:", winningProposalIndex);
  console.log("Winner name:", hexToString(winnerName as `0x${string}`, { size: 32 }));

  // Get vote counts for all proposals
  const proposals = ["White Christmas", "Green Christmas"];
  for (let i = 0; i < proposals.length; i++) {
    const proposal = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName: 'proposals',
      args: [i]
    });
    console.log(`${proposals[i]}: ${(proposal as any).voteCount} votes`);
  }
}

main().catch(console.error);

//npx hardhat run scripts/queryResults.ts --network sepolia