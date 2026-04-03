import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log("Starting Intelligent Balance Sync...");

  // 1. Get all accounts
  const accounts = await db.account.findMany();
  console.log(`Found ${accounts.length} accounts. Checking integrity...`);

  let updatedCount = 0;

  for (const acc of accounts) {
    // 2. Banking Equation: Current = Available + Held
    const available = Number(acc.availableBalance);
    const held = Number(acc.heldBalance);
    const current = Number(acc.currentBalance);

    const calculatedCurrent = available + held;

    // 3. Only update if the math is wrong (Drift Detection)
    if (Math.abs(current - calculatedCurrent) > 0.001) {

        console.log(`Drift detected for Account ${acc.accountNumber.slice(-4)}`);
        console.log(`  - DB Current:   $${current.toFixed(2)}`);
        console.log(`  - Should be:    $${calculatedCurrent.toFixed(2)} (Avail: ${available} + Held: ${held})`);

        await db.account.update({
            where: { id: acc.id },
            data: {
                currentBalance: calculatedCurrent
            }
        });

        console.log(`  Fixed.`);
        updatedCount++;
    }
  }

  console.log(`\n Sync Complete! Fixed ${updatedCount} accounts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });