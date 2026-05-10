/**
 * SoulStamp — Constants
 *
 * Update PROGRAM_ID after running `anchor deploy`.
 * Update RPC_ENDPOINT to switch between local / devnet / mainnet.
 */

// ─── Solana Program ───────────────────────────────────────────────────────────
/** Replace with your deployed program ID after `anchor deploy` */
export const PROGRAM_ID = '4qt2HzwN6UNtc3fZtXJQdtFhro8dvHjbPx4UiqfoMqaG';

// ─── RPC Endpoints ───────────────────────────────────────────────────────────
export const RPC_ENDPOINTS = {
  localnet: 'http://127.0.0.1:8899',
  devnet: 'https://api.devnet.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
} as const;

/** Active endpoint — localnet for local dev, devnet for deployment */
export const ACTIVE_RPC: keyof typeof RPC_ENDPOINTS = 'devnet';
export const RPC_ENDPOINT = RPC_ENDPOINTS[ACTIVE_RPC];

// ─── Cloudinary ──────────────────────────────────────────────────────────────
/** Set these in .env.local — never hardcode secrets here */
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'soulstamp_badges';

// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_NAME = 'SoulStamp';
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ─── PDA Seeds ───────────────────────────────────────────────────────────────
/** Must match what's used in the Anchor program */
export const CAMPAIGN_SEED = 'campaign';
export const BADGE_SEED = 'badge';
