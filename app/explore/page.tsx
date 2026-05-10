import type { Metadata } from 'next';
import { Search, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Badges',
  description: 'Browse public badge campaigns on SoulStamp.',
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-left mb-16 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tighter uppercase font-mono mb-4">Discovery</h1>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-tight">
          Browse verified badge campaigns across the Solana ecosystem.
        </p>
      </div>

      {/* Search bar (placeholder) */}
      <div className="relative max-w-xl mb-16">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="SEARCH REGISTRY..."
          className="w-full pl-10 pr-4 py-3 border border-border bg-card text-xs font-mono uppercase tracking-tight focus:outline-none focus:border-foreground transition-colors"
          disabled
        />
      </div>

      {/* Empty state */}
      <div className="border border-dashed border-border flex flex-col items-center justify-center py-32 gap-6 bg-card/50">
        <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center">
          <Compass size={24} strokeWidth={1} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="font-bold text-sm uppercase font-mono mb-2 tracking-tight">Registry Empty</h2>
          <p className="text-muted-foreground text-[10px] uppercase font-mono max-w-xs leading-relaxed tracking-widest">
            Pending on-chain deployment of the SoulStamp Anchor protocol.
          </p>
        </div>
      </div>

      <div className="mt-12 p-6 border border-border bg-accent/20">
        <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Notice:</strong> Live registry population is scheduled for Phase 4+. All campaigns are currently private or testing.
        </p>
      </div>
    </div>
  );
}
