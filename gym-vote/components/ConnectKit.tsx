'use client';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
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
    walletConnectors: [
        evmWalletConnectors({
            
        })
    ],
});

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
    return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};