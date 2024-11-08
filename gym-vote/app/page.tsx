"use client";

import React, { useState } from "react";
import { 
    ConnectButton, 
    useAccount, 
    useSmartAccount,
    useWallets
} from "@particle-network/connectkit";
import { parseUnits } from "viem";
import { ethers } from 'ethers';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import Web3 from "web3";

const ERC20_ABI = [
    {
        constant: true,
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" }
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    }
];

const VOTING_ABI = [
    {
        constant: false,
        inputs: [{ name: "proposalId", type: "uint256" }],
        name: "vote",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    }
];

interface TransactionState {
    isProcessing: boolean;
    error: string | null;
    step: number;
}

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

    const getContractAddresses = () => {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;

        if (!contractAddress || !usdcAddress) {
            throw new Error("Missing contract or USDC address configuration");
        }

        return { contractAddress, usdcAddress };
    };

    const executeSmartAccountTransaction = async (
        web3: Web3,
        to: string,
        data: string,
        from: string
    ) => {
        try {
            // Get gas estimate first
            const gasEstimate = await web3.eth.estimateGas({
                from,
                to,
                data,
                value: '0x0'
            });

            // Convert the gas estimate to a BigInt and add 20% buffer
            const gasBuffer = BigInt(Math.floor(Number(gasEstimate) * 1.2));
            
            // Execute transaction with estimated gas
            return web3.eth.sendTransaction({
                from,
                to,
                data,
                value: '0x0',
                gas: gasBuffer.toString() // Convert BigInt to string for web3
            });
        } catch (error) {
            console.error('Gas estimation error:', error);
            throw error;
        }
    };

    const handleVoteClick = async () => {
        if (selectedProposal === null) {
            setTxState(prev => ({ ...prev, error: "Please select a proposal before voting." }));
            return;
        }

        if (!address || !smartAccount) {
            setTxState(prev => ({ ...prev, error: "Please connect your wallet first." }));
            return;
        }

        setTxState({ isProcessing: true, error: null, step: 0 });

        try {
            const { contractAddress, usdcAddress } = getContractAddresses();
            const amount = parseUnits("0.10", 6); // 10 USDC (6 decimals)

            // Get EOA provider and signer
            const provider = await primaryWallet.connector.getProvider() as ethers.providers.ExternalProvider;
            const eoaProvider = new ethers.providers.Web3Provider(provider, 'any');
            const signer = eoaProvider.getSigner();
            const smartAccountAddress = await smartAccount.getAddress();

            // Initialize USDC contract with full ABI
            const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);

            try {
                // Step 1: Check and approve USDC spend
                setTxState(prev => ({ ...prev, step: 1 }));
                const currentAllowance = await usdcContract.allowance(address, smartAccountAddress);
                
                if (currentAllowance.lt(amount)) {
                    console.log("Approving USDC...");
                    const approveTx = await usdcContract.approve(smartAccountAddress, amount);
                    await approveTx.wait();
                    console.log("USDC approved");
                }

                // Step 2: Transfer USDC from EOA to smart account
                setTxState(prev => ({ ...prev, step: 2 }));
                console.log("Transferring USDC to smart account...");
                const transferTx = await usdcContract.transfer(smartAccountAddress, amount);
                await transferTx.wait();
                console.log("USDC transferred to smart account");

                // Step 3: Initialize AAWrapProvider for gasless transactions
                setTxState(prev => ({ ...prev, step: 3 }));
                const wrapProvider = new AAWrapProvider(smartAccount, SendTransactionMode.Gasless);
                const web3 = new Web3(wrapProvider as any);
                await web3.eth.sendTransaction({
                    from: smartAccountAddress,
                    to: contractAddress,
                    value: '0x0'
                });
                console.log("123123");

                // Prepare USDC transfer to contract transaction
                const usdcInterface = new ethers.utils.Interface(ERC20_ABI);
                const transferToContractData = usdcInterface.encodeFunctionData('transfer', [
                    contractAddress,
                    amount.toString() // Convert BigNumber to string
                ]);

                console.log("Transferring USDC from smart account to contract...");
                await executeSmartAccountTransaction(
                    web3,
                    usdcAddress,
                    transferToContractData,
                    smartAccountAddress
                );
                
                console.log("USDC transferred to contract");

                // Step 4: Cast vote using smart account
                setTxState(prev => ({ ...prev, step: 4 }));
                console.log("Casting vote...");
                const votingInterface = new ethers.utils.Interface(VOTING_ABI);
                const voteData = votingInterface.encodeFunctionData('vote', [selectedProposal]);

                await executeSmartAccountTransaction(
                    web3,
                    contractAddress,
                    voteData,
                    smartAccountAddress
                );
                console.log("Vote cast successfully");

                alert('Vote cast successfully!');
            } catch (error: any) {
                console.error('Contract interaction error:', error);
                throw new Error(error?.message || "Contract interaction failed");
            }
        } catch (error: any) {
            console.error('Transaction error:', error);
            setTxState(prev => ({
                ...prev,
                error: `Transaction failed: ${error?.message || "Unknown error"}`
            }));
        } finally {
            setTxState(prev => ({ ...prev, isProcessing: false, step: 0 }));
            setSelectedProposal(null); // Reset proposal selection after voting
        }
    };

    const getStepMessage = (step: number) => {
        switch (step) {
            case 1: return "Approving USDC...";
            case 2: return "Transferring USDC to smart account...";
            case 3: return "Transferring USDC to voting contract...";
            case 4: return "Casting vote...";
            default: return "Processing...";
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
                        {isConnected ? (
                            <ConnectButton />
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-4">Please connect your wallet to vote</p>
                                <ConnectButton />
                            </div>
                        )}
                    </div>

                    {isConnected && (
                        <>
                            <div className="mt-6 text-center">
                                <h2 className="text-xl font-semibold">Cast your vote here</h2>
                                <p className="text-sm text-gray-600 mt-2">
                                    Your Wallet: {address}
                                </p>
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
                                    disabled={txState.isProcessing}
                                >
                                    <option value="">Click to select</option>
                                    <option value="0">Muay Thai</option>
                                    <option value="1">Kickboxing</option>
                                </select>
                            </div>

                            <button
                                onClick={handleVoteClick}
                                disabled={txState.isProcessing || !selectedProposal}
                                className="mt-6 w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {txState.isProcessing ? getStepMessage(txState.step) : "Cast Vote"}
                            </button>

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