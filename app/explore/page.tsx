import type { Metadata } from 'next';
import { Search, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Badges',
  description: 'Browse public badge campaigns on SoulStamp.',
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Explore Badges</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Discover public badge campaigns from communities, DAOs, and events on Solana.
        </p>
      </div>

      {/* Search bar (placeholder) */}
      <div className="relative max-w-lg mx-auto mb-12">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search badges or issuers…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          disabled
        />
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Compass size={28} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-lg mb-2">No public badges yet</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Once campaigns are deployed on-chain, they'll appear here for the world to see.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-amber-500/5 border-amber-500/20 p-4">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          <strong>Coming in Phase 4+:</strong> Live on-chain campaign data will populate this page after the Anchor program is deployed.
        </p>
      </div>
    </div>
  );
}
