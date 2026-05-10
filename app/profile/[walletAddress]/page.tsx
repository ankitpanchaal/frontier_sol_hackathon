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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
            <BadgeCheck size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">
              {isOwner ? 'My Badges' : 'Badge Profile'}
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">
              {truncate(walletAddress, 10)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="share-profile-btn"
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-border hover:bg-muted/60 transition-colors font-medium"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share Profile'}
          </button>
          <a
            href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-border hover:bg-muted/60 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Stats */}
      {badges.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total Badges', value: badges.length },
            { label: 'Active', value: badges.filter(b => !b.isRevoked).length },
            { label: 'Revoked', value: badges.filter(b => b.isRevoked).length },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Badge grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading badges from Solana…</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <BadgeCheck size={26} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium mb-1">No badges yet</p>
            <p className="text-sm text-muted-foreground">
              {isOwner ? 'Claim your first badge from an event or community.' : 'This wallet has no badges yet.'}
            </p>
          </div>
          {isOwner && (
            <a href="/explore" className="text-sm text-primary hover:underline">Browse campaigns →</a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.publicKey.toBase58()}
              className={cn(
                'rounded-2xl border bg-card overflow-hidden hover:-translate-y-1 transition-all duration-300 group',
                badge.isRevoked
                  ? 'border-border/40 opacity-60'
                  : 'border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
              )}
            >
              {/* Artwork area */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center py-6 relative min-h-[160px]">
                {badge.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={badge.imageUrl}
                    alt={badge.campaignData?.title ?? 'Badge'}
                    className={cn(
                      'w-28 h-28 rounded-2xl object-cover border-2 border-white/10 transition-all duration-300',
                      badge.isRevoked
                        ? 'grayscale opacity-60'
                        : 'group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/20'
                    )}
                  />
                ) : (
                  <div className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center',
                    badge.isRevoked ? 'bg-muted' : 'bg-primary/20'
                  )}>
                    <BadgeCheck
                      size={36}
                      className={badge.isRevoked ? 'text-muted-foreground' : 'text-primary'}
                    />
                  </div>
                )}

                {/* Status pill */}
                {badge.isRevoked ? (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
                    Revoked
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                    <BadgeCheck size={10} /> Verified
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 leading-tight">
                  {badge.campaignData?.title ?? 'Unknown Badge'}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {badge.campaignData?.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-muted">
                    {badge.campaignData?.eventName || badge.campaignData?.category || 'Badge'}
                  </span>
                  <span>{formatDate(badge.issuedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
