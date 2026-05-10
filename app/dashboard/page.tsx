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
      'rounded-2xl border bg-card p-5 hover:border-primary/30 transition-all duration-200 group',
      campaign.isActive ? 'border-border' : 'border-border/40 opacity-70'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{campaign.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{campaign.description}</p>
        </div>
        <span className={cn(
          'ml-3 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium',
          campaign.isActive
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-muted text-muted-foreground'
        )}>
          {campaign.isActive ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Users size={11} />
          {campaign.issuedCount.toNumber()} claimed
        </span>
        {campaign.maxSupply.toNumber() > 0 && (
          <span>/ {campaign.maxSupply.toNumber()} max</span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-muted">{campaign.category}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/${campaign.publicKey.toBase58()}`}
          id={`manage-campaign-${campaign.campaignId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted/60 transition-colors"
        >
          Manage
        </Link>
        <Link
          href={`/claim/${campaign.publicKey.toBase58()}`}
          target="_blank"
          id={`view-claim-${campaign.campaignId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted/60 transition-colors"
        >
          <QrCode size={12} /> Claim Page
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {connected
              ? `Manage your badge campaigns · ${publicKey?.toBase58().slice(0, 8)}…`
              : 'Connect your wallet to view campaigns'}
          </p>
        </div>
        {connected && (
          <Link
            href="/dashboard/create"
            id="dashboard-create-badge"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
          >
            <Plus size={16} />
            Create Badge
          </Link>
        )}
      </div>

      {/* Not connected */}
      {!connected && (
        <div className="rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard size={28} className="text-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-lg mb-2">Connect to get started</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Connect your wallet to create badge campaigns and manage your issuances.
            </p>
          </div>
          <button
            id="dashboard-connect-wallet"
            onClick={() => setVisible(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/25"
          >
            Connect Wallet <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Loading */}
      {connected && loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {connected && !loading && campaigns.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center py-24 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BadgeCheck size={28} className="text-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-lg mb-2">No campaigns yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Create your first badge campaign and share it with your community.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm"
          >
            Create your first badge <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Campaign grid */}
      {connected && !loading && campaigns.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(c => <CampaignCard key={c.publicKey.toBase58()} campaign={c} />)}
          </div>
        </>
      )}
    </div>
  );
}
