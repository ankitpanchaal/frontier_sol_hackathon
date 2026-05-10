use {
    anchor_lang::{solana_program::instruction::Instruction, Id, InstructionData, ToAccountMetas},
    litesvm::LiteSVM,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_keypair::Keypair,
    solana_transaction::versioned::VersionedTransaction,
};

/// Test: init_issuer_state creates the IssuerState PDA correctly
#[test]
fn test_init_issuer_state() {
    let program_id = anchor::id();
    let issuer = Keypair::new();
    let mut svm = LiteSVM::new();

    // Load compiled program
    let bytes = include_bytes!("../../../target/deploy/anchor.so");
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&issuer.pubkey(), 1_000_000_000).unwrap();

    // Derive IssuerState PDA
    let (issuer_state_pda, _bump) = anchor_lang::prelude::Pubkey::find_program_address(
        &[b"issuer_state", issuer.pubkey().as_ref()],
        &program_id,
    );

    let instruction = Instruction::new_with_bytes(
        program_id,
        &anchor::instruction::InitIssuerState {}.data(),
        anchor::accounts::InitIssuerState {
            issuer: issuer.pubkey(),
            issuer_state: issuer_state_pda,
            system_program: anchor_lang::prelude::System::id(),
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&issuer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[issuer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok(), "init_issuer_state failed: {:?}", res);
}
