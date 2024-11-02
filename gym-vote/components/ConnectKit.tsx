'use client';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { sepolia } from '@particle-network/connectkit/chains';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import React from 'react';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;

if (!projectId || !clientKey || !appId) {
    throw new Error('Please configure the Particle project in .env first!');
}

const config = createConfig({
    projectId,
    clientKey,
    appId,
    chains: [sepolia],
    appearance: {
        theme: 'light',
        accentColor: '#07B0F2',
    },
    walletConnectors: [
        evmWalletConnectors({
            metadata: {
                name: 'Gym Vote dApp',
                description: 'Vote for your preferred gym class',
                url: 'localhost:3000',
                icons: ['https://your-website.com/icon.png']
            },
        })
    ],
    plugins: [
        wallet({
            visible: true,
            entryPosition: EntryPosition.BR,
        }),
    ],
});

export function ParticleConnectkit({ children }: { children: React.ReactNode }) {
    return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
}