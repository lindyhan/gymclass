import React from 'react';
import { useKlaster } from '../hooks/useKlaster';

interface VotingSectionProps {
  address: string;
  selectedProposal: number | null;
  setSelectedProposal: (proposal: number | null) => void;
  onVote: () => Promise<void>;
  loading: boolean;
}

export const VotingSection: React.FC<VotingSectionProps> = ({
  address,
  selectedProposal,
  setSelectedProposal,
  onVote,
  loading
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
      <p className="mb-4">Cost: 10 USDC</p>
      
      <div className="space-y-4">
        <button
          onClick={() => setSelectedProposal(0)}
          className={`w-full p-4 rounded ${
            selectedProposal === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Muay Thai
        </button>
        
        <button
          onClick={() => setSelectedProposal(1)}
          className={`w-full p-4 rounded ${
            selectedProposal === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Kickboxing
        </button>
        
        <button
          onClick={onVote}
          disabled={loading || selectedProposal === null}
          className="w-full bg-green-500 text-white p-4 rounded disabled:bg-gray-300"
        >
          {loading ? 'Processing...' : 'Submit Vote'}
        </button>
      </div>
    </div>
  );
};