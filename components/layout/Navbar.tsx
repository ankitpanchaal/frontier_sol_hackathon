'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Stamp } from 'lucide-react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/verify', label: 'Verify' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            id="navbar-logo"
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 bg-foreground flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Stamp size={14} className="text-background" />
            </div>
            <span className="font-bold text-base tracking-tighter uppercase font-mono">
              SoulStamp
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium font-mono tracking-tight transition-colors',
                  pathname === link.href
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard/create"
              id="navbar-create-badge"
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-mono uppercase',
                'border border-border hover:bg-accent transition-colors',
                'text-foreground'
              )}
            >
              + Create
            </Link>
            <ConnectButton />
          </div>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 flex flex-col gap-2">
              <Link
                href="/dashboard/create"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-center hover:bg-muted/60 transition-colors"
              >
                + Create Badge
              </Link>
              <ConnectButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
