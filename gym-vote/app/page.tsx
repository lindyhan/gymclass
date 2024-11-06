"use client";

import React, { useState } from "react";
import { ConnectButton, useAccount } from "@particle-network/connectkit";
import { AAWrapProvider, SendTransactionMode, SendTransactionEvent } from '@particle-network/aa';
import Web3 from 'web3';

export default function Home() {
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCastingVote, setIsCastingVote] = useState<boolean>(false);
  const { address, isConnected, smartAccount } = useAccount(); // Use the Particle Connect hook

  const handleProposalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProposal(parseInt(event.target.value));
  };

  const handleVoteClick = async () => {
    if (selectedProposal === null) {
      setErrorMessage("Please select a proposal before voting.");
      return;
    }

    setErrorMessage(null);
    setIsCastingVote(true);

    try {
      // Fetch the contract address from environment variables
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; // Access the contract address from .env

      if (!contractAddress) {
        throw new Error("Contract address not found in environment variables.");
      }

      // Setup the AAWrapProvider for transaction handling
      const wrapProvider = new AAWrapProvider(smartAccount, SendTransactionMode.UserPaidNative); // or Gasless or UserSelect
      const web3 = new Web3(wrapProvider);

      // Replace with the correct ABI and method to call your voting function
      const tx = {
        to: contractAddress, // Your deployed contract address
        data: "<transaction-data>", // Add the correct ABI-encoded data for casting a vote
        value: "0", // Adjust based on whether you need to send native currency or not
      };

      // If UserSelect mode, handle the fee quotes
      if (SendTransactionMode.UserSelect) {
        wrapProvider.once(SendTransactionEvent.Request, (feeQuotesResult) => {
          wrapProvider.resolveSendTransaction({
            feeQuote: feeQuotesResult.tokenPaymaster.feeQuote[0],
            tokenPaymasterAddress: feeQuotesResult.tokenPaymaster.tokenPaymasterAddress,
          });

          wrapProvider.resolveSendTransaction(feeQuotesResult.verifyingPaymasterNative);

          if (feeQuotesResult.verifyingPaymasterGasless) {
            wrapProvider.resolveSendTransaction(feeQuotesResult.verifyingPaymasterGasless);
          }
        });
      }

      // Send the transaction
      await web3.eth.sendTransaction(tx);

      alert('Vote cast successfully!');
    } catch (error) {
      setErrorMessage("Error: " + error.message);
    } finally {
      setIsCastingVote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Gym Class Vote: Muay Thai vs Kickboxing
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <ConnectButton />

          {isConnected ? (
            <>
              <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold">Connected as: {address}</h2>
              </div>

              <div className="mt-6">
                <label htmlFor="proposal-select" className="block text-lg font-medium text-gray-700 mb-2">
                  Muay Thai or Kickboxing:
                </label>
                <select
                  id="proposal-select"
                  value={selectedProposal ?? ""}
                  onChange={handleProposalChange}
                  className="block w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="" disabled>
                    Click to select
                  </option>
                  <option value="0">Muay Thai</option>
                  <option value="1">Kickboxing</option>
                </select>
              </div>

              <button
                onClick={handleVoteClick}
                className="mt-6 w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                disabled={isCastingVote}
              >
                {isCastingVote ? "Casting vote..." : "Cast Vote"}
              </button>

              {errorMessage && (
                <div className="text-red-500 mt-4 text-center">{errorMessage}</div>
              )}
            </>
          ) : (
            <p className="mt-6 text-center text-gray-500">Connecting your wallet to vote...</p>
          )}
        </div>
      </div>
    </div>
  );
}