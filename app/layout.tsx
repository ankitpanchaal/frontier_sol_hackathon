import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import SolanaWalletProvider from '@/components/providers/SolanaWalletProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'SoulStamp — Achievement Badges You Earn, Not Buy',
    template: '%s | SoulStamp',
  },
  description:
    'Issue permanent, non-transferable Web3 badges on Solana. Prove real participation and achievements with soulbound identity-linked recognition.',
  keywords: ['Solana', 'soulbound', 'NFT badges', 'POAP', 'Web3 identity', 'non-transferable'],
  openGraph: {
    title: 'SoulStamp — Achievement Badges You Earn, Not Buy',
    description:
      'Issue permanent, non-transferable Web3 badges on Solana for events, DAOs, and communities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('antialiased', fontMono.variable)}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <SolanaWalletProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
