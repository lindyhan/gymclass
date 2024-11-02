import React from 'react';

interface ResultSectionProps {
  winner: string;
  onClaimRefund: () => Promise<void>;
  loading: boolean;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  winner,
  onClaimRefund,
  loading
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Voting has ended! Winner: {winner}
      </h2>
      <button
        onClick={onClaimRefund}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-4 rounded disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : 'Claim Refund (if eligible)'}
      </button>
    </div>
  );
};