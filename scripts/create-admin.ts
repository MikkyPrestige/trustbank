import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log("Seeding Super Admin...");

  // 1. Credentials
  const EMAIL = "admin@trustbank.com";
  const PASSWORD = "admin123";
  const PIN = "0000";
  const ADMIN_ACC_NO = "9999999999";

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // 2. Upsert User (Create if new, Update if exists)
  const admin = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      role: "SUPER_ADMIN",
      kycStatus: "VERIFIED",
      status: "ACTIVE",
      passwordHash: hashedPassword,
      transactionPin: PIN
    },
    create: {
      email: EMAIL,
      fullName: "System Super Admin",
      passwordHash: hashedPassword,
      transactionPin: PIN,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      dateOfBirth: new Date("1990-01-01"),
      address: "123 Admin HQ, Secure Server Room",
      phone: "+1999999999",
      country: "United States"
    }
  });

  console.log(`Admin User Secured: ${admin.id}`);

  // 3. Upsert Admin Bank Account
  const account = await prisma.account.upsert({
    where: { accountNumber: ADMIN_ACC_NO },
    update: {
      availableBalance: 1000000.00,
      currentBalance: 1000000.00,
      status: "ACTIVE"
    },
    create: {
      userId: admin.id,
      accountName: "System Treasury",
      accountNumber: ADMIN_ACC_NO,
      routingNumber: "021000021",
      type: "CHECKING",
      currency: "USD",
      availableBalance: 1000000.00,
      currentBalance: 1000000.00,
      isPrimary: true,
      status: "ACTIVE"
    }
  });

  console.log(`Treasury Account Linked: ${account.accountNumber} ($1M)`);

  // 4. Create Admin Card
  const card = await prisma.card.upsert({
    where: { cardNumber: "4000123456789999" },
    update: { status: "ACTIVE" },
    create: {
      userId: admin.id,
      type: "VISA",
      cardNumber: "4000123456789999",
      cvv: "999",
      expiryDate: "12/30",
      status: "ACTIVE",
      isPhysical: false,
      spendingLimit: 50000.00
    }
  });

  console.log(`Admin Visa Card Issued: ending in ${card.cardNumber.slice(-4)}`);

  console.log("\n Super Admin Ready!");
  console.log(`   Email: ${EMAIL}`);
  console.log(`   Pass:  ${PASSWORD}`);
}

createAdmin()
  .catch((e) => {
    console.error(" Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });