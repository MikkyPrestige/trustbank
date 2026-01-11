const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@trustbank.com" },
    update: {},
    create: {
      email: "admin@trustbank.com",
      fullName: "Super Admin",
      passwordHash: password,
      role: "ADMIN",
      status: "ACTIVE",
      transactionPin: "0000"
    }
  });

  console.log("✅ Admin Created: admin@trustbank.com / admin123");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await db.$disconnect());