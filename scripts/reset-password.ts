import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const newPassword = args[1];

  if (!email || !newPassword) {
    console.error("Usage: npx tsx scripts/reset-password.ts <email> <newpassword>");
    process.exit(1);
  }

  console.log(`Resetting password for: ${email}...`);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await db.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        failedLoginAttempts: 0,
        failedPinAttempts: 0,
        pinLockedUntil: null,
        status: 'ACTIVE'
      }
    });
    console.log(`Success! Password reset for ${user.fullName}.`);
    console.log(`   (Locks cleared & Fail counters reset to 0)`);

  } catch (e: any) {
    if (e.code === 'P2025') {
        console.error("Error: User not found.");
    } else {
        console.error("Database Error:", e.message);
    }
  }
}

main()
  .finally(async () => {
    await db.$disconnect();
  });