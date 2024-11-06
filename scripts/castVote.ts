import { createPublicClient, http, createWalletClient, parseUnits } from "viem";
import { optimismSepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/GymVote.sol/GymVote.json";
import * as dotenv from "dotenv";
dotenv.config();

export const castVote = async (proposalId: number, userAddress: string, userSigner: any) => {
  try {
    const { CONTRACT_ADDRESS, USDC_ADDRESS, ALCHEMY_API_KEY } = process.env;

    if (!CONTRACT_ADDRESS || !USDC_ADDRESS || !ALCHEMY_API_KEY) {
      throw new Error("Missing environment variables in .env");
    }

    // Create a public client for reading state (doesn't send transactions)
    const publicClient = createPublicClient({
      chain: optimismSepolia,
      transport: http(`https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    });

    // Use the user's signer for the wallet client to send transactions
    const walletClient = createWalletClient({
      chain: optimismSepolia,
      transport: userSigner,
      account: userAddress as `0x${string}`,
    });

    // Check if voting has ended
    const votingEnded = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "votingEnded",
    });

    if (votingEnded) {
      throw new Error("Voting has ended. Transaction aborted.");
    }

    // Check if the user has already voted
    const voterInfo = await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "voters",
      args: [userAddress],
    }) as { weight: number; voted: boolean; vote: number; hasClaimedRefund: boolean; };

    if (voterInfo.voted) {
      throw new Error("User has already voted. Transaction aborted.");
    }

    // Approve infinite USDC spend for voting from the user's wallet (max uint256)
    const approvalHash = await walletClient.writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: [
        {
          name: "approve",
          type: "function",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ type: "bool" }],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "approve",
      args: [CONTRACT_ADDRESS as `0x${string}`, parseUnits("1000000", 6)], // Infinite approval (change 1000000 to a high enough number if required)
      account: userAddress as `0x${string}`, // Use the user's address to send from their wallet
    });

    await publicClient.waitForTransactionReceipt({ hash: approvalHash });

    // Cast the vote using the user's wallet
    const voteHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "vote",
      args: [BigInt(proposalId)],
      account: userAddress as `0x${string}`, // Send the vote from the user's wallet
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: voteHash });

    if (!receipt.status) {
      throw new Error("Vote transaction failed");
    }

    return { transactionHash: voteHash, receipt };
  } catch (error: any) {
    const errorReason = 
      error.message.includes("Voting has ended") ? "VotingEnded" :
      error.message.includes("User has already voted") ? "AlreadyVoted" :
      error.message.includes("Vote transaction failed") ? "VoteTransactionFailed" :
      "UnknownError";

    console.error("Error casting vote:", error.message || error);
    throw new Error(JSON.stringify({ message: "Failed to cast vote", reason: errorReason }));
  }
};