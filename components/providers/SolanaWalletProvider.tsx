'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

/**
 * SolanaWalletProvider
 *
 * Wraps the app with Solana connection + wallet context.
 * Currently configured for Devnet. Switch to localnet for on-chain dev:
 *   endpoint = "http://127.0.0.1:8899"
 *
 * The `wallets` array is intentionally empty — the wallet adapter
 * auto-detects all installed wallets (Phantom, Backpack, Solflare…)
 * via the Wallet Standard.
 */
const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Empty array: Wallet Standard auto-discovers installed wallets
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider;
