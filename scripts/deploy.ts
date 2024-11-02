import { createPublicClient, http, createWalletClient, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi, bytecode } from "../artifacts/contracts/GymVote.sol/GymVote.json";

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;
  const usdcAddress = process.env.USDC_ADDRESS as string;

  if (!usdcAddress) {
    throw new Error("USDC_ADDRESS not found in environment variables");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: http(),
    account
  });

  // Convert proposal names to bytes32
  const proposals = [
    toHex("Muay Thai", { size: 32 }),
    toHex("Kickboxing", { size: 32 })
  ];

  console.log("Deploying: Gym Class - Muay Thai or Kickboxing? contract...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [proposals, usdcAddress]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contract deployed to:", receipt.contractAddress);
}

main().catch(console.error);