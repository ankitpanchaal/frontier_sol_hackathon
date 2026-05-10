'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import {
  BadgeCheck, Loader2, AlertCircle, CheckCircle2, Lock, Calendar, User
} from 'lucide-react';
import {
  getProgram, fetchCampaign, fetchBadgeRecord,
  getBadgeRecordPDA, getCampaignPDA, loadIdl,
  type CampaignData
} from '@/lib/solana/program';
import IDL from '@/lib/solana/idl.json';
import { Idl } from '@coral-xyz/anchor';

loadIdl(IDL as Idl);

function formatDate(timestamp: { toNumber: () => number } | number) {
  const ts = typeof timestamp === 'number' ? timestamp : timestamp.toNumber();
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export default function ClaimPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const campaignPubkey = new PublicKey(campaignId);
        // Use a read-only provider for fetching
        const wallet = { publicKey: PublicKey.default, signTransaction: async (t: unknown) => t, signAllTransactions: async (t: unknown[]) => t };
        const provider = new AnchorProvider(connection, wallet as never, { commitment: 'confirmed' });
        const data = await fetchCampaign(provider, campaignPubkey);
        setCampaign(data);

        // Resolve image from metadata JSON
        if (data?.metadataUri) {
          try {
            const res = await fetch(data.metadataUri);
            const json = await res.json();
            if (json.image) setImageUrl(json.image as string);
          } catch { /* ignore — show fallback icon */ }
        }
      } catch {
        setError('Campaign not found or invalid ID.');
      } finally {
        setLoading(false);
      }
    };
    if (campaignId) load();
  }, [campaignId, connection]);

  // Check if user already claimed
  useEffect(() => {
    const check = async () => {
      if (!publicKey || !campaign) return;
      const wallet = { publicKey, signTransaction: async (t: unknown) => t, signAllTransactions: async (t: unknown[]) => t };
      const provider = new AnchorProvider(connection, wallet as never, { commitment: 'confirmed' });
      const record = await fetchBadgeRecord(provider, campaign.publicKey, publicKey);
      if (record) setAlreadyClaimed(true);
    };
    check();
  }, [publicKey, campaign, connection]);

  const handleClaim = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions || !campaign) return;
    setClaiming(true);
    setError(null);

    try {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed' }
      );
      const program = getProgram(provider);
      const [badgePDA] = getBadgeRecordPDA(campaign.publicKey, publicKey);

      // @ts-ignore: IDL runtime
      await program.methods.claimBadge().accounts({
        recipient: publicKey,
        campaign: campaign.publicKey,
        badgeRecord: badgePDA,
      }).rpc();

      setClaimed(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      if (msg.includes('already in use')) {
        setAlreadyClaimed(true);
      } else {
        setError(msg);
      }
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle size={40} className="text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Campaign Not Found</h1>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Badge Claimed! 🎉</h1>
        <p className="text-muted-foreground mb-8">
          Your <strong>{campaign?.title}</strong> badge is now permanently linked to your wallet.
        </p>
        <a
          href={`/profile/${publicKey?.toBase58()}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
        >
          View My Profile
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16">
      {campaign && (
        <>
          {/* Badge card */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl shadow-black/10 mb-6">
            {/* Artwork */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center py-10">
              {imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageUrl}
                  alt={campaign.title}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white/10 badge-glow animate-float"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-primary/20 flex items-center justify-center badge-glow animate-float">
                  <BadgeCheck size={48} className="text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold">{campaign.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                </div>
                <Lock size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
              </div>

              <div className="space-y-2 text-sm border-t border-border/60 pt-4 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={13} />
                  <span className="font-mono text-xs truncate">{campaign.issuer.toBase58().slice(0, 8)}…</span>
                  <span className="text-xs">issuer</span>
                </div>
                {campaign.eventName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={13} />
                    <span>{campaign.eventName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {campaign.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                    {campaign.issuedCount.toNumber()} claimed
                  </span>
                  {campaign.maxSupply.toNumber() > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                      / {campaign.maxSupply.toNumber()} max
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          {alreadyClaimed ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
              <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-sm">You already hold this badge!</p>
              <a
                href={`/profile/${publicKey?.toBase58()}`}
                className="mt-3 inline-flex text-xs text-primary hover:underline"
              >
                View on your profile →
              </a>
            </div>
          ) : !campaign.isActive ? (
            <div className="rounded-2xl border border-border bg-muted/20 p-5 text-center">
              <p className="text-sm text-muted-foreground">This campaign is no longer accepting claims.</p>
            </div>
          ) : !connected ? (
            <button
              id="connect-to-claim"
              onClick={() => setVisible(true)}
              className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
            >
              Connect Wallet to Claim
            </button>
          ) : (
            <>
              <button
                id="claim-badge-btn"
                onClick={handleClaim}
                disabled={claiming}
                className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25 text-sm flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <><Loader2 size={16} className="animate-spin" /> Claiming…</>
                ) : (
                  <><BadgeCheck size={16} /> Claim Badge</>
                )}
              </button>
              {error && (
                <p className="text-xs text-destructive mt-2 text-center">{error}</p>
              )}
              <p className="text-xs text-muted-foreground text-center mt-3">
                <Lock size={11} className="inline mr-1" />
                Soulbound — once claimed, this badge is permanently tied to your wallet.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
