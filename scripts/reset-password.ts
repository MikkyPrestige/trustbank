import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const newPassword = args[1];

  if (!email || !newPassword) {
    console.error("Usage: npx tsx reset-password.ts <email> <newpassword>");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await db.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        failedPinAttempts: 0,
        pinLockedUntil: null
      }
    });
    console.log(`✅ Success! Password for ${user.email} has been reset.`);
  } catch (e) {
    console.error("❌ Error: User not found or DB error.");
  }
}

main();