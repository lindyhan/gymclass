'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from '@particle-network/connectkit';
import { ConnectButton } from '@particle-network/connectkit';
import { createPublicClient, custom, parseAbi, encodeFunctionData, http } from 'viem';
import { sepolia } from 'viem/chains';
import { VotingSection } from '../components/VotingSection';
import { ResultSection } from '../components/ResultSection';
import { useKlaster } from '../hooks/useKlaster';

declare global {
    interface Window {
        ethereum: any;
    }
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const GymVotePage = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();  // No 'connectors' needed here
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [votingEnded, setVotingEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const { loading, approveUSDC } = useKlaster(address);
  const [publicClient, setPublicClient] = useState<any>(null);

  useEffect(() => {
    // Setup custom transport without HttpTransport type directly
    const alchemyURL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
      console.error("Alchemy API key is missing. Set it in your .env file.");
      return;
    }

    if (typeof window !== 'undefined' && window.ethereum) {
      setPublicClient(createPublicClient({
        chain: sepolia,
        transport: http()
      }));
    } else {
      console.error("Ethereum object not found, ensure MetaMask or another wallet is installed.");
    }
  }, []);

  // Auto-connect to wallet on load if previously connected
  useEffect(() => {
    const previouslyConnected = localStorage.getItem('isConnected');
    if (previouslyConnected === 'true' && !isConnected) {
      // Attempting to reconnect on load
      connect({});  // Ensure empty object passed if no parameters required
    }
  }, [isConnected, connect]);

  // Store connected status in localStorage
  useEffect(() => {
    if (isConnected) {
      localStorage.setItem('isConnected', 'true');
    } else {
      localStorage.removeItem('isConnected');
    }
  }, [isConnected]);

  async function castVote(proposalIndex: number) {
    try {
      const response = await fetch('/api/cast-vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proposal: proposalIndex })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error("Error casting vote:", errorText);
          alert("Failed to cast vote");
      } else {
          const resultText = await response.text();
          console.log("Vote successful:", resultText);
          alert("Vote cast successfully!");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while casting vote");
    }
  }

  const handleVote = async () => {
    if (!address || selectedProposal === null || !publicClient) return;
    
    try {
      const approved = await approveUSDC();
      if (!approved) {
        throw new Error('USDC approval failed');
      }

      const voteData = encodeFunctionData({
        abi: parseAbi(['function vote(uint256 proposal) external']),
        functionName: 'vote',
        args: [BigInt(selectedProposal)]
      });

      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: CONTRACT_ADDRESS,
          data: voteData
        }]
      });

      await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` });
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error casting vote');
    }
  };

  const claimRefund = async () => {
    if (!address || !publicClient) return;
    
    try {
      const refundData = encodeFunctionData({
        abi: parseAbi(['function claimRefund() external']),
        functionName: 'claimRefund'
      });

      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: CONTRACT_ADDRESS,
          data: refundData
        }]
      });

      await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` });
      alert('Refund claimed successfully!');
    } catch (error) {
      console.error('Error claiming refund:', error);
      alert('Error claiming refund');
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
          
          {isConnected && !votingEnded && (
            <VotingSection
              address={address || ''}
              selectedProposal={selectedProposal}
              setSelectedProposal={setSelectedProposal}
              onVote={handleVote}
              loading={loading}
            />
          )}
          
          {votingEnded && winner && (
            <ResultSection
              winner={winner}
              onClaimRefund={claimRefund}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GymVotePage;
