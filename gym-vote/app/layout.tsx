import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ParticleConnectkit } from '@/components/ConnectKit';

const inter = Inter({ subsets: ['latin'] });

import {
  mainnet,
  sepolia,
  bsc,
  bscTestnet,
  linea,
  lineaSepolia,
  polygon,
  polygonAmoy,
} from '@particle-network/connectkit/chains';

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