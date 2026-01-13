// scripts/sync-balances.ts
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
  console.log("🔄 Starting Balance Sync...");

  // 1. Get all accounts
  const accounts = await db.account.findMany();

  console.log(`Found ${accounts.length} accounts.`);

  // 2. Loop through and update Current Balance to match Available Balance
  for (const acc of accounts) {
    // Only update if currentBalance is 0 (to avoid overwriting valid data if any exists)
    // Or just overwrite all if you want a clean slate.
    if (Number(acc.currentBalance) === 0) {
        await db.account.update({
            where: { id: acc.id },
            data: {
                currentBalance: acc.availableBalance // <--- COPY THE MONEY OVER
            }
        });
        console.log(`✅ Synced Account ${acc.accountNumber}: $${acc.availableBalance}`);
    }
  }

  console.log("🎉 All balances synced successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });