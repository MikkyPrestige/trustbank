import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Get arguments from command line: "npx tsx scripts/create-role.ts support john@trustbank.com"
  const args = process.argv.slice(2);
  const roleArg = args[0]?.toUpperCase(); // e.g., "SUPPORT"
  const emailArg = args[1];               // e.g., "john@trustbank.com"

  // Validate Input
  if (!roleArg || !emailArg) {
    console.error("Usage: npx tsx scripts/create-role.ts <ROLE> <EMAIL>");
    console.error("   Roles: SUPER_ADMIN, ADMIN, SUPPORT");
    process.exit(1);
  }

  // Validate Role Enum
  if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(roleArg)) {
    console.error("Invalid Role. Use: SUPER_ADMIN, ADMIN, or SUPPORT");
    process.exit(1);
  }

  console.log(`Creating new ${roleArg}: ${emailArg}...`);

  const PASSWORD = "staff123";
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: emailArg },
    update: {
        role: roleArg as UserRole,
        status: "ACTIVE"
    },
    create: {
      email: emailArg,
      fullName: `Staff (${roleArg})`,
      role: roleArg as UserRole,
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      passwordHash: hashedPassword,
      transactionPin: "0000",
      address: "TrustBank HQ",
      country: "United States"
    }
  });

  console.log(`Success! Created ${user.email} as ${user.role}`);
  console.log(`   Default Password: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });