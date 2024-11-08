'use client';

import React from 'react';
import { ConnectKitProvider, createConfig, useWallets, useAccount, useSmartAccount } from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import { aa } from '@particle-network/connectkit/aa';
import { optimismSepolia } from '@particle-network/connectkit/chains';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import { evmWalletConnectors, injected } from '@particle-network/connectkit/evm';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {

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

    const sendTransaction = async (
        smartAccount: ReturnType<typeof useSmartAccount>,
        transaction: {
            to: string;
            value?: string;
            data: string;
        },
        feeQuote?: any,
        tokenPaymasterAddress?: string
    ) => {
        if (!smartAccount) {
            throw new Error("Smart Account not initialized");
        }

        return await smartAccount.sendTransaction(
            transaction,
            feeQuote,
            tokenPaymasterAddress
        );
    };

    return (
        <ConnectKitProvider config={config}>
            {children}
        </ConnectKitProvider>
    );
};