"use client";
import React, { useState } from "react";
import { useAccount, useSmartAccount, useWallets } from "@particle-network/connectkit";
import { ConnectWallet } from '@/components/ConnectWallet';
import { ProposalSelector } from '@/components/ProposalSelector';
import { TransactionStatus } from '@/components/TransactionStatus';
import { VotingForm } from 'components/VotingForm';
import { TransactionState } from "@/interfaces/types";
import { ExternalProvider } from "@ethersproject/providers";

export default function Home() {
    const { address, isConnected } = useAccount();
    const smartAccount = useSmartAccount();
    const [primaryWallet] = useWallets();
    const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
    const [txState, setTxState] = useState<TransactionState>({
        isProcessing: false,
        error: null,
        step: 0
    });

    const userAddress = address || "";
    const validSmartAccount = smartAccount !== null;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-3xl w-full">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Gym Class Vote: Muay Thai vs Kickboxing
                </h1>

                <div className="bg-white shadow rounded-lg p-6">
                    <ConnectWallet isConnected={isConnected} />
                    
                    {isConnected && (
                        <>
                            <div className="mt-6 text-center">
                                <h2 className="text-xl font-semibold">Cast your vote here</h2>
                                <p className="text-sm text-gray-600 mt-2">
                                    Your Wallet: {address}
                                </p>
                            </div>
                            
                            <ProposalSelector 
                                selectedProposal={selectedProposal}
                                setSelectedProposal={setSelectedProposal}
                                isProcessing={txState.isProcessing}
                            />

{validSmartAccount && primaryWallet && (
                                <VotingForm 
                                    selectedProposal={selectedProposal} 
                                    address={userAddress}
                                    primaryWallet={{
                                        connector: {
                                            getProvider: async () => {
                                                // Ensure the provider meets the expected type
                                                const provider = await primaryWallet.connector.getProvider();
                                                if (provider) return provider as ExternalProvider;
                                                throw new Error("Unable to retrieve provider");
                                            }
                                        }
                                    }}
                                    smartAccount={smartAccount}
                                    setSelectedProposal={setSelectedProposal}
                                    setTxState={setTxState}
                                    txState={txState}
                                />
                            )}
                            
                            <TransactionStatus txState={txState} />

                            {txState.error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-center">
                                    {txState.error}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
