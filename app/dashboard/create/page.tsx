'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Stamp, FileText, Users, Eye
} from 'lucide-react';
import { ArtworkUploader } from '@/components/badge/ArtworkUploader';
import { QRGenerator } from '@/components/badge/QRGenerator';
import { getProgram, getIssuerStatePDA, getCampaignPDA, loadIdl } from '@/lib/solana/program';
import { uploadBadgeMetadata } from '@/lib/cloudinary';
import { RPC_ENDPOINT } from '@/lib/constants';
import { cn } from '@/lib/utils';
import IDL from '@/lib/solana/idl.json';


// Load IDL once
loadIdl(IDL as Idl);

const STEPS = [
  { id: 1, label: 'Details', icon: FileText },
  { id: 2, label: 'Artwork', icon: Stamp },
  { id: 3, label: 'Eligibility', icon: Users },
  { id: 4, label: 'Review', icon: Eye },
];

interface FormData {
  title: string;
  description: string;
  eventName: string;
  category: string;
  maxSupply: string;
  eligibilityType: 'open' | 'allowlist';
  artworkUrl: string;
  metadataUri: string;
}

const CATEGORIES = ['Event', 'Achievement', 'Community', 'Onboarding', 'Contribution', 'Other'];

export default function CreateBadgePage() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    title: '', description: '', eventName: '', category: 'Event',
    maxSupply: '0', eligibilityType: 'open', artworkUrl: '', metadataUri: '',
  });
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedCampaignId, setDeployedCampaignId] = useState<string | null>(null);

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 1) return form.title.trim().length > 0 && form.description.trim().length > 0;
    if (step === 2) return form.artworkUrl.length > 0;
    return true;
  };

  const handleDeploy = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;
    setDeploying(true);
    setError(null);

    try {
      // Build metadata JSON and upload to Cloudinary
      const metadata = {
        name: form.title,
        description: form.description,
        image: form.artworkUrl,
        attributes: [
          { trait_type: 'Event', value: form.eventName || 'N/A' },
          { trait_type: 'Category', value: form.category },
          { trait_type: 'Platform', value: 'SoulStamp' },
        ],
      };
      const metadataUri = await uploadBadgeMetadata(metadata);

      // Build Anchor provider
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed' }
      );
      const program = getProgram(provider);

      // Get current campaign ID from IssuerState
      const [issuerStatePDA] = getIssuerStatePDA(publicKey);
      let campaignId = 0;

      try {
        // @ts-ignore: IDL runtime
        const state = await program.account.issuerState.fetch(issuerStatePDA);
        campaignId = new BN(state.nextCampaignId).toNumber();
      } catch {
        // IssuerState doesn't exist yet — init it first
        // @ts-ignore: IDL runtime
        await program.methods.initIssuerState().accounts({
          issuer: publicKey,
          issuerState: issuerStatePDA,
        }).rpc();
        campaignId = 0;
      }

      const [campaignPDA] = getCampaignPDA(publicKey, campaignId);

      // Create campaign on-chain — use BN for u64 args
      // @ts-ignore: IDL runtime
      await program.methods.createCampaign(
        new BN(campaignId),
        form.title,
        form.description,
        metadataUri,
        form.eventName || '',
        form.category,
        form.eligibilityType === 'open' ? { open: {} } : { allowlist: {} },
        new BN(parseInt(form.maxSupply) || 0),
      ).accounts({
        issuer: publicKey,
        issuerState: issuerStatePDA,
        campaign: campaignPDA,
      }).rpc();

      setDeployedCampaignId(campaignPDA.toBase58());
      setStep(5); // success step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setDeploying(false);
    }
  };

  // ─── Success screen ────────────────────────────────────────────────────────
  if (step === 5 && deployedCampaignId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Badge Campaign Live! 🎉</h1>
        <p className="text-muted-foreground mb-10">
          Your badge <strong>{form.title}</strong> is deployed on Solana.
          Share the QR code or link with your community.
        </p>

        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <h2 className="font-semibold mb-4">Claim QR Code</h2>
          <QRGenerator campaignId={deployedCampaignId} campaignTitle={form.title} />
        </div>

        <div className="flex gap-3 justify-center">
          <a
            href={`/dashboard/${deployedCampaignId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm"
          >
            Manage Campaign <ArrowRight size={15} />
          </a>
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border border-border hover:bg-muted/60 transition-all text-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Create Badge Campaign</h1>
        <p className="text-muted-foreground">Deploy a soulbound badge on Solana for your community.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <button
              id={`step-${s.id}-btn`}
              onClick={() => step > s.id && setStep(s.id)}
              disabled={step < s.id}
              className={cn(
                'flex items-center gap-2 text-xs font-medium transition-all',
                step === s.id ? 'text-primary' : step > s.id ? 'text-emerald-400 cursor-pointer' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                step === s.id ? 'bg-primary text-primary-foreground' :
                step > s.id ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-muted text-muted-foreground'
              )}>
                {step > s.id ? <CheckCircle2 size={14} /> : <s.icon size={13} />}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px', step > s.id ? 'bg-emerald-500/30' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Badge Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="badge-title">
                Badge Title <span className="text-destructive">*</span>
              </label>
              <input
                id="badge-title"
                type="text"
                maxLength={64}
                placeholder="e.g. Early Launch Attendee"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.title.length}/64</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="badge-description">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="badge-description"
                maxLength={256}
                placeholder="What does earning this badge mean?"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.description.length}/256</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="event-name">Event Name</label>
                <input
                  id="event-name"
                  type="text"
                  maxLength={64}
                  placeholder="e.g. Solana Hackathon 2026"
                  value={form.eventName}
                  onChange={(e) => update('eventName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="badge-category">Category</label>
                <select
                  id="badge-category"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="max-supply">
                Edition Size
              </label>
              <input
                id="max-supply"
                type="number"
                min={0}
                placeholder="0 = unlimited"
                value={form.maxSupply}
                onChange={(e) => update('maxSupply', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">Set to 0 for unlimited supply</p>
            </div>
          </div>
        )}

        {/* ── Step 2: Artwork ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-semibold text-lg">Badge Artwork</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a square image for your badge. It will be securely stored and linked to the on-chain record.
              </p>
            </div>
            <ArtworkUploader onUpload={(url) => update('artworkUrl', url)} />
            {!form.artworkUrl && (
              <p className="text-xs text-amber-500">Please upload artwork to continue.</p>
            )}
          </div>
        )}

        {/* ── Step 3: Eligibility ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Eligibility Rules</h2>
            <p className="text-sm text-muted-foreground">Who can claim this badge?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'open', title: 'Open', desc: 'Anyone with the claim link can mint.' },
                { value: 'allowlist', title: 'Allowlist', desc: 'Only wallets you specify can claim.' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  id={`eligibility-${opt.value}`}
                  type="button"
                  onClick={() => update('eligibilityType', opt.value)}
                  className={cn(
                    'text-left p-4 rounded-xl border-2 transition-all',
                    form.eligibilityType === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <p className="font-medium text-sm mb-1">{opt.title}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>

            {form.eligibilityType === 'allowlist' && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Allowlist enforcement will be added in the campaign management page after deployment. For now the campaign will deploy as open and you can manage claims from the dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Review & Deploy</h2>

            <div className="flex gap-5 items-start">
              {form.artworkUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={form.artworkUrl}
                  alt="Badge"
                  className="w-24 h-24 rounded-2xl object-cover border border-border flex-shrink-0"
                />
              )}
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">{form.title}</h3>
                <p className="text-sm text-muted-foreground">{form.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {form.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                    {form.eligibilityType === 'open' ? 'Open claim' : 'Allowlist'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                    {form.maxSupply === '0' ? 'Unlimited' : `${form.maxSupply} editions`}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event</span>
                <span>{form.eventName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <span>Solana Devnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage</span>
                <span>Decentralized + On-chain</span>
              </div>
            </div>

            {!publicKey && (
              <button
                id="connect-to-deploy"
                onClick={() => setVisible(true)}
                className="w-full py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm"
              >
                Connect Wallet to Deploy
              </button>
            )}

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 space-y-2">
                <p className="text-sm text-destructive font-medium">Transaction failed</p>
                {error.toLowerCase().includes('no record of a prior credit') || error.toLowerCase().includes('insufficient') ? (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Your wallet has no devnet SOL. Get free devnet SOL:</p>
                    <a
                      href="https://faucet.solana.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      faucet.solana.com ↗
                    </a>
                    <p className="text-muted-foreground">Paste your Phantom wallet address, select Devnet, and request SOL. Then try again.</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{error}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border/60">
          <button
            id="step-back-btn"
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={15} /> Back
          </button>

          {step < 4 ? (
            <button
              id="step-next-btn"
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ArrowRight size={15} />
            </button>
          ) : (
            <button
              id="deploy-campaign-btn"
              type="button"
              onClick={handleDeploy}
              disabled={deploying || !publicKey}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25"
            >
              {deploying ? (
                <><Loader2 size={15} className="animate-spin" /> Deploying…</>
              ) : (
                <>Deploy on Solana <ArrowRight size={15} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
