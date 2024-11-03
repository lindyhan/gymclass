import { task } from "hardhat/config";
import { createPublicClient, http, createWalletClient, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
dotenv.config();

const networks = {
  sepolia, arbitrumSepolia, optimismSepolia, baseSepolia
} as const;

const USDC_DECIMALS = 6;
const VOTE_COST = 10n * 10n ** BigInt(USDC_DECIMALS); // 10 USDC (6 decimals)

const USDC_ADDRESSES = {
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  arbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  optimismSepolia: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
} as const;

function formatUSDC(amount: bigint): string {
  const whole = amount / 10n ** BigInt(USDC_DECIMALS);
  const fraction = amount % 10n ** BigInt(USDC_DECIMALS);
  const paddedFraction = fraction.toString().padStart(USDC_DECIMALS, '0');
  return `${whole}.${paddedFraction} USDC`;
}

function getContractAddress(networkName: string): `0x${string}` {
  if (networkName === 'sepolia') {
    return process.env.SEPOLIA_CONTRACT_ADDRESS as `0x${string}`;
  } else {
    return process.env.L2_CONTRACT_ADDRESS as `0x${string}`;
  }
}

function getUSDCAddress(networkName: keyof typeof USDC_ADDRESSES): `0x${string}` {
  return USDC_ADDRESSES[networkName] as `0x${string}`;
}

task("cast-vote", "Cast your vote")
  .addPositionalParam("proposal", "Vote 0 for Muay Thai, 1 for Kickboxing")
  .setAction(async (taskArgs, hre) => {
    const networkName = hre.network.name as keyof typeof networks;
    const currentNetwork = networks[networkName];
    const contractAddress = getContractAddress(networkName);
    const usdcAddress = getUSDCAddress(networkName as keyof typeof USDC_ADDRESSES);
    
    if (!contractAddress) {
      console.error(`\nError: Missing contract address for network ${networkName}`);
      process.exit(1);
    }

    try {
      const artifactPath = join(__dirname, "../artifacts/contracts/GymVote.sol/GymVote.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
      
      const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const proposalIndex = parseInt(taskArgs.proposal);

      console.log("Voter Address:", account.address);

      if (isNaN(proposalIndex)) {
        console.error("\nError: Invalid proposal index");
        process.exit(1);
      }

      const publicClient = createPublicClient({
        chain: currentNetwork,
        transport: http(currentNetwork.rpcUrls.default.http[0])
      });

      // Check if voting is active
      const votingEnded = await publicClient.readContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'votingEnded',
        args: []
      });

      if (votingEnded) {
        console.error("\nError: Voting has ended");
        process.exit(1);
      }

      // Check voter status
      const voter = await publicClient.readContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'voters',
        args: [account.address]
      });

      const [weight, hasVoted] = voter as [bigint, boolean, string];
      console.log("Voter Weight:", weight.toString());
      console.log("Has Voted:", hasVoted);

      if (weight === 0n) {
        console.error("\nError: You don't have voting rights");
        process.exit(1);
      }

      if (hasVoted) {
        console.error("\nError: You have already voted");
        process.exit(1);
      }

      // Check USDC balance and allowance
      const tokenBalance = await publicClient.readContract({
        address: usdcAddress,
        abi: parseAbi(['function balanceOf(address owner) view returns (uint256)']),
        functionName: 'balanceOf',
        args: [account.address]
      });
      
      const tokenAllowance = await publicClient.readContract({
        address: usdcAddress,
        abi: parseAbi(['function allowance(address owner, address spender) view returns (uint256)']),
        functionName: 'allowance',
        args: [account.address, contractAddress]
      });

      if (tokenBalance < VOTE_COST) {
        console.error(`\nError: Insufficient USDC balance. Need ${formatUSDC(VOTE_COST)}`);
        process.exit(1);
      }

      const walletClient = createWalletClient({
        chain: currentNetwork,
        transport: http(currentNetwork.rpcUrls.default.http[0]),
        account
      });

      if (tokenAllowance < VOTE_COST) {
        console.log("\nResetting and approving USDC allowance...");
        if (tokenAllowance > 0n) {
          const resetHash = await walletClient.writeContract({
            address: usdcAddress,
            abi: parseAbi(['function approve(address spender, uint256 amount) returns (bool)']),
            functionName: 'approve',
            args: [contractAddress, 0n]
          });
          await publicClient.waitForTransactionReceipt({ hash: resetHash });
        }

        const approvalHash = await walletClient.writeContract({
          address: usdcAddress,
          abi: parseAbi(['function approve(address spender, uint256 amount) returns (bool)']),
          functionName: 'approve',
          args: [contractAddress, VOTE_COST]
        });
        await publicClient.waitForTransactionReceipt({ hash: approvalHash });

        console.log("USDC approved successfully.");
      }

      console.log(`\nCasting vote for proposal ${proposalIndex}...`);
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'vote',
        args: [proposalIndex]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Vote cast successfully!");
      console.log("Transaction hash:", hash);

    } catch (error) {
      console.error(`\nError: ${error.message}`);
      process.exit(1);
    }
});

/*
npx hardhat cast-vote --network arbitrumSepolia 
*/