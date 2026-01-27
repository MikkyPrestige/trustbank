import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const db = new PrismaClient();

// --- CLI INPUT HELPER ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
    // 1. GET TARGET EMAIL
    const args = process.argv.slice(2);
    let targetEmail = args[0];

    if (!targetEmail) {
        targetEmail = await askQuestion("Enter the user's email to reset: ");
    }

    if (!targetEmail) {
        console.error("❌ No email provided. Exiting.");
        process.exit(1);
    }

    // 2. FIND USER & RELATED DATA
    console.log(`\n Searching for user: ${targetEmail}...`);

    const user = await db.user.findUnique({
        where: { email: targetEmail },
        include: {
            accounts: true,
            cards: true,
            loans: true,
            wireTransfers: true,
            cryptoAssets: true,
            cryptoTransactions: true,
            beneficiaries: true,
            Notification: true,
            Ticket: true
        }
    });

    if (!user) {
        console.error("❌ User not found!");
        process.exit(1);
    }

    // 3. SHOW SUMMARY
    console.log(`\n------------------------------------------------`);
    console.log(`FOUND USER: ${user.fullName}`);
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user.id}`);
    console.log(`------------------------------------------------`);
    console.log(`DATA TO BE WIPED/RESET:`);
    console.log(`   - Accounts:          ${user.accounts.length} (Balances will be $0)`);
    console.log(`   - Cards:             ${user.cards.length} (Will be Unblocked)`);
    console.log(`   - Wire Transfers:    ${user.wireTransfers.length}`);
    console.log(`   - Active Loans:      ${user.loans.length}`);
    console.log(`   - Crypto Assets:     ${user.cryptoAssets.length}`);
    console.log(`   - Crypto History:    ${user.cryptoTransactions.length}`);
    console.log(`   - Beneficiaries:     ${user.beneficiaries.length}`);
    console.log(`   - Notifications:     ${user.Notification.length}`);
    console.log(`   - Support Tickets:   ${user.Ticket.length}`);
    console.log(`------------------------------------------------`);

    const answer = await askQuestion(`ARE YOU SURE YOU WANT TO RESET THIS USER? (yes/no): `);

    if (answer.toLowerCase() !== 'yes') {
        console.log("Operation cancelled.");
        process.exit(0);
    }

    console.log("\n Starting Reset Process...");

    // --- 4. DELETION PHASE ---
    // A. Delete Ledger Entries (Linked to Accounts)
    const accountIds = user.accounts.map(acc => acc.id);
    if (accountIds.length > 0) {
        const deletedLedgers = await db.ledgerEntry.deleteMany({
            where: { accountId: { in: accountIds } }
        });
        console.log(`Deleted ${deletedLedgers.count} Ledger/Transaction entries.`);
    }

    // B. Delete Wire Transfers
    const deletedWires = await db.wireTransfer.deleteMany({
        where: { userId: user.id }
    });
    console.log(`Deleted ${deletedWires.count} Wire Transfers.`);

    // C. Delete Loans
    const deletedLoans = await db.loan.deleteMany({
        where: { userId: user.id }
    });
    console.log(`Deleted ${deletedLoans.count} Loans.`);

    // D. Delete Crypto Data (Assets & History)
    await db.cryptoAsset.deleteMany({ where: { userId: user.id } });
    const deletedCryptoTx = await db.cryptoTransaction.deleteMany({ where: { userId: user.id } });
    console.log(`Deleted Crypto Portfolio & ${deletedCryptoTx.count} transactions.`);

    // E. Delete Support Tickets
    const deletedTickets = await db.ticket.deleteMany({
        where: { userId: user.id }
    });
    console.log(`Deleted ${deletedTickets.count} Support Tickets.`);

    // F. Delete Notifications & Beneficiaries
    await db.notification.deleteMany({ where: { userId: user.id } });
    await db.beneficiary.deleteMany({ where: { userId: user.id } });
    console.log(`Deleted Notifications & Beneficiaries.`);


    // --- 5. RESET PHASE (UPDATES) ---
    // A. Reset Accounts (Zero Balance & Active Status)
    for (const account of user.accounts) {
        await db.account.update({
            where: { id: account.id },
            data: {
                availableBalance: 0,
                currentBalance: 0,
                heldBalance: 0,
                status: 'ACTIVE'
            }
        });
    }
    console.log(`Reset ${user.accounts.length} accounts to $0.00 & ACTIVE.`);

    // B. Reset Cards (Unblock)
    for (const card of user.cards) {
        await db.card.update({
            where: { id: card.id },
            data: {
                status: 'ACTIVE',
            }
        });
    }
    console.log(`Unblocked ${user.cards.length} cards.`);

    // C. Reset User Profile Flags
    // Unfreeze user, reset login attempts, clear IP locks
    await db.user.update({
        where: { id: user.id },
        data: {
            status: 'ACTIVE',
            failedLoginAttempts: 0,
            failedPinAttempts: 0,
            pinLockedUntil: null,
            kycStatus: 'PENDING',
        }
    });
    console.log(`User profile Unfrozen & Security counters reset.`);

    console.log(`\n SUCCESS! User ${user.email} has been completely reset.`);
}

main()
    .catch((e) => {
        console.error("\n ERROR:", e);
        process.exit(1);
    })
    .finally(async () => {
        rl.close();
        await db.$disconnect();
    });