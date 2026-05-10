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
    <div className="relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center hero-gradient">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center py-20">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold mb-8 animate-fade-in">
            <Zap size={12} className="fill-current" />
            Built on Solana · Soulbound Badges
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up leading-[1.05]">
            Achievement badges{' '}
            <br className="hidden sm:block" />
            you{' '}
            <span className="gold-text">earn</span>
            {', '}not{' '}
            <span className="purple-text">buy</span>.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            SoulStamp lets communities issue permanent, non-transferable Web3 badges that prove real
            participation — not wealth. Perfect for events, DAOs, and onboarding.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Link
              href="/dashboard/create"
              id="hero-create-badge"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/30 text-sm"
            >
              Create Your First Badge
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/explore"
              id="hero-explore"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border hover:bg-muted/60 transition-all duration-200 text-sm"
            >
              Explore Badges
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Non-transferable · On-chain verifiable · Solana-powered
          </p>
        </div>
      </section>

      {/* Example Badges Floating Showcase */}
      <section className="py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-widest">
            Example Badges
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {exampleBadges.map((badge, i) => (
              <div
                key={badge.name}
                className={`relative rounded-2xl border ${badge.border} bg-gradient-to-br ${badge.color} p-6 hover:-translate-y-1 transition-transform duration-300 animate-slide-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{badge.emoji}</div>
                <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Issued by @{badge.issuer} · {badge.date}
                </p>
                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <BadgeCheck size={13} />
                  Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 bg-muted/20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Simple 3-step flow
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How SoulStamp works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-1rem)] w-8 h-px bg-border z-10" />
                )}
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon size={22} className="text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-border/80">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for real communities
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From hackathon launches to DAO governance — SoulStamp handles every type of
              achievement recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon size={20} className={feature.color} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Case Block */}
      <section className="py-20 px-4 sm:px-6 bg-muted/20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 sm:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Star size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                  Real use case
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  From QR scan to exclusive access
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                A startup hosts a launch meetup. Attendees scan a QR at the venue and claim an{' '}
                <strong className="text-foreground">"Early Launch Attendee"</strong> badge. Because it's
                non-transferable, only real attendees have it.
              </p>
              <p className="leading-relaxed">
                Later, the startup rewards badge holders with{' '}
                <strong className="text-foreground">
                  gated Discord access, whitelist perks, or early product access
                </strong>{' '}
                — without needing to trust a screenshot or a claim.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/create"
                id="usecase-create-badge"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 text-sm shadow-lg shadow-primary/25"
              >
                Start issuing badges
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/verify"
                id="usecase-verify"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border hover:bg-muted/60 transition-all duration-200 text-sm"
              >
                Verify a badge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to stamp your{' '}
            <span className="purple-text">community's</span> legacy?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Connect your wallet and launch your first badge campaign in under 5 minutes.
          </p>
          <Link
            href="/dashboard/create"
            id="cta-create-badge"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-200 shadow-xl shadow-primary/30 text-base"
          >
            Create a Badge Campaign
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
