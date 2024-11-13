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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "proposal",
                "type": "uint256"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "votingEnded",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
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
                console.log('Approving USDC for voting contract...');
                const approveTx = await usdcContract.approve(smartAccountAddress, amount);
                await approveTx.wait();
                console.log('Approval complete');
            }

            setTxState(prev => ({ ...prev, step: 2 }));
            const transferTx = await usdcContract.transfer(smartAccountAddress, amount);
            await transferTx.wait();
            console.log(`Casting vote for proposal ${selectedProposal}...`);

            setTxState(prev => ({ ...prev, step: 3 }));
            const wrapProvider = new AAWrapProvider(smartAccount, SendTransactionMode.Gasless);
            const web3 = new Web3(wrapProvider as unknown as SupportedProviders);

            console.log('Approving USDC spend for voting contract...');
            await executeSmartAccountTransaction(
                web3,
                usdcAddress,
                ERC20_ABI,
                'approve',
                100000,
                contractAddress,
                amount.toString()
            );
            
            setTxState(prev => ({ ...prev, step: 4 }));
            console.log(`Attempting to cast vote for proposal: ${selectedProposal}`);

            await executeSmartAccountTransaction(
                web3,
                contractAddress,
                VOTING_ABI,
                'vote', 
                100000,
                selectedProposal
            );            

            alert('Vote cast successfully!');
        } catch (error: unknown) {
            console.error('Detailed error:', error);
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
            disabled={selectedProposal === null}
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
        case 1: return "Approving USDC to smart account...";
        case 2: return "Transferring USDC to smart account...";
        case 3: return "Approving USDC for voting...";
        case 4: return "Casting vote...";
        default: return "Processing...";
    }
}



async function executeSmartAccountTransaction(
    web3: Web3,
    to: string,
    abi: AbiItem[],
    methodName: string,
    gasLimit: number = 100000,
    ...methodArgs: unknown[]
) {
    const contract = new web3.eth.Contract(abi, to);
    const method = contract.methods[methodName](...methodArgs);
    console.log(`Executing ${methodName} with args:`, methodArgs);
    return method.send({ 
        from: (await web3.eth.getAccounts())[0],
        gas: gasLimit.toString()
     });
}

export default VotingForm;