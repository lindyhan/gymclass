'use client';

import React from 'react';
import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa'
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { aa } from '@particle-network/connectkit/aa';
import { optimismSepolia } from '@particle-network/connectkit/chains';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import { evmWalletConnectors, injected } from '@particle-network/connectkit/evm';
import { useSmartAccount, useAccount } from '@particle-network/connectkit';
import { AuthType } from "@particle-network/auth-core";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;


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
                injected({ target: 'bitKeep' })
            ]
        }),
        authWalletConnectors({
            authTypes: ['email', 'google', 'apple', 'facebook'],
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
    chains: [optimismSepolia],
});

// Transaction helper function - moved outside the provider
export const sendTransaction = async (
    smartAccount: ReturnType<typeof useSmartAccount>,
    transaction: {
        to: string;
        value?: string;
        data: string;
    }
) => {
    if (!smartAccount) {
        throw new Error("Smart Account not initialized");
    }

    const userOp = await smartAccount.buildUserOperation({
        tx: transaction
    });

    return await smartAccount.sendUserOperation(userOp);
};

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
    return (
        <ConnectKitProvider config={config}>
            {children}
        </ConnectKitProvider>
    );
};