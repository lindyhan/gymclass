import { ConnectButton } from "@particle-network/connectkit";

export const ConnectWallet = ({ isConnected }: { isConnected: boolean }) => {
    return (
        <div className="flex justify-center mb-6">
            {isConnected ? (
                <ConnectButton />
            ) : (
                <div>
                    <p className="text-gray-600 mb-4">Please connect your wallet to vote</p>
                    <ConnectButton />
                </div>
            )}
        </div>
    );
};