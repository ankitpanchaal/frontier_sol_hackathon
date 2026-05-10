import Link from 'next/link';
import { Stamp, X, GitFork, Globe } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Explore Badges', href: '/explore' },
    { label: 'Create Campaign', href: '/dashboard/create' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Verify Badge', href: '/verify' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Solana Devnet', href: 'https://explorer.solana.com/?cluster=devnet', external: true },
    { label: 'GitHub', href: '#', external: true },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-32">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-8 h-8 bg-foreground flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Stamp size={14} className="text-background" />
              </div>
              <span className="font-bold text-lg tracking-tighter uppercase font-mono">
                SoulStamp
              </span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed font-mono uppercase tracking-tight">
              A sovereign protocol for verified achievement recognition. Permanent, non-transferable, and cryptographically secure on the Solana ledger.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <a
                href="#"
                aria-label="X (Twitter)"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitFork size={16} strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="Website"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono text-foreground mb-6">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={'external' in link && link.external ? '_blank' : undefined}
                      className="text-[10px] text-muted-foreground hover:text-foreground uppercase font-mono tracking-tight transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.1em]">
            © 2026 SOULSTAMP PROTOCOL // BUILT ON SOLANA
          </p>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500" />
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-muted-foreground">DEVNET_OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
