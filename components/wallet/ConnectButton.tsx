'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

interface ConnectButtonProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function ConnectButton({ className, variant = 'default' }: ConnectButtonProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (connected && publicKey) {
    return (
      <div className="relative">
        <button
          id="wallet-address-button"
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
            'border border-border bg-card/80 backdrop-blur-sm',
            'hover:bg-muted/60 transition-all duration-200',
            'text-foreground',
            className
          )}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {truncateAddress(publicKey.toBase58())}
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-border bg-card shadow-lg shadow-black/20 overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-xs text-muted-foreground mb-1">Connected wallet</p>
                <p className="text-sm font-medium font-mono">
                  {truncateAddress(publicKey.toBase58())}
                </p>
              </div>
              <div className="p-1.5">
                <button
                  id="copy-address-button"
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                  {copied ? 'Copied!' : 'Copy address'}
                </button>
                <button
                  id="disconnect-wallet-button"
                  onClick={() => { disconnect(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      id="connect-wallet-button"
      onClick={() => setVisible(true)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold',
        'bg-primary text-primary-foreground',
        'hover:opacity-90 active:scale-95 transition-all duration-200',
        'shadow-lg shadow-primary/25',
        variant === 'compact' ? 'px-3 py-1.5 text-xs' : '',
        className
      )}
    >
      <Wallet size={16} />
      Connect Wallet
    </button>
  );
}
