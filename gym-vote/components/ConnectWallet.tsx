import { ConnectButton } from "@particle-network/connectkit";

export const ConnectWallet = ({ isConnected }: { isConnected: boolean }) => {
    return (
        <div className="flex justify-center mb-6">
            {isConnected ? (
                <ConnectButton />
            ) : (
                <div>
                    <p className="text-gray-600 mb-4">Connect your wallet or wait for auto-connection...</p>
                    <ConnectButton />
                </div>
            )}
        </div>
    );
};