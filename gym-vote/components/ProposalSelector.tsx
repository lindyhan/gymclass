interface ProposalSelectorProps {
    selectedProposal: number | null;
    setSelectedProposal: React.Dispatch<React.SetStateAction<number | null>>;
    isProcessing: boolean;
}

export const ProposalSelector = ({
    selectedProposal,
    setSelectedProposal,
    isProcessing,
}: ProposalSelectorProps) => {
    return (
        <div className="mt-6">
            <label
                htmlFor="proposal-select"
                className="block text-lg font-medium text-gray-700 mb-2"
            >
                Select Class:
            </label>
            <select
                id="proposal-select"
                value={selectedProposal ?? ""}
                onChange={(e) => setSelectedProposal(parseInt(e.target.value))}
                className="block w-full p-2 border border-gray-300 rounded-lg"
                disabled={isProcessing}
            >
                <option value="">Click to select</option>
                <option value="0">Muay Thai</option>
                <option value="1">Kickboxing</option>
            </select>
        </div>
    );
};