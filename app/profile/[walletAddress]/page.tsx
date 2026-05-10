'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { BadgeCheck, Loader2, Share2, ExternalLink, Check } from 'lucide-react';
import {
  fetchBadgesByRecipient, fetchCampaign, loadIdl,
  type BadgeRecordData, type CampaignData
} from '@/lib/solana/program';
import IDL from '@/lib/solana/idl.json';
import { cn } from '@/lib/utils';

loadIdl(IDL as Idl);

interface BadgeWithCampaign extends Omit<BadgeRecordData, 'campaign'> {
  campaign: PublicKey;
  campaignData: CampaignData | null;
  imageUrl: string | null; // resolved from metadataUri JSON
}

function truncate(str: string, n = 8) {
  return str.length > n * 2 + 3 ? `${str.slice(0, n)}…${str.slice(-n)}` : str;
}

function formatDate(ts: { toNumber: () => number } | number) {
  const t = typeof ts === 'number' ? ts : ts.toNumber();
  return new Date(t * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Fetch the metadata JSON at metadataUri and extract the image URL */
async function resolveImageFromMetadata(metadataUri: string): Promise<string | null> {
  if (!metadataUri) return null;
  try {
    const res = await fetch(metadataUri);
    if (!res.ok) return null;
    const json = await res.json();
    return (json.image as string) || null;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const params = useParams();
  const walletAddress = params.walletAddress as string;
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [badges, setBadges] = useState<BadgeWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwner = publicKey?.toBase58() === walletAddress;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const address = new PublicKey(walletAddress);
        const wallet = {
          publicKey: address,
          signTransaction: async (t: unknown) => t,
          signAllTransactions: async (t: unknown[]) => t
        };
        const provider = new AnchorProvider(connection, wallet as never, { commitment: 'confirmed' });

        const records = await fetchBadgesByRecipient(provider, address);

        // Fetch campaign data + resolve image URL for each badge in parallel
        const withCampaigns = await Promise.all(
          records.map(async (r) => {
            const campaignData = await fetchCampaign(provider, r.campaign as unknown as PublicKey);
            // The metadataUri points to a JSON file — fetch it and pull out the `image` field
            const imageUrl = campaignData?.metadataUri
              ? await resolveImageFromMetadata(campaignData.metadataUri)
              : null;
            return { ...r, campaignData, imageUrl };
          })
        );

        setBadges(withCampaigns.sort((a, b) => {
          const at = typeof a.issuedAt === 'number' ? a.issuedAt : a.issuedAt.toNumber();
          const bt = typeof b.issuedAt === 'number' ? b.issuedAt : b.issuedAt.toNumber();
          return bt - at;
        }));
      } catch {
        setError('Invalid wallet address.');
      } finally {
        setLoading(false);
      }
    };
    if (walletAddress) load();
  }, [walletAddress, connection]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-foreground flex items-center justify-center flex-shrink-0">
            <BadgeCheck size={32} className="text-background" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tighter uppercase font-mono">
              {isOwner ? 'Identity Profile' : 'External Identity'}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-widest">
              {walletAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="share-profile-btn"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent transition-colors font-bold font-mono text-[10px] uppercase"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Share2 size={12} />}
            {copied ? 'Copied' : 'Share Identity'}
          </button>
          <a
            href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-accent transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Stats */}
      {badges.length > 0 && (
        <div className="grid grid-cols-3 gap-0 border-t border-l border-border mb-16">
          {[
            { label: 'Attestations', value: badges.length },
            { label: 'Verified', value: badges.filter(b => !b.isRevoked).length },
            { label: 'Revoked', value: badges.filter(b => b.isRevoked).length },
          ].map(stat => (
            <div key={stat.label} className="border-r border-b border-border bg-card p-6 text-left">
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Badge grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Syncing Identity Data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-32 border border-dashed border-border">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{error}</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="border border-dashed border-border flex flex-col items-center justify-center py-32 gap-6 bg-card/50">
          <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center">
            <BadgeCheck size={24} strokeWidth={1} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-sm uppercase font-mono mb-2 tracking-tight">No Attestations Found</h2>
            <p className="text-muted-foreground text-[10px] uppercase font-mono max-w-xs leading-relaxed tracking-widest">
              {isOwner ? 'This identity has not claimed any verified badges.' : 'This wallet has no verified achievement records.'}
            </p>
          </div>
          {isOwner && (
            <a href="/explore" className="px-8 py-3 border border-border font-bold font-mono text-[10px] uppercase hover:bg-accent transition-colors">Browse campaigns</a>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Verification History
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border">
            {badges.map((badge) => (
              <div
                key={badge.publicKey.toBase58()}
                className={cn(
                  'border-r border-b border-border bg-card overflow-hidden transition-colors duration-200 group',
                  badge.isRevoked ? 'opacity-50 grayscale' : 'hover:bg-accent'
                )}
              >
                {/* Artwork area */}
                <div className="bg-accent/30 flex items-center justify-center py-8 relative min-h-[200px] border-b border-border">
                  {badge.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={badge.imageUrl}
                      alt={badge.campaignData?.title ?? 'Badge'}
                      className={cn(
                        'w-32 h-32 object-cover border border-border transition-transform duration-300',
                        !badge.isRevoked && 'group-hover:scale-105'
                      )}
                    />
                  ) : (
                    <div className={cn(
                      'w-24 h-24 border border-dashed border-border flex items-center justify-center',
                      badge.isRevoked ? 'bg-muted' : 'bg-background'
                    )}>
                      <BadgeCheck
                        size={32}
                        className={badge.isRevoked ? 'text-muted-foreground' : 'text-foreground'}
                      />
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="absolute top-4 right-4">
                    {badge.isRevoked ? (
                      <span className="px-2 py-0.5 border border-destructive text-destructive text-[9px] font-bold font-mono uppercase tracking-widest bg-destructive/10">
                        Revoked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 border border-foreground text-foreground text-[9px] font-bold font-mono uppercase tracking-widest bg-background flex items-center gap-1">
                        <BadgeCheck size={10} /> Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-bold text-sm uppercase font-mono tracking-tight mb-2 truncate">
                    {badge.campaignData?.title ?? 'Unknown Attestation'}
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest line-clamp-2 mb-6 min-h-[32px]">
                    {badge.campaignData?.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-muted-foreground">
                      {badge.campaignData?.eventName || badge.campaignData?.category || 'Registry Entry'}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">{formatDate(badge.issuedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
