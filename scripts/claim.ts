import { createPublicClient, http, createWalletClient, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/GymVote.sol/GymVote.json";
import * as dotenv from "dotenv";
dotenv.config();

export async function claimRefund(
    contractAddress: string,
    voterAddress: string,
    provider: any
  ) {
    try {
      const publicClient = createPublicClient({
        chain: optimismSepolia,
        transport: http(optimismSepolia.rpcUrls.default.http[0]),
      });
  
      const claimData = encodeFunctionData({
        abi: abi,
        functionName: "claimRefund",
        args: []
      });
  
      const tx = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: voterAddress,
          to: contractAddress,
          data: claimData
        }]
      });
  
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      return receipt;
    } catch (error) {
      console.error("Error claiming refund:", error);
      throw error;
    }
  }
  
  // endVotingScript.ts
  export async function endVoting(privateKey: string, contractAddress: string) {
    try {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      
      const walletClient = createWalletClient({
        chain: optimismSepolia,
        transport: http(optimismSepolia.rpcUrls.default.http[0]),
        account
      });
  
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: "endVoting",
        args: []
      });
  
      const publicClient = createPublicClient({
        chain: optimismSepolia,
        transport: http(optimismSepolia.rpcUrls.default.http[0]),
      });
  
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return receipt;
    } catch (error) {
      console.error("Error ending voting:", error);
      throw error;
    }
  }