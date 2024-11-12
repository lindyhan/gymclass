import { ethers } from "ethers";
import { parseUnits } from "viem";
import { AAWrapProvider, SendTransactionMode, SmartAccount } from '@particle-network/aa';
import Web3 from "web3";
import type { SupportedProviders } from 'web3';
import { TransactionState } from "@/interfaces/types";
import { AbiItem } from "web3-utils";

const ERC20_ABI: AbiItem[] = [
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

const VOTING_ABI: AbiItem[] = [
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

interface VotingFormProps {
    selectedProposal: number | null;
    address: string;
    primaryWallet: { connector: { getProvider: () => Promise<ethers.providers.ExternalProvider> } };
    smartAccount: SmartAccount;
    setSelectedProposal: React.Dispatch<React.SetStateAction<number | null>>;
    setTxState: React.Dispatch<React.SetStateAction<TransactionState>>;
    txState: TransactionState;
}

export const VotingForm = ({
    selectedProposal,
    address,
    primaryWallet,
    smartAccount,
    setSelectedProposal,
    setTxState,
    txState,
}: VotingFormProps) => {

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
            const amount = parseUnits("10", 6); // 10 USDC (6 decimals)

            const provider = await primaryWallet.connector.getProvider();
            const eoaProvider = new ethers.providers.Web3Provider(provider, 'any');
            const signer = eoaProvider.getSigner();
            const smartAccountAddress = await smartAccount.getAddress();

            const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);

            setTxState(prev => ({ ...prev, step: 1 }));
            const currentAllowance = await usdcContract.allowance(address, smartAccountAddress);
            
            if (currentAllowance.lt(amount)) {
                const approveTx = await usdcContract.approve(smartAccountAddress, amount);
                await approveTx.wait();
            }

            setTxState(prev => ({ ...prev, step: 2 }));
            const transferTx = await usdcContract.transfer(smartAccountAddress, amount);
            await transferTx.wait();

            setTxState(prev => ({ ...prev, step: 3 }));
            const wrapProvider = new AAWrapProvider(smartAccount, SendTransactionMode.Gasless);
            const web3 = new Web3(wrapProvider as unknown as SupportedProviders);
            
            await executeSmartAccountTransaction(
                web3,
                usdcAddress,
                ERC20_ABI,
                'transfer', // Specify the method name
                contractAddress,
                amount.toString()
            );
            
            setTxState(prev => ({ ...prev, step: 4 }));
            
            await executeSmartAccountTransaction(
                web3,
                contractAddress,
                VOTING_ABI,
                'vote', 
                selectedProposal
            );            

            alert('Vote cast successfully!');
        } catch (error: unknown) {
            setTxState(prev => ({
                ...prev,
                error: `Transaction failed: ${(error as Error).message || "Unknown error"}`
            }));
        } finally {
            setTxState(prev => ({ ...prev, isProcessing: false, step: 0 }));
            setSelectedProposal(null);
        }
    };

    return (
        <button
            onClick={handleVoteClick}
            disabled={!selectedProposal}
            className="mt-6 w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
            {txState.isProcessing ? getStepMessage(txState.step) : "Cast Vote"}
        </button>
    );
};

function getContractAddresses() {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
    if (!contractAddress || !usdcAddress) {
        throw new Error("Missing contract or USDC address configuration");
    }
    return { contractAddress, usdcAddress };
}

function getStepMessage(step: number) {
    switch (step) {
        case 1: return "Approving USDC...";
        case 2: return "Transferring USDC to smart account...";
        case 3: return "Transferring USDC to voting contract...";
        case 4: return "Casting vote...";
        default: return "Processing...";
    }
}

async function executeSmartAccountTransaction(
    web3: Web3,
    to: string,
    abi: AbiItem[],
    methodName: string,
    ...methodArgs: unknown[]
) {
    const contract = new web3.eth.Contract(abi, to);
    const method = contract.methods[methodName](...methodArgs);
    return method.send({ from: (await web3.eth.getAccounts())[0] });
}

export default VotingForm;