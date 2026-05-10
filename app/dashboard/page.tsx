'use client';

import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider } from '@coral-xyz/anchor';
import Link from 'next/link';
import {
  LayoutDashboard, Plus, BadgeCheck, QrCode,
  ToggleLeft, ToggleRight, Users, Loader2, ArrowRight
} from 'lucide-react';
import { fetchCampaignsByIssuer, loadIdl, type CampaignData } from '@/lib/solana/program';
import IDL from '@/lib/solana/idl.json';
import { Idl } from '@coral-xyz/anchor';
import { cn } from '@/lib/utils';

loadIdl(IDL as Idl);

function CampaignCard({ campaign }: { campaign: CampaignData }) {
  return (
    <div className={cn(
      'border bg-card p-6 transition-colors duration-200 group relative',
      campaign.isActive ? 'border-border' : 'border-border opacity-60 grayscale'
    )}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm uppercase font-mono tracking-tight truncate">{campaign.title}</h3>
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mt-1 truncate">{campaign.description}</p>
        </div>
        <span className={cn(
          'ml-3 flex-shrink-0 px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-widest border',
          campaign.isActive
            ? 'border-foreground bg-foreground text-background'
            : 'border-border text-muted-foreground'
        )}>
          {campaign.isActive ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Circulation</span>
          <span className="text-xs font-bold font-mono">
            {campaign.issuedCount.toNumber()} {campaign.maxSupply.toNumber() > 0 ? `/ ${campaign.maxSupply.toNumber()}` : ''}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Namespace</span>
          <span className="text-xs font-bold font-mono uppercase truncate">{campaign.category}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Link
          href={`/dashboard/${campaign.publicKey.toBase58()}`}
          id={`manage-campaign-${campaign.campaignId}`}
          className="flex-1 text-center py-2 text-[10px] font-bold font-mono uppercase border border-border hover:bg-accent transition-colors"
        >
          Terminal
        </Link>
        <Link
          href={`/claim/${campaign.publicKey.toBase58()}`}
          target="_blank"
          id={`view-claim-${campaign.campaignId}`}
          className="px-3 py-2 border border-border hover:bg-accent transition-colors"
        >
          <QrCode size={12} />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;
    const load = async () => {
      setLoading(true);
      try {
        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions },
          { commitment: 'confirmed' }
        );
        const data = await fetchCampaignsByIssuer(provider, publicKey);
        setCampaigns(data.sort((a, b) => b.campaignId - a.campaignId));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicKey, connection, signTransaction, signAllTransactions]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-mono mb-4">Command Center</h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
            {connected
              ? `AUTHENTICATED // ${publicKey?.toBase58().slice(0, 12)}...`
              : 'Connection Required'}
          </p>
        </div>
        {connected && (
          <Link
            href="/dashboard/create"
            id="dashboard-create-badge"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-foreground text-background font-bold font-mono text-xs uppercase hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Emission
          </Link>
        )}
      </div>

      {/* Not connected */}
      {!connected && (
        <div className="border border-dashed border-border flex flex-col items-center justify-center py-32 gap-6 bg-card/50">
          <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center">
            <LayoutDashboard size={24} strokeWidth={1} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-sm uppercase font-mono mb-2 tracking-tight">Access Denied</h2>
            <p className="text-muted-foreground text-[10px] uppercase font-mono max-w-xs leading-relaxed tracking-widest">
              Please initialize your session by connecting a verified Solana wallet.
            </p>
          </div>
          <button
            id="dashboard-connect-wallet"
            onClick={() => setVisible(true)}
            className="px-8 py-3 bg-foreground text-background font-bold font-mono text-xs uppercase hover:opacity-90 transition-opacity"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Loading */}
      {connected && loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Syncing Ledger...</span>
        </div>
      )}

      {/* Empty state */}
      {connected && !loading && campaigns.length === 0 && (
        <div className="border border-dashed border-border flex flex-col items-center justify-center py-32 gap-6 bg-card/50">
          <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center">
            <BadgeCheck size={24} strokeWidth={1} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-sm uppercase font-mono mb-2 tracking-tight">No Active Emissions</h2>
            <p className="text-muted-foreground text-[10px] uppercase font-mono max-w-xs leading-relaxed tracking-widest">
              Your identity has not issued any on-chain badges through this protocol.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="px-8 py-3 border border-border font-bold font-mono text-xs uppercase hover:bg-accent transition-colors"
          >
            Create First Badge
          </Link>
        </div>
      )}

      {/* Campaign grid */}
      {connected && !loading && campaigns.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              {campaigns.length} Active Records
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border">
            {campaigns.map(c => <CampaignCard key={c.publicKey.toBase58()} campaign={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
