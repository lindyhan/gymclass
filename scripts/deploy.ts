import { createPublicClient, http, createWalletClient, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { network } from "hardhat";
import { sepolia, arbitrumSepolia, optimismSepolia, baseSepolia} from "viem/chains"
import * as dotenv from "dotenv";
dotenv.config();
import { abi, bytecode } from "../artifacts/contracts/GymVote.sol/GymVote.json";

const networks = {
  sepolia, arbitrumSepolia, optimismSepolia, baseSepolia,
} as const;

function getUSDCAddress(networkName: string): `0x${string}` {
  switch (networkName) {
    case 'sepolia':
      return process.env.SEPOLIA_USDC_ADDRESS as `0x${string}`;
    case 'arbitrumSepolia':
      return process.env.ARBITRUM_SEPOLIA_USDC_ADDRESS as `0x${string}`;
    case 'optimismSepolia':
      return process.env.OPTIMISM_SEPOLIA_USDC_ADDRESS as `0x${string}`;
    case 'baseSepolia':
      return process.env.BASE_SEPOLIA_USDC_ADDRESS as `0x${string}`;
    default:
      throw new Error(`Unsupported network: ${networkName}`);
  }
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;

  const currentNetwork = networks[network.name as keyof typeof networks];
  if (!currentNetwork) {
    throw new Error(`Unsupported network: ${network.name}`);
  }
  const usdcAddress = getUSDCAddress(network.name);
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: currentNetwork,
    transport: http(currentNetwork.rpcUrls.default.http[0]),
  });

  const walletClient = createWalletClient({
    chain: currentNetwork,
    transport: http(currentNetwork.rpcUrls.default.http[0]),
    account
  });

  // Convert proposal names to bytes32
  const proposals = [
    toHex("Muay Thai", { size: 32 }),
    toHex("Kickboxing", { size: 32 })
  ];

  console.log(`Deploying Gym Class contract to ${currentNetwork.name}...`);
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [proposals, usdcAddress]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contract deployed to:", receipt.contractAddress);
}

main().catch(console.error);

//npx hardhat run scripts/deploy.ts --network arbitrumSepolia