import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  QrCode,
  UserCheck,
  BadgeCheck,
  Zap,
  Lock,
  Globe,
  ArrowRight,
  Stamp,
  Star,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'SoulStamp — Achievement Badges You Earn, Not Buy',
  description:
    'Issue permanent, non-transferable Web3 badges on Solana. Prove real participation with soulbound identity-linked recognition.',
};

const features = [
  {
    icon: Stamp,
    title: 'Badge Campaign Creator',
    description:
      'Create a badge in minutes. Add title, artwork, eligibility rules, and deploy it on-chain — no code needed.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Lock,
    title: 'Non-Transferable Minting',
    description:
      "Badges are permanently tied to the recipient's wallet. No trading, no buying — only earning.",
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: QrCode,
    title: 'Claim via QR / Link',
    description:
      'Generate a claim page or QR code for live events. Attendees scan and mint in seconds.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: UserCheck,
    title: 'Eligibility Rules',
    description:
      'Control who can claim. Set open access or restrict to a wallet allowlist for private campaigns.',
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Globe,
    title: 'Public Badge Profile',
    description:
      'Every wallet gets a public showcase page displaying all earned badges as a verified achievement history.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Shield,
    title: 'Verification Page',
    description:
      "Anyone can verify a badge's authenticity by entering a wallet address or badge ID — no trust required.",
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
];

const steps = [
  {
    number: '01',
    title: 'Admin creates a badge',
    description: 'Connect wallet, fill in badge details, upload artwork, set eligibility rules, and deploy on Solana.',
    icon: Stamp,
  },
  {
    number: '02',
    title: 'User claims the badge',
    description: 'Attendees scan a QR or open a link, connect their wallet, and mint the badge to their identity.',
    icon: BadgeCheck,
  },
  {
    number: '03',
    title: 'Badge is publicly verified',
    description: "The badge appears on their profile and can be verified by anyone — proof that's actually useful.",
    icon: Shield,
  },
];

const exampleBadges = [
  {
    emoji: '🎤',
    name: 'Early Launch Attendee',
    issuer: 'startupXYZ',
    date: 'Apr 2026',
    color: 'from-violet-500/20 to-purple-600/20',
    border: 'border-violet-500/30',
  },
  {
    emoji: '🏆',
    name: 'DAO OG Member',
    issuer: 'solanaDAO',
    date: 'Mar 2026',
    color: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
  },
  {
    emoji: '🎓',
    name: 'Completed Onboarding',
    issuer: 'defiProtocol',
    date: 'Feb 2026',
    color: 'from-sky-500/20 to-cyan-500/20',
    border: 'border-sky-500/30',
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center border-b border-border">
        <div className="relative mx-auto max-w-5xl px-6 text-center py-24">
          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 animate-slide-up leading-[0.9] uppercase font-mono">
            Achievement <br />
            Badges <br />
            You <span className="text-muted-foreground italic">Earn</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed animate-slide-up font-mono uppercase tracking-tight" style={{ animationDelay: '0.1s' }}>
            SoulStamp issues permanent, non-transferable Web3 badges on Solana. Prove real participation, not wealth.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Link
              href="/dashboard/create"
              id="hero-create-badge"
              className="w-full sm:w-auto px-8 py-3 bg-foreground text-background font-bold font-mono text-sm uppercase hover:opacity-90 transition-opacity"
            >
              Start Issuing
            </Link>
            <Link
              href="/explore"
              id="hero-explore"
              className="w-full sm:w-auto px-8 py-3 border border-border font-bold font-mono text-sm uppercase hover:bg-accent transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </section>

      {/* Example Badges Floating Showcase */}
      <section className="py-24 px-6 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] font-mono text-muted-foreground">
              Recent Emissions
            </h2>
            <div className="h-px flex-1 mx-8 bg-border hidden sm:block" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-l border-border">
            {exampleBadges.map((badge, i) => (
              <div
                key={badge.name}
                className="group relative border-r border-b border-border p-8 bg-card hover:bg-accent transition-colors duration-200"
              >
                <div className="text-3xl mb-6 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{badge.emoji}</div>
                <h3 className="font-bold text-sm mb-2 uppercase font-mono tracking-tight">{badge.name}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                  {badge.issuer} // {badge.date}
                </p>
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase font-mono">
                  <BadgeCheck size={12} />
                  Verified on Solana
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-left mb-16 max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tighter uppercase font-mono mb-4">The Protocol</h2>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
              A streamlined flow for verified achievement recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col gap-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold font-mono tracking-tighter text-border group-hover:text-foreground transition-colors leading-none">{step.number}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div>
                  <h3 className="font-bold mb-3 uppercase font-mono text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed uppercase tracking-tight">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-left mb-16 max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tighter uppercase font-mono mb-4">Infrastructure</h2>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
              Everything required for sovereign community identity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group border-r border-b border-border p-8 hover:bg-accent transition-all duration-200"
              >
                <div className="w-8 h-8 flex items-center justify-center mb-6 text-foreground">
                  <feature.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold mb-3 uppercase font-mono text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed uppercase tracking-tight">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-8 uppercase font-mono leading-none">
            Ready to <br /> Stamp Your Legacy?
          </h2>
          <p className="text-muted-foreground mb-12 text-sm uppercase font-mono tracking-tight max-w-xl mx-auto">
            Deploy your first verified badge campaign on Solana in under five minutes.
          </p>
          <Link
            href="/dashboard/create"
            id="cta-create-badge"
            className="inline-flex items-center gap-3 px-12 py-4 bg-foreground text-background font-bold font-mono text-sm uppercase hover:opacity-90 transition-opacity"
          >
            Launch Campaign
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
