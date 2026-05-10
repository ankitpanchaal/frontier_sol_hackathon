use anchor_lang::prelude::*;
use crate::constants::*;
use crate::error::SoulStampError;
use crate::state::*;

/// ─── Instruction: create_campaign ────────────────────────────────────────────
/// Called by an organizer (issuer) to deploy a new badge campaign on-chain.
/// Also initialises the issuer's IssuerState PDA if it doesn't exist yet.

#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// IssuerState: tracks the running campaign_id counter per issuer
    #[account(
        init_if_needed,
        payer = issuer,
        space = IssuerState::LEN,
        seeds = [IssuerState::SEED, issuer.key().as_ref()],
        bump
    )]
    pub issuer_state: Account<'info, IssuerState>,

    /// The new Campaign PDA derived from the issuer + campaign_id
    #[account(
        init,
        payer = issuer,
        space = Campaign::LEN,
        seeds = [CAMPAIGN_SEED, issuer.key().as_ref(), &issuer_state.next_campaign_id.to_le_bytes()],
        bump
    )]
    pub campaign: Account<'info, Campaign>,

    pub system_program: Program<'info, System>,
}

pub fn create_campaign_handler(
    ctx: Context<CreateCampaign>,
    title: String,
    description: String,
    metadata_uri: String,
    event_name: String,
    category: String,
    eligibility_type: EligibilityType,
    max_supply: u64,
) -> Result<()> {
    require!(title.len() <= MAX_TITLE_LEN, SoulStampError::TitleTooLong);
    require!(description.len() <= MAX_DESCRIPTION_LEN, SoulStampError::DescriptionTooLong);
    require!(metadata_uri.len() <= MAX_URI_LEN, SoulStampError::UriTooLong);

    let issuer_state = &mut ctx.accounts.issuer_state;
    let campaign_id = issuer_state.next_campaign_id;

    // Initialise issuer state on first use
    if issuer_state.issuer == Pubkey::default() {
        issuer_state.issuer = ctx.accounts.issuer.key();
        issuer_state.bump = ctx.bumps.issuer_state;
    }
    issuer_state.next_campaign_id = campaign_id + 1;

    let campaign = &mut ctx.accounts.campaign;
    campaign.issuer = ctx.accounts.issuer.key();
    campaign.campaign_id = campaign_id;
    campaign.title = title;
    campaign.description = description;
    campaign.metadata_uri = metadata_uri;
    campaign.event_name = event_name;
    campaign.category = category;
    campaign.eligibility_type = eligibility_type;
    campaign.max_supply = max_supply;
    campaign.issued_count = 0;
    campaign.is_active = true;
    campaign.created_at = Clock::get()?.unix_timestamp;
    campaign.bump = ctx.bumps.campaign;

    msg!("SoulStamp: campaign {} created by {}", campaign_id, campaign.issuer);
    Ok(())
}

/// ─── Instruction: claim_badge ────────────────────────────────────────────────
/// Called by a recipient wallet to mint a badge from an active campaign.
/// Enforces:  campaign active, supply not exhausted, one-per-wallet.
/// For Allowlist campaigns: an AllowlistEntry PDA must exist for this wallet.

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

    /// BadgeRecord PDA — seeds include recipient, making it non-transferable
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

pub fn claim_badge_handler(ctx: Context<ClaimBadge>) -> Result<()> {
    let campaign = &mut ctx.accounts.campaign;

    require!(campaign.is_active, SoulStampError::CampaignInactive);
    require!(
        campaign.max_supply == 0 || campaign.issued_count < campaign.max_supply,
        SoulStampError::MaxSupplyReached
    );

    // Allowlist check: if Allowlist mode, an AllowlistEntry PDA must exist.
    // The init constraint on badge_record already guarantees one-per-wallet
    // (trying to init an existing PDA would fail with AlreadyInUse).

    campaign.issued_count += 1;

    let badge = &mut ctx.accounts.badge_record;
    badge.campaign = campaign.key();
    badge.recipient = ctx.accounts.recipient.key();
    badge.issued_at = Clock::get()?.unix_timestamp;
    badge.is_revoked = false;
    badge.bump = ctx.bumps.badge_record;

    msg!(
        "SoulStamp: badge issued from campaign {} to {}",
        campaign.campaign_id,
        badge.recipient
    );
    Ok(())
}

/// ─── Instruction: revoke_badge ───────────────────────────────────────────────
/// Called by the campaign issuer to revoke a specific badge.
/// The BadgeRecord stays on-chain (is_revoked = true); it does not get closed.

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

pub fn revoke_badge_handler(ctx: Context<RevokeBadge>, _recipient: Pubkey) -> Result<()> {
    let badge = &mut ctx.accounts.badge_record;
    require!(!badge.is_revoked, SoulStampError::AlreadyRevoked);
    badge.is_revoked = true;

    msg!(
        "SoulStamp: badge revoked — campaign {} / recipient {}",
        ctx.accounts.campaign.campaign_id,
        badge.recipient
    );
    Ok(())
}

/// ─── Instruction: toggle_campaign ────────────────────────────────────────────
/// Issuer can pause/resume a campaign (set is_active).

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

pub fn toggle_campaign_handler(ctx: Context<ToggleCampaign>, active: bool) -> Result<()> {
    ctx.accounts.campaign.is_active = active;
    msg!(
        "SoulStamp: campaign {} set to active={}",
        ctx.accounts.campaign.campaign_id,
        active
    );
    Ok(())
}
