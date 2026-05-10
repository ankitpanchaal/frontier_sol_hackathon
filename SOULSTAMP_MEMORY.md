# SoulStamp — Project Memory & Context File

> **Purpose**: This file is the AI assistant's persistent memory across chat sessions.
> Always read this file at the start of every new session to understand current project state.
> Update this file after completing each major milestone.

---

## 🧠 Project Overview

**SoulStamp** is a Solana-based platform for issuing non-transferable (soulbound) achievement badges.
Communities, DAOs, and event organizers can create badge campaigns, and recipients can claim badges that are permanently linked to their wallet — not tradeable or flippable.

**Tagline**: Achievement badges you earn, not buy.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 16 (App Router) |
| UI Library | shadCN (radix-nova style) |
| Styling | Tailwind CSS v4 |
| Blockchain | Solana (Devnet → Mainnet) |
| Smart Contract | Anchor framework (Rust) |
| Wallet Integration | `@solana/wallet-adapter-react` |
| Token Standard | Custom Anchor PDA (non-transferable by design) |
| On-chain storage | Solana accounts (PDAs) |
| Off-chain storage | Cloudinary (badge artwork) |
| Local Dev Validator | `solana-test-validator` |

---

## 📁 Project Location

- **Root**: `/Users/badho/Documents/workspace/ProofPress/SoulStamp`
- **Anchor Program** (to be created): `/Users/badho/Documents/workspace/ProofPress/SoulStamp/anchor/`

---

## ✅ Setup Status

### Completed by User
- [x] Next.js 16 project initialized with shadCN (radix-nova style, Tailwind v4)
- [x] Rush2 installed
- [x] Solana test validator installed and running (`solana-test-validator`)
- [x] `solana-test-validator` running at `http://127.0.0.1:8899`
- [x] Base UI components: `Button`, `ThemeProvider`
- [x] Fonts: Inter (sans), Geist Mono

### Completed This Session
- [x] Rust, Anchor CLI, Solana CLI all confirmed installed
- [x] Node packages installed: `@fontsource/tasa-orbiter`, `@solana/wallet-adapter-react/react-ui/wallets/base`, `@solana/web3.js`
- [x] Design system updated: TASA Orbiter font, purple/gold oklch palette, glass card, animations
- [x] `components/providers/SolanaWalletProvider.tsx` created (Devnet, auto-discover wallets)
- [x] `components/wallet/ConnectButton.tsx` created (custom dropdown, copy address, disconnect)
- [x] `components/layout/Navbar.tsx` created (sticky, mobile-responsive)
- [x] `components/layout/Footer.tsx` created
- [x] `app/page.tsx` — full landing page (hero, badges, how-it-works, features, use case, CTA)
- [x] `app/layout.tsx` — updated with metadata, providers, navbar, footer
- [x] `app/dashboard/page.tsx` — placeholder with empty state
- [x] `app/dashboard/create/page.tsx` — placeholder (Phase 4)
- [x] `app/explore/page.tsx` — placeholder
- [x] `app/verify/page.tsx` — placeholder (Phase 8)
- [x] `lib/constants.ts` — program ID, RPC, Cloudinary, PDA seeds
- [x] `.env.example` — Cloudinary setup guide
- [x] TypeScript: 0 errors ✅

---

## 🗺 User Flows Summary

### 1. Issuer (Admin) Flow
1. Connect wallet → Dashboard
2. "Create Badge" → Upload art + fill form (title, desc, eligibility rules)
3. Deploy badge campaign on-chain
4. Share claim link / QR code OR bulk issue to wallet list

### 2. Recipient Flow
1. Open claim link / scan QR
2. Connect wallet
3. Eligibility check (allowlist / open / task-based)
4. Mint badge → appears on profile

### 3. Verifier Flow
1. Open `/verify` page
2. Enter wallet address OR badge ID
3. See: issuer name, issue date, metadata, authenticity status

---

## 🗓 Development Phases

See `implementation_plan.md` for detailed breakdown. Summary:

| Phase | Name | Status |
|-------|------|--------|
| 0 | Prerequisite Setup | ✅ Done |
| 1 | Frontend Foundation (Landing + Layout) | ✅ Done |
| 2 | Wallet Integration | ✅ Done |
| 3 | Anchor Smart Contract | ✅ Done |
| 4 | Badge Creation Flow (Issuer) | ✅ Done |
| 5 | Claim Flow (Recipient) | ✅ Done |
| 6 | Profile Page | ✅ Done |
| 7 | Verification Page | ✅ Done |
| 8 | Admin Controls (Revoke/Expire) | ✅ Done (toggle + revoke on-chain) |
| 9 | QR Code Generation | ✅ Done |
| 10 | Deploy to Devnet + Demo Prep | ⬜ Not Started |

---

## 🔑 Key Decisions Made

| Decision | Choice |
|----------|--------|
| Image storage | Cloudinary (client-side unsigned upload) |
| Email eligibility | Skipped for hackathon MVP |
| Wallet UI | Standard Solana wallet adapter modal |
| Font | TASA Orbiter via `@fontsource/tasa-orbiter` |

---

## 🔑 Key Architecture Decisions

### Non-Transferable Badge
- Standard SPL tokens are transferable by default.
- We will use **Metaplex's "Token Extensions"** standard with the **NonTransferable** extension OR
  write a custom Anchor program that stores badge data in a PDA (Program Derived Address) keyed to the recipient's wallet — making transfer structurally impossible.
- **Chosen approach**: Custom Anchor PDA (simpler for hackathon, gives full control).

### Badge Data Storage
- **On-chain** (in PDA): badge_id, campaign_id, issuer_pubkey, recipient_pubkey, issued_at, is_revoked
- **Off-chain** (IPFS): badge artwork, title, description, metadata JSON

### Eligibility Methods (MVP for Hackathon)
1. **Open** — anyone with the link can claim
2. **Allowlist** — only wallets in a list can claim
3. **One-per-wallet** — enforced on-chain to prevent double claiming

---

## 📌 Current Active Task

> **Phase 10 — Deploy to Devnet + Polish**
> Run `anchor deploy` against devnet, set ACTIVE_RPC to 'devnet', set up Cloudinary env vars, final demo polish.

---

## 🚧 Known Issues / Blockers

- Use `npm run dev` (not yarn) — project has `package-lock.json`
- Anchor program not initialized yet (Phase 3)
- Cloudinary account not set up yet — user needs to create `.env.local` from `.env.example`

---

## 📝 Session Log

| Date | Session Summary |
|------|----------------|
| 2026-05-10 | Initial project analysis; created implementation plan and memory file. |
| 2026-05-10 | Phase 1+2 complete: landing page, design system, wallet integration, layout, placeholder pages. |

