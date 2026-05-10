/**
 * SoulStamp — Anchor program client (browser-side)
 *
 * This wraps @coral-xyz/anchor to give us typed instruction builders
 * that can be used from React components.
 *
 * NOTE: The IDL is generated after `anchor build`. Until the program
 * is deployed, this file exports helpers that will throw if called
 * without a valid program ID + IDL.
 */

import { AnchorProvider, Program, BN, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { PROGRAM_ID, CAMPAIGN_SEED, BADGE_SEED, RPC_ENDPOINT } from '@/lib/constants';

// ─── IDL type stub (filled in after anchor build generates the IDL) ─────────
// After `anchor build`, copy anchor/target/idl/anchor.json here or import it.
// For now, we use a minimal stub so the rest of the frontend can compile.
const IDL_STUB = { address: PROGRAM_ID, metadata: { name: 'anchor', spec: '0.1.0' }, instructions: [], accounts: [], types: [] } as unknown as Idl;

let _idl: Idl = IDL_STUB;

/** Call this once after the IDL JSON is available (post anchor build) */
export function loadIdl(idl: Idl) {
  _idl = idl;
}

// ─── PDA Derivation Helpers ────────────────────────────────────────────────

export function getCampaignPDA(issuer: PublicKey, campaignId: number): [PublicKey, number] {
  // writeBigUInt64LE is not available in the browser Buffer polyfill.
  // Encode the u64 campaign ID as 8 bytes little-endian using two 32-bit halves.
  const idBuf = Buffer.alloc(8);
  const lo = campaignId >>> 0;                        // low 32 bits
  const hi = Math.floor(campaignId / 0x100000000);    // high 32 bits
  idBuf.writeUInt32LE(lo, 0);
  idBuf.writeUInt32LE(hi, 4);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(CAMPAIGN_SEED), issuer.toBuffer(), idBuf],
    new PublicKey(PROGRAM_ID)
  );
}

export function getBadgeRecordPDA(campaignPubkey: PublicKey, recipient: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BADGE_SEED), campaignPubkey.toBuffer(), recipient.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}

export function getIssuerStatePDA(issuer: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('issuer_state'), issuer.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
}

// ─── Program getter ────────────────────────────────────────────────────────

export function getProgram(provider: AnchorProvider): Program {
  return new Program(_idl, provider);
}

export function getConnection(): Connection {
  return new Connection(RPC_ENDPOINT, 'confirmed');
}

// ─── On-chain data fetchers ───────────────────────────────────────────────

export interface CampaignData {
  publicKey: PublicKey;
  issuer: PublicKey;
  campaignId: number;
  title: string;
  description: string;
  metadataUri: string;
  eventName: string;
  category: string;
  eligibilityType: { open: Record<string, never> } | { allowlist: Record<string, never> };
  maxSupply: BN;
  issuedCount: BN;
  isActive: boolean;
  createdAt: BN;
}

export interface BadgeRecordData {
  publicKey: PublicKey;
  campaign: PublicKey;
  recipient: PublicKey;
  issuedAt: BN;
  isRevoked: boolean;
}

/**
 * Fetch all campaigns created by an issuer wallet.
 * We use getProgramAccounts with a memcmp filter on the issuer field (offset 8 = after discriminator).
 */
export async function fetchCampaignsByIssuer(
  provider: AnchorProvider,
  issuer: PublicKey
): Promise<CampaignData[]> {
  try {
    const program = getProgram(provider);
    // @ts-expect-error: campaign account type loaded at runtime from IDL
    const accounts = await program.account.campaign.all([
      { memcmp: { offset: 8, bytes: issuer.toBase58() } },
    ]);
    return accounts.map((a: { publicKey: PublicKey; account: Record<string, unknown> }) => ({ publicKey: a.publicKey, ...a.account })) as CampaignData[];
  } catch {
    return [];
  }
}

/** Fetch all BadgeRecord PDAs for a given recipient wallet */
export async function fetchBadgesByRecipient(
  provider: AnchorProvider,
  recipient: PublicKey
): Promise<BadgeRecordData[]> {
  try {
    const program = getProgram(provider);
    // offset 8 (disc) + 32 (campaign pubkey) = 40 → recipient field
    // @ts-expect-error: badgeRecord account type loaded at runtime from IDL
    const accounts = await program.account.badgeRecord.all([
      { memcmp: { offset: 40, bytes: recipient.toBase58() } },
    ]);
    return accounts.map((a: { publicKey: PublicKey; account: Record<string, unknown> }) => ({ publicKey: a.publicKey, ...a.account })) as BadgeRecordData[];
  } catch {
    return [];
  }
}

/** Fetch a single campaign by its PDA */
export async function fetchCampaign(
  provider: AnchorProvider,
  campaignPubkey: PublicKey
): Promise<CampaignData | null> {
  try {
    const program = getProgram(provider);
    // @ts-expect-error: dynamic IDL
    const account = await program.account.campaign.fetch(campaignPubkey);
    return { publicKey: campaignPubkey, ...account } as CampaignData;
  } catch {
    return null;
  }
}

/** Fetch a BadgeRecord (returns null if not found / not claimed) */
export async function fetchBadgeRecord(
  provider: AnchorProvider,
  campaignPubkey: PublicKey,
  recipient: PublicKey
): Promise<BadgeRecordData | null> {
  try {
    const [pda] = getBadgeRecordPDA(campaignPubkey, recipient);
    const program = getProgram(provider);
    // @ts-expect-error: dynamic IDL
    const account = await program.account.badgeRecord.fetch(pda);
    return { publicKey: pda, ...account } as BadgeRecordData;
  } catch {
    return null;
  }
}
