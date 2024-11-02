import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Update the import path to match your file structure
import { ParticleConnectkit } from '@/components/ConnectKit';

import {
  mainnet,
  sepolia,
  bsc,
  bscTestnet,
  polygonAmoy,
} from '@particle-network/connectkit/chains';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Particle Connect',
  description: 'Demo showcasing a quickstart for Particle Connect 2.0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticleConnectkit>{children}</ParticleConnectkit>
      </body>
    </html>
  );
}