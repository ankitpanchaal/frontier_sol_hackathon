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
    <footer className="border-t border-border/60 bg-background/50 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Stamp size={16} className="text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Soul<span className="purple-text">Stamp</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Achievement badges you earn, not buy. The on-chain identity layer for communities, DAOs, and events on Solana.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              >
                <X size={15} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              >
                <GitFork size={15} />
              </a>
              <a
                href="#"
                aria-label="Website"
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              >
                <Globe size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={'external' in link && link.external ? '_blank' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 SoulStamp. Built on{' '}
            <span className="purple-text font-medium">Solana</span>.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">Devnet Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
