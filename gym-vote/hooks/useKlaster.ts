import { useState } from 'react';
import {
  buildMultichainReadonlyClient,
  buildRpcInfo,
  initKlaster,
  klasterNodeHost,
  type SmartAccount
} from "klaster-sdk";
import { sepolia } from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from 'viem';

const alchemyURL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const useKlaster = (address: string | undefined) => {
  const [loading, setLoading] = useState(false);

  const initializeKlaster = async () => {
    if (!address) return null;

    const privateKey = generatePrivateKey();
    const signerAccount = privateKeyToAccount(privateKey);

    // Create the wallet client with the Alchemy URL
    const signer = createWalletClient({
      transport: http(alchemyURL), // Pass the Alchemy URL here
    });

    const mcClient = buildMultichainReadonlyClient([
      buildRpcInfo(sepolia.id, "wss://ethereum-sepolia-rpc.publicnode.com"),
    ]);

    // Initialize Klaster with basic account setup
    const klaster = await initKlaster({
      accountInitData: {
        owner: address,
        type: "basic"
      },
      nodeUrl: klasterNodeHost.default,
    });

    return { klaster, mcClient, signer };
  };

  const approveUSDC = async () => {
    setLoading(true);
    try {
      const { klaster } = await initializeKlaster() || {};
      if (!klaster) throw new Error('Failed to initialize Klaster');

      // Using Klaster's raw transaction functionality instead of TokenTransaction
      const approvalData = {
        to: USDC_ADDRESS,
        data: '0x095ea7b3' + // approve function selector
              CONTRACT_ADDRESS.slice(2).padStart(64, '0') + // spender parameter
              '10000000'.padStart(64, '0'), // amount parameter (10 USDC with 6 decimals)
        value: '0'
      };

      await klaster.execute(approvalData);
      return true;
    } catch (error) {
      console.error('Error approving USDC:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    initializeKlaster,
    approveUSDC,
    loading
  };
};
