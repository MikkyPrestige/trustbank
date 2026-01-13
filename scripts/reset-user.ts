const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

// 👇 REPLACE THIS WITH THE USER'S EMAIL
const TARGET_EMAIL = "demo@trustbank.com";

async function main() {
  console.log(`🔍 Looking for user: ${TARGET_EMAIL}...`);

  const user = await db.user.findUnique({
    where: { email: TARGET_EMAIL },
    include: { accounts: true }
  });

  if (!user) {
    console.error("❌ User not found! Check the email.");
    return;
  }

  console.log(`👤 Found User: ${user.fullName}`);
  console.log(`💳 Found ${user.accounts.length} accounts.`);

  // Loop through all accounts and set balances to 0
  for (const account of user.accounts) {
    await db.account.update({
      where: { id: account.id },
      data: {
        availableBalance: 0,
        currentBalance: 0,
      }
    });
    console.log(`✅ Reset Account ${account.accountNumber} to $0.00`);
  }

  // OPTIONAL: Delete transaction history for a true "Fresh Start"
  // Uncomment the lines below if you want to wipe their history too
  /*
  await db.ledgerEntry.deleteMany({
    where: {
        account: { userId: user.id }
    }
  });
  console.log("🗑️ Deleted transaction history.");
  */

  console.log("🎉 Reset Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });