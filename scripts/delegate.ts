import { task } from "hardhat/config";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
dotenv.config();

task("delegate", "Delegate vote to a specified address")
  .addPositionalParam("delegate", "The address to delegate the vote to")
  .setAction(async (taskArgs, hre) => {
    try {
      const artifactPath = join(__dirname, "../artifacts/contracts/Ballot.sol/Ballot.json");
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
      
      const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
      const account = privateKeyToAccount(privateKey);
      const contractAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;
      const delegateAddress = taskArgs.delegate as `0x${string}`;

      // Validate delegate address
      if (!/^0x[a-fA-F0-9]{40}$/.test(delegateAddress)) {
        console.error("\nError: Invalid delegate address format");
        process.exit(1);
      }

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(),
        account
      });

      console.log(`\nDelegating vote to ${delegateAddress}...`);
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'delegate',
        args: [delegateAddress]
      });

      console.log("Transaction hash:", hash);

    } catch (error) {
      if (error instanceof Error) {
        console.error(`\nError: ${error.message}`);
      } else {
        console.error("\nAn unexpected error occurred");
      }
      process.exit(1);
    }
  });


//npx hardhat run scripts/delegate.ts --network sepolia 0xa96A5c741064db6a46661D4C2Cd0B31bb7b04260