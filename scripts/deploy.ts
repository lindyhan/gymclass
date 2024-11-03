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

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;
  const usdcAddress = process.env.USDC_ADDRESS as string;

  if (!usdcAddress) {
    throw new Error("USDC_ADDRESS not found in environment variables");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const currentNetwork = networks[network.name as keyof typeof networks];

  if (!currentNetwork) {
    throw new Error(`Unsupported network: ${network.name}`);
  }

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