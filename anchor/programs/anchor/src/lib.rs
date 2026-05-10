use anchor_lang::prelude::*;

declare_id!("4qt2HzwN6UNtc3fZtXJQdtFhro8dvHjbPx4UiqfoMqaG");

// ─── Constants ────────────────────────────────────────────────────────────────
const CAMPAIGN_SEED: &[u8] = b"campaign";
const BADGE_SEED: &[u8] = b"badge";
const ISSUER_STATE_SEED: &[u8] = b"issuer_state";

// ─── Errors ───────────────────────────────────────────────────────────────────
#[error_code]
pub enum SoulStampError {
    #[msg("Campaign is no longer active")]
    CampaignInactive,
    #[msg("Campaign has reached maximum supply")]
    MaxSupplyReached,
    #[msg("Only the campaign issuer can perform this action")]
    Unauthorized,
    #[msg("Badge has already been revoked")]
    AlreadyRevoked,
    #[msg("Title exceeds 64 bytes")]
    TitleTooLong,
    #[msg("Description exceeds 256 bytes")]
    DescriptionTooLong,
    #[msg("URI exceeds 200 bytes")]
    UriTooLong,
}

// ─── State ────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EligibilityType {
    Open,
    Allowlist,
}

#[account]
pub struct IssuerState {
    pub issuer: Pubkey,
    pub next_campaign_id: u64,
    pub bump: u8,
}
impl IssuerState {
    pub const LEN: usize = 8 + 32 + 8 + 1;
}

#[account]
pub struct Campaign {
    pub issuer: Pubkey,
    pub campaign_id: u64,
    pub title: String,
    pub description: String,
    pub metadata_uri: String,
    pub event_name: String,
    pub category: String,
    pub eligibility_type: EligibilityType,
    pub max_supply: u64,
    pub issued_count: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}
impl Campaign {
    pub const LEN: usize = 8 + 32 + 8
        + (4 + 64)   // title
        + (4 + 256)  // description
        + (4 + 200)  // metadata_uri
        + (4 + 64)   // event_name
        + (4 + 32)   // category
        + 1 + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct BadgeRecord {
    pub campaign: Pubkey,
    pub recipient: Pubkey,
    pub issued_at: i64,
    pub is_revoked: bool,
    pub bump: u8,
}
impl BadgeRecord {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1 + 1;
}

// ─── Account Contexts ─────────────────────────────────────────────────────────

/// init_issuer_state — must be called once per issuer before creating campaigns
#[derive(Accounts)]
pub struct InitIssuerState<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        init,
        payer = issuer,
        space = IssuerState::LEN,
        seeds = [ISSUER_STATE_SEED, issuer.key().as_ref()],
        bump
    )]
    pub issuer_state: Account<'info, IssuerState>,

    pub system_program: Program<'info, System>,
}

/// create_campaign — campaign_id passed explicitly (client reads it from IssuerState first)
#[derive(Accounts)]
#[instruction(campaign_id: u64)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        seeds = [ISSUER_STATE_SEED, issuer.key().as_ref()],
        bump = issuer_state.bump,
    )]
    pub issuer_state: Account<'info, IssuerState>,

    #[account(
        init,
        payer = issuer,
        space = Campaign::LEN,
        seeds = [CAMPAIGN_SEED, issuer.key().as_ref(), &campaign_id.to_le_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimBadge<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,

    #[account(
        mut,
        seeds = [CAMPAIGN_SEED, campaign.issuer.as_ref(), &campaign.campaign_id.to_le_bytes()],
        bump = campaign.bump,
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        init,
        payer = recipient,
        space = BadgeRecord::LEN,
        seeds = [BADGE_SEED, campaign.key().as_ref(), recipient.key().as_ref()],
        bump
    )]
    pub badge_record: Account<'info, BadgeRecord>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(recipient: Pubkey)]
pub struct RevokeBadge<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        seeds = [CAMPAIGN_SEED, issuer.key().as_ref(), &campaign.campaign_id.to_le_bytes()],
        bump = campaign.bump,
        has_one = issuer @ SoulStampError::Unauthorized,
    )]
    pub campaign: Account<'info, Campaign>,

    #[account(
        mut,
        seeds = [BADGE_SEED, campaign.key().as_ref(), recipient.as_ref()],
        bump = badge_record.bump,
    )]
    pub badge_record: Account<'info, BadgeRecord>,
}

#[derive(Accounts)]
pub struct ToggleCampaign<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        seeds = [CAMPAIGN_SEED, issuer.key().as_ref(), &campaign.campaign_id.to_le_bytes()],
        bump = campaign.bump,
        has_one = issuer @ SoulStampError::Unauthorized,
    )]
    pub campaign: Account<'info, Campaign>,
}

// ─── Program ──────────────────────────────────────────────────────────────────

#[program]
pub mod anchor {
    use super::*;

    /// One-time setup: initialise the IssuerState counter for a new issuer wallet
    pub fn init_issuer_state(ctx: Context<InitIssuerState>) -> Result<()> {
        let s = &mut ctx.accounts.issuer_state;
        s.issuer = ctx.accounts.issuer.key();
        s.next_campaign_id = 0;
        s.bump = ctx.bumps.issuer_state;
        msg!("SoulStamp: issuer state initialised for {}", s.issuer);
        Ok(())
    }

    /// Create a new badge campaign
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        campaign_id: u64,
        title: String,
        description: String,
        metadata_uri: String,
        event_name: String,
        category: String,
        eligibility_type: EligibilityType,
        max_supply: u64,
    ) -> Result<()> {
        require!(title.len() <= 64, SoulStampError::TitleTooLong);
        require!(description.len() <= 256, SoulStampError::DescriptionTooLong);
        require!(metadata_uri.len() <= 200, SoulStampError::UriTooLong);

        // Advance the counter
        ctx.accounts.issuer_state.next_campaign_id += 1;

        let c = &mut ctx.accounts.campaign;
        c.issuer = ctx.accounts.issuer.key();
        c.campaign_id = campaign_id;
        c.title = title;
        c.description = description;
        c.metadata_uri = metadata_uri;
        c.event_name = event_name;
        c.category = category;
        c.eligibility_type = eligibility_type;
        c.max_supply = max_supply;
        c.issued_count = 0;
        c.is_active = true;
        c.created_at = Clock::get()?.unix_timestamp;
        c.bump = ctx.bumps.campaign;

        msg!("SoulStamp: campaign {} created by {}", campaign_id, c.issuer);
        Ok(())
    }

    /// Recipient claims a badge (one per wallet enforced by PDA init)
    pub fn claim_badge(ctx: Context<ClaimBadge>) -> Result<()> {
        let c = &mut ctx.accounts.campaign;
        require!(c.is_active, SoulStampError::CampaignInactive);
        require!(
            c.max_supply == 0 || c.issued_count < c.max_supply,
            SoulStampError::MaxSupplyReached
        );
        c.issued_count += 1;

        let b = &mut ctx.accounts.badge_record;
        b.campaign = c.key();
        b.recipient = ctx.accounts.recipient.key();
        b.issued_at = Clock::get()?.unix_timestamp;
        b.is_revoked = false;
        b.bump = ctx.bumps.badge_record;

        msg!("SoulStamp: badge claimed by {}", b.recipient);
        Ok(())
    }

    /// Issuer revokes a badge (stays on-chain, is_revoked = true)
    pub fn revoke_badge(ctx: Context<RevokeBadge>, _recipient: Pubkey) -> Result<()> {
        let b = &mut ctx.accounts.badge_record;
        require!(!b.is_revoked, SoulStampError::AlreadyRevoked);
        b.is_revoked = true;
        msg!("SoulStamp: badge revoked for {}", b.recipient);
        Ok(())
    }

    /// Issuer pauses / resumes a campaign
    pub fn toggle_campaign(ctx: Context<ToggleCampaign>, active: bool) -> Result<()> {
        ctx.accounts.campaign.is_active = active;
        msg!(
            "SoulStamp: campaign {} is_active={}",
            ctx.accounts.campaign.campaign_id,
            active
        );
        Ok(())
    }
}
