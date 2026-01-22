const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log("🚀 Seeding Super Admin...");

  const password = await bcrypt.hash("admin123", 10);
  const pin = "0000";

  // 2. Upsert User
  const admin = await prisma.user.upsert({
    where: { email: "admin@trustbank.com" },
    update: {
      role: "SUPER_ADMIN",
      kycStatus: "VERIFIED",
      status: "ACTIVE"
    },
    create: {
      email: "admin@trustbank.com",
      fullName: "System Super Admin",
      passwordHash: password,
      transactionPin: pin,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      kycStatus: "VERIFIED",
      dateOfBirth: new Date("1990-01-01"),
      address: "123 Admin HQ, Secure Server Room",
      phone: "+1999999999",
      country: "United States"
    }
  });

  // 3. Create Admin Bank Account
  const existingAccount = await prisma.account.findFirst({ where: { userId: admin.id } });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: admin.id,
        accountName: "System Super Admin",
        accountNumber: "9999999999",
        type: "CHECKING",
        currency: "USD",
        availableBalance: 1000000.00,
        currentBalance: 1000000.00,
        isPrimary: true,
        status: "ACTIVE"
      }
    });
    console.log("💰 Admin Wallet Funded with $1,000,000");
  }

  console.log("✅ Super Admin Ready!");
  console.log("📧 Email: admin@trustbank.com");
  console.log("🔑 Pass:  admin123");
}

// 4. Run the function
createAdmin()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });