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
      setInputError('REQUIRED: RECIPIENT_ADDRESS && CAMPAIGN_ID');
      return;
    }

    let recipientKey: PublicKey;
    let campaignKey: PublicKey;

    try {
      recipientKey = new PublicKey(walletInput.trim());
    } catch {
      setInputError('ERROR: INVALID_RECIPIENT_ADDRESS');
      return;
    }

    try {
      campaignKey = new PublicKey(campaignInput.trim());
    } catch {
      setInputError('ERROR: INVALID_CAMPAIGN_ID');
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
    <div className="mx-auto max-w-2xl px-6 py-24">
      {/* Header */}
      <div className="text-left mb-16">
        <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center mb-6">
          <ShieldCheck size={24} strokeWidth={1} className="text-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter uppercase font-mono mb-4">Attestation Audit</h1>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
          Verify the authenticity of any SoulStamp badge on the Solana ledger.
        </p>
      </div>

      {/* Inputs */}
      <div className="border border-border bg-card p-8 mb-12">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase font-mono tracking-widest mb-2 block" htmlFor="recipient-input">
              Target Wallet
            </label>
            <input
              id="recipient-input"
              type="text"
              placeholder="ADDRESS_HEX"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-background text-xs font-mono uppercase tracking-tight focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase font-mono tracking-widest mb-2 block" htmlFor="campaign-input">
              Campaign Identifier
            </label>
            <input
              id="campaign-input"
              type="text"
              placeholder="PUBLIC_KEY"
              value={campaignInput}
              onChange={(e) => setCampaignInput(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-background text-xs font-mono uppercase tracking-tight focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {inputError && (
            <p className="text-[10px] font-mono text-destructive uppercase tracking-widest">{inputError}</p>
          )}

          <button
            id="verify-button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-4 bg-foreground text-background font-bold font-mono text-xs uppercase hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-3"
          >
            {verifying ? (
              <><Loader2 size={14} className="animate-spin" /> Verifying...</>
            ) : (
              <><Search size={14} /> Run Verification</>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-slide-up">
          {result.status === 'not_found' && (
            <div className="border border-border bg-card p-8 text-center">
              <XCircle size={32} strokeWidth={1} className="text-muted-foreground mx-auto mb-4" />
              <h2 className="font-bold text-sm uppercase font-mono mb-2 tracking-tight">Record Not Found</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                No matching attestation exists on-chain for the provided parameters.
              </p>
            </div>
          )}

          {(result.status === 'authentic' || result.status === 'revoked') && (
            <div className={cn(
              'border bg-card p-8',
              result.status === 'revoked' ? 'border-destructive' : 'border-foreground'
            )}>
              {/* Status banner */}
              <div className="flex items-start gap-4 mb-10 pb-8 border-b border-border">
                {result.status === 'authentic' ? (
                  <CheckCircle2 size={24} className="text-foreground mt-1" />
                ) : (
                  <XCircle size={24} className="text-destructive mt-1" />
                )}
                <div>
                  <p className={cn(
                    'font-bold text-lg uppercase font-mono tracking-tighter leading-none mb-2',
                    result.status === 'authentic' ? 'text-foreground' : 'text-destructive'
                  )}>
                    {result.status === 'authentic' ? 'Status: Authentic' : 'Status: Revoked'}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                    {result.status === 'authentic'
                      ? 'Cryptographic proof of achievement confirmed.'
                      : 'This attestation has been nullified by the issuer.'}
                  </p>
                </div>
              </div>

              {/* Badge details */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Attestation</span>
                    <span className="text-xs font-bold font-mono uppercase">{result.campaign.title}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Namespace</span>
                    <span className="text-xs font-bold font-mono uppercase">
                      {result.campaign.category} {result.campaign.eventName && `// ${result.campaign.eventName}`}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Issuer Identity</span>
                  <span className="text-[10px] font-mono break-all">{result.campaign.issuer.toBase58()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Emission Timestamp</span>
                  <span className="text-xs font-mono uppercase">{formatDate(result.badge.issuedAt)}</span>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-border flex justify-end">
                <a
                  href={`/profile/${result.badge.recipient.toBase58()}`}
                  className="text-[10px] font-bold font-mono uppercase tracking-widest hover:underline"
                >
                  View Identity History →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
