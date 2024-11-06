'use client';

import React, { useEffect } from 'react';
import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { aa } from '@particle-network/connectkit/aa';
import { optimismSepolia, sepolia, arbitrumSepolia, baseSepolia } from '@particle-network/connectkit/chains';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import { evmWalletConnectors, injected } from '@particle-network/connectkit/evm';
import { useSmartAccount, useAccount, useAddress } from '@particle-network/connectkit';
import { AuthType } from "@particle-network/auth-core";
import { AuthCoreContextProvider, PromptSettingType } from "@particle-network/authkit"; 

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;

if (!projectId || !clientKey || !appId) { 
    throw new Error('Please configure the Particle project in .env first!');
}

// Particle Network configuration, targeting only Optimism Sepolia but enabling cross-chain support
const config = createConfig({
    projectId,
    clientKey,
    appId,
    appearance: {
        connectorsOrder: ['wallet', 'social'],
    },
    walletConnectors: [
        evmWalletConnectors({
            connectorFns: [
                injected({ target: 'metaMask' }),
                injected({ target: 'coinbaseWallet' }),
            ]
        }),
        authWalletConnectors({
            authTypes: ['email', 'google', 'apple'],
            promptSettingConfig: {
                promptMasterPasswordSettingWhenLogin: 1,
                promptPaymentPasswordSettingWhenSign: 1,
            },
        }),
    ],
    plugins: [
        wallet({
            entryPosition: EntryPosition.BR,
            visible: true,
        }),
        aa({
            name: 'BICONOMY',
            version: '2.0.0',
        }),
    ],
    // Optimism Sepolia as the main chain; cross-chain fallback enabled through Particle Network
    chains: [optimismSepolia, sepolia, arbitrumSepolia, baseSepolia],
});

// Create a custom hook to use smart account
const useSmartAccountWrapper = () => {
    return useSmartAccount();
};

// Updated sendUserOperation to accept smartAccount as a parameter
export const sendUserOperation = async (smartAccount: ReturnType<typeof useSmartAccountWrapper>, recipientAddress: string, amountInWei: string) => {
    if (!smartAccount) {
        console.error("SmartAccount instance not initialized.");
        return;
    }

    try {
        // Build the User Operation
        const userOp = await smartAccount.buildUserOperation({
            tx: {
                to: recipientAddress,
                value: amountInWei,
                data: '0x',
            },
        });

        // Send the User Operation
        const txHash = await smartAccount.sendUserOperation(userOp);
        console.log('Transaction Hash:', txHash);
    } catch (error) {
        console.error("Error in User Operation:", error);
    }
};

// Usage Example
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
    const smartAccount = useSmartAccountWrapper();

    // Automatically fetch the smart account address upon initialization
    useEffect(() => {
        if (smartAccount) {
            smartAccount
                .getAddress()
                .then((addr) => console.log('Smart Account Address:', addr))
                .catch((error) => console.error('Error fetching smart account address:', error));
        }
    }, [smartAccount]);

    return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>; // Ensure children are wrapped
};

export const ParticleAuthkit = ({ children }: React.PropsWithChildren) => {
    return (
      <AuthCoreContextProvider
        options={{
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
          clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
          appId: process.env.NEXT_PUBLIC_APP_ID!,
          authTypes: [AuthType.email, AuthType.google, AuthType.twitter],
          themeType: "light",
  
          chains: [arbitrumSepolia, optimismSepolia, baseSepolia, sepolia],
  
          promptSettingConfig: {
            promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
            promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
          },
  
          wallet: {
            themeType: "light",
  
            // Set to false to remove the embedded wallet modal
            visible: false,
            customStyle: {
              supportUIModeSwitch: true,
              supportLanguageSwitch: false,
            },
          },
        }}
      >
        {children}
      </AuthCoreContextProvider>
    );
};
  
  