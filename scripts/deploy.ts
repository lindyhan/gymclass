import { createPublicClient, http, createWalletClient, toHex, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import { abi, bytecode } from "../artifacts/contracts/GymVote.sol/GymVote.json";

const USDC_ADDRESS = process.env.USDC_ADDRESS as `0x${string}`;

async function main() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in .env");
    if (!USDC_ADDRESS) throw new Error("USDC_ADDRESS not found in .env");

    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const publicClient = createPublicClient({
      chain: optimismSepolia,
      transport: http(optimismSepolia.rpcUrls.default.http[0]),
    });

    const walletClient = createWalletClient({
      chain: optimismSepolia,
      transport: http(optimismSepolia.rpcUrls.default.http[0]),
      account
    });

    // Convert proposal names to bytes32
    const proposals = [
      toHex("Muay Thai", { size: 32 }),
      toHex("Kickboxing", { size: 32 })
    ];

    console.log("Deploying GymVote contract...");
    console.log("Network:", optimismSepolia.name);

    const hash = await walletClient.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      args: [proposals, USDC_ADDRESS]
    });

    console.log("Deployment transaction hash:", hash);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Contract deployed to:", receipt.contractAddress);
    
    // Save the contract address to a file for frontend use
    const fs = require('fs');
    const deploymentInfo = {
      contractAddress: receipt.contractAddress,
      network: optimismSepolia.name,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      './deployment-info.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main();

/* npx hardhat run scripts/deploy.ts --network optimismSepolia
contract: 0xa103044a19D5af85Fa59799e4960aEbDEb91727F
2nd: 0x23804876f3524e7e7dde209f610a07994b97465f
3rd: 0x379472f0cbe66de13b8124842757a6243f78c619
*/