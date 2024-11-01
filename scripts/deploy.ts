import { createPublicClient, http, createWalletClient, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;
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
    toHex("White Christmas", { size: 32 }),
    toHex("Green Christmas", { size: 32 })
  ];

  console.log("Deploying Ballot contract...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [proposals]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Contract deployed to:", receipt.contractAddress);
}

main().catch(console.error);


/*
npx hardhat run scripts/deploy.ts --network sepolia

Save the contract address output and add it to your .env file as CONTRACT_ADDRESS
*/