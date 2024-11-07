"use client";

import React, { useState, useEffect } from "react";
import { ConnectButton, useAccount, useSmartAccount } from "@particle-network/connectkit";
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import { createPublicClient, http, parseUnits } from "viem";
import { optimismSepolia } from "viem/chains";
import Web3 from 'web3';
import { sendTransaction } from 'components/ConnectKit';

export default function Home() {
  const { address, isConnected, connector } = useAccount();
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCastingVote, setIsCastingVote] = useState<boolean>(false);

  // Log connection status
  useEffect(() => {
    if (isConnected) {
      console.log('Wallet connected:', address);
    }
  }, [isConnected, address]);

  const handleVoteClick = async () => {
    if (selectedProposal === null) {
      setErrorMessage("Please select a proposal before voting.");
      return;
    }

    if (!address) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }

    setErrorMessage(null);
    setIsCastingVote(true);

    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
      const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

      if (!contractAddress || !usdcAddress || !alchemyApiKey) {
        throw new Error("Missing environment variables");
      }

      // Create public client for reading contract state
      const publicClient = createPublicClient({
        chain: optimismSepolia,
        transport: http(`https://opt-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
      });

      // Check if voting has ended
      const votingEnded = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: [{
          name: "votingEnded",
          type: "function",
          inputs: [],
          outputs: [{ type: "bool" }],
          stateMutability: "view"
        }],
        functionName: "votingEnded",
      });

      if (votingEnded) {
        throw new Error("Voting has ended");
      }

      // Check if user has already voted
      const voterInfo = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: [{
          name: "voters",
          type: "function",
          inputs: [{ name: "voter", type: "address" }],
          outputs: [{
            type: "tuple",
            components: [
              { name: "weight", type: "uint256" },
              { name: "voted", type: "bool" },
              { name: "vote", type: "uint256" },
              { name: "hasClaimedRefund", type: "bool" }
            ]
          }],
          stateMutability: "view"
        }],
        functionName: "voters",
        args: [address as `0x${string}`]
      }) as { weight: bigint; voted: boolean; vote: bigint; hasClaimedRefund: boolean; };

      if (voterInfo.voted) {
        throw new Error("You have already voted");
      }

      // Setup Web3 with Particle's AA provider in Gasless mode
      const aaProvider = new AAWrapProvider(
        connector,
        SendTransactionMode.Gasless
      );
      const web3 = new Web3(aaProvider as any);

      // USDC Approval with high amount
      const approveData = web3.eth.abi.encodeFunctionCall({
        name: 'approve',
        type: 'function',
        inputs: [
          { type: 'address', name: 'spender' },
          { type: 'uint256', name: 'amount' }
        ]
      }, [contractAddress, parseUnits("1000000", 6).toString()]);

      const approveTx = await sendTransaction(address, {
        to: usdcAddress,
        data: approveData
      });

      console.log('Approval transaction hash:', approveTx);

      // Cast the vote
      const voteData = web3.eth.abi.encodeFunctionCall({
        name: 'vote',
        type: 'function',
        inputs: [
          { type: 'uint256', name: 'proposalId' }
        ]
      }, [selectedProposal]);

      const voteTx = await sendTransaction(address, {
        to: contractAddress,
        data: voteData
      });

      console.log('Vote transaction hash:', voteTx);
      alert('Vote cast successfully!');
    } catch (error: any) {
      console.error('Transaction error:', error);
      const errorMessage = error?.message || "Transaction failed";
      
      // Handle specific error cases
      if (errorMessage.includes("Voting has ended")) {
        setErrorMessage("Voting period has ended");
      } else if (errorMessage.includes("already voted")) {
        setErrorMessage("You have already cast your vote");
      } else {
        setErrorMessage(errorMessage);
      }
    } finally {
      setIsCastingVote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Gym Class Vote: Muay Thai vs Kickboxing
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center mb-6">
            <ConnectButton />
          </div>

          {isConnected ? (
            <>
              <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold">Cast your vote here.</h2>
              </div>

              <div className="mt-6">
                <label htmlFor="proposal-select" className="block text-lg font-medium text-gray-700 mb-2">
                  Select Class:
                </label>
                <select
                  id="proposal-select"
                  value={selectedProposal ?? ""}
                  onChange={(e) => setSelectedProposal(parseInt(e.target.value))}
                  className="block w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="" disabled>Click to select</option>
                  <option value="0">Muay Thai</option>
                  <option value="1">Kickboxing</option>
                </select>
              </div>

              <button
                onClick={handleVoteClick}
                disabled={isCastingVote}
                className="mt-6 w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isCastingVote ? "Casting vote..." : "Cast Vote"}
              </button>

              {errorMessage && (
                <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
              )}
            </>
          ) : (
            <p className="mt-6 text-center text-gray-500">
              Please connect your wallet to vote
            </p>
          )}
        </div>
      </div>
    </div>
  );
}