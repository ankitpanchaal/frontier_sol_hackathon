'use client';

import { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import {
  ShieldCheck, Search, CheckCircle2, XCircle, Loader2,
  User, Calendar, Tag, BadgeCheck
} from 'lucide-react';
import { fetchCampaign, fetchBadgeRecord, loadIdl, type BadgeRecordData, type CampaignData } from '@/lib/solana/program';
import IDL from '@/lib/solana/idl.json';
import { Idl } from '@coral-xyz/anchor';

loadIdl(IDL as Idl);

function formatDate(ts: { toNumber: () => number } | number) {
  const t = typeof ts === 'number' ? ts : ts.toNumber();
  return new Date(t * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

type VerifyResult =
  | { status: 'authentic'; badge: BadgeRecordData; campaign: CampaignData }
  | { status: 'revoked'; badge: BadgeRecordData; campaign: CampaignData }
  | { status: 'not_found' };

export default function VerifyPage() {
  const { connection } = useConnection();
  const [walletInput, setWalletInput] = useState('');
  const [campaignInput, setCampaignInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleVerify = async () => {
    setInputError(null);
    setResult(null);

    if (!walletInput.trim() || !campaignInput.trim()) {
      setInputError('Please enter both wallet address and campaign ID.');
      return;
    }

    let recipientKey: PublicKey;
    let campaignKey: PublicKey;

    try {
      recipientKey = new PublicKey(walletInput.trim());
    } catch {
      setInputError('Invalid wallet address.');
      return;
    }

    try {
      campaignKey = new PublicKey(campaignInput.trim());
    } catch {
      setInputError('Invalid campaign ID (must be a Solana public key).');
      return;
    }

    setVerifying(true);
    try {
      const wallet = {
        publicKey: PublicKey.default,
        signTransaction: async (t: unknown) => t,
        signAllTransactions: async (t: unknown[]) => t
      };
      const provider = new AnchorProvider(connection, wallet as never, { commitment: 'confirmed' });

      const [badge, campaign] = await Promise.all([
        fetchBadgeRecord(provider, campaignKey, recipientKey),
        fetchCampaign(provider, campaignKey),
      ]);

      if (!badge || !campaign) {
        setResult({ status: 'not_found' });
      } else if (badge.isRevoked) {
        setResult({ status: 'revoked', badge, campaign });
      } else {
        setResult({ status: 'authentic', badge, campaign });
      }
    } catch {
      setResult({ status: 'not_found' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={26} className="text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Verify a Badge</h1>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          Paste a wallet address and campaign ID to confirm a badge is authentic and was issued on SoulStamp.
        </p>
      </div>

      {/* Inputs */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block" htmlFor="recipient-input">
              Wallet Address
            </label>
            <input
              id="recipient-input"
              type="text"
              placeholder="e.g. 8UxUji..."
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" htmlFor="campaign-input">
              Campaign ID (Public Key)
            </label>
            <input
              id="campaign-input"
              type="text"
              placeholder="e.g. 4qt2Hz..."
              value={campaignInput}
              onChange={(e) => setCampaignInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
            />
          </div>

          {inputError && (
            <p className="text-sm text-destructive">{inputError}</p>
          )}

          <button
            id="verify-button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            {verifying ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying…</>
            ) : (
              <><Search size={16} /> Verify Badge</>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-slide-up">
          {result.status === 'not_found' && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <XCircle size={40} className="text-muted-foreground mx-auto mb-3" />
              <h2 className="font-semibold mb-1">Badge Not Found</h2>
              <p className="text-sm text-muted-foreground">
                No badge record exists for this wallet + campaign combination.
              </p>
            </div>
          )}

          {(result.status === 'authentic' || result.status === 'revoked') && (
            <div className={`rounded-2xl border bg-card p-6 ${result.status === 'revoked' ? 'border-destructive/30' : 'border-emerald-500/30'}`}>
              {/* Status banner */}
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-5 ${result.status === 'authentic' ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                {result.status === 'authentic' ? (
                  <CheckCircle2 size={24} className="text-emerald-400" />
                ) : (
                  <XCircle size={24} className="text-destructive" />
                )}
                <div>
                  <p className={`font-semibold ${result.status === 'authentic' ? 'text-emerald-400' : 'text-destructive'}`}>
                    {result.status === 'authentic' ? '✓ Authentic Badge' : '✗ Badge Revoked'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.status === 'authentic'
                      ? 'This badge is genuine and was issued by SoulStamp.'
                      : 'This badge was revoked by the campaign issuer.'}
                  </p>
                </div>
              </div>

              {/* Badge details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <BadgeCheck size={15} className="text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Badge</span>
                    <span className="ml-2 font-medium">{result.campaign.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag size={15} className="text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <span className="ml-2">{result.campaign.category}</span>
                    {result.campaign.eventName && (
                      <span className="ml-2 text-muted-foreground">· {result.campaign.eventName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User size={15} className="text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Issuer</span>
                    <span className="ml-2 font-mono text-xs">{result.campaign.issuer.toBase58()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={15} className="text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Issued at</span>
                    <span className="ml-2">{formatDate(result.badge.issuedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60 flex gap-2">
                <a
                  href={`/profile/${result.badge.recipient.toBase58()}`}
                  className="text-xs text-primary hover:underline"
                >
                  View wallet profile →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
