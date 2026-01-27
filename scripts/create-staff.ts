import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Initializing Staff Seeding Sequence...");

  const PIN = "0000";
  const PASSWORD = "admin123";
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // ==========================================
  // 1. SUPER ADMIN - With Money & Card
  // ==========================================
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@trustbank.com" },
    update: { role: "SUPER_ADMIN", status: "ACTIVE", passwordHash: hashedPassword, transactionPin: PIN },
    create: {
      email: "admin@trustbank.com",
      fullName: "System Super Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      passwordHash: hashedPassword,
      transactionPin: PIN,
      address: "Server Room 1",
      country: "United States"
    }
  });

  const adminAcc = await prisma.account.upsert({
    where: { accountNumber: "9999999999" },
    update: { availableBalance: 1000000, currentBalance: 1000000 },
    create: {
      userId: superAdmin.id,
      accountName: "Treasury Chest",
      accountNumber: "9999999999",
      type: "CHECKING",
      isPrimary: true,
      availableBalance: 1000000,
      currentBalance: 1000000,
      status: "ACTIVE"
    }
  });

  // Admin Card
  const adminCard = await prisma.card.upsert({
    where: { cardNumber: "4000123456789999" },
    update: { status: "ACTIVE" },
    create: {
      userId: superAdmin.id,
      type: "VISA",
      cardNumber: "4000123456789999",
      cvv: "999",
      expiryDate: "12/30",
      status: "ACTIVE",
      spendingLimit: 50000
    }
  });

  console.log(`[SUPER ADMIN] Ready: ${superAdmin.email}`);
  console.log(`   Balance: $${adminAcc.availableBalance}`);
  console.log(`   Card:    ...${adminCard.cardNumber.slice(-4)}`);

  // ==========================================
  // 2.  ADMIN (Operations)
  // ==========================================
  const admin = await prisma.user.upsert({
    where: { email: "manager@trustbank.com" },
    update: { role: "ADMIN", status: "ACTIVE", passwordHash: hashedPassword },
    create: {
      email: "manager@trustbank.com",
      fullName: "Sarah Operations",
      role: "ADMIN",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      passwordHash: hashedPassword,
      transactionPin: PIN,
      address: "Admin Office HQ",
      country: "United Kingdom"
    }
  });
  console.log(`[ADMIN]       Ready: ${admin.email}`);

  // ==========================================
  // 3. SUPPORT AGENT
  // ==========================================
  const support = await prisma.user.upsert({
    where: { email: "support@trustbank.com" },
    update: { role: "SUPPORT", status: "ACTIVE", passwordHash: hashedPassword },
    create: {
      email: "support@trustbank.com",
      fullName: "Help Desk Agent",
      role: "SUPPORT",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      passwordHash: hashedPassword,
      transactionPin: PIN,
      address: "Remote Support Center",
      country: "Canada"
    }
  });
  console.log(`[SUPPORT]     Ready: ${support.email}`);

  console.log("\n SYSTEM READY FOR LOGIN!");
  console.log("-------------------------------------");
  console.log(` All Passwords: ${PASSWORD}`);
  console.log(` All PINs:      ${PIN}`);
  console.log("-------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });