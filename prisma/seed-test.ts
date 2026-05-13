import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_MENUS = {
  BANKING: {
    title: "BANKING",
    links: [
      [{ label: "Everyday Banking", href: "/bank" }],
      [{ label: "Payments & Services", href: "/payments" }]
    ],
    promo: { title: "Promo", desc: "Desc", btnText: "Go", href: "/save" }
  },
  LENDING: {
    title: "LENDING",
    links: [
      [{ label: "Personal", href: "/borrow" }],
      [{ label: "Home", href: "/borrow" }]
    ],
    promo: { title: "Promo", desc: "Desc", btnText: "Go", href: "/borrow" }
  },
  WEALTH: {
    title: "WEALTH",
    links: [
      [{ label: "Invest", href: "/wealth" }],
      [{ label: "Private Client", href: "/wealth" }]
    ],
    promo: { title: "Promo", desc: "Desc", btnText: "Go", href: "/wealth" }
  },
  INSURANCE: {
    title: "INSURANCE",
    links: [
      [{ label: "Personal Coverage", href: "/insure" }],
      [{ label: "Specialty", href: "/insure" }]
    ],
    promo: { title: "Promo", desc: "Desc", btnText: "Go", href: "/insure" }
  },
  RESOURCES: {
    title: "RESOURCES",
    links: [
      [{ label: "Support", href: "/help" }],
      [{ label: "Company", href: "/about" }]
    ],
    promo: { title: "Promo", desc: "Desc", btnText: "Go", href: "/learn" }
  }
};

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Clean up all settings‑related records in the correct order
  await prisma.contentFeatures.deleteMany();
  await prisma.contentSettings.deleteMany();
  await prisma.siteSettings.deleteMany();

  // Create fresh settings with the exact ids the app expects
  await prisma.siteSettings.create({
    data: {
      id: 'settings',
      site_name: 'TrustBank Test',
      site_logo: '/logo.png',
      contact_email: 'test@trustbank.com',
      contact_phone: '123-456-7890',
      address_main: '123 Test St',
      auth_login_limit: 5,
      routingNumber: '123456789',
      swiftCode: 'TESTUS33',
      nav_structure_json: JSON.stringify(SEED_MENUS),
      content: {
        create: {
          id: 'content-settings',
        },
      },
      features: {
        create: {},
      },
    },
  });

  // Seed users
  await prisma.user.upsert({
    where: { email: 'verified@test.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'verified@test.com',
      fullName: 'Test Verified User',
      passwordHash,
      status: 'ACTIVE',
      emailVerified: new Date(),
      kycStatus: 'VERIFIED',
      role: 'CLIENT',
      transactionPin: '1234',
    },
  });

  await prisma.user.upsert({
    where: { email: 'unverified@test.com' },
    update: {},
    create: {
      email: 'unverified@test.com',
      fullName: 'Test Unverified User',
      passwordHash,
      status: 'PENDING_VERIFICATION',
      emailVerified: null,
      kycStatus: 'NOT_SUBMITTED',
      role: 'CLIENT',
      transactionPin: '1234',
    },
  });

  await prisma.user.upsert({
    where: { email: 'locked@test.com' },
    update: {},
    create: {
      email: 'locked@test.com',
      fullName: 'Test Locked User',
      passwordHash,
      status: 'ACTIVE',
      emailVerified: new Date(),
      kycStatus: 'VERIFIED',
      role: 'CLIENT',
      failedLoginAttempts: 10,
      lockUntil: new Date(Date.now() + 3600000),
      transactionPin: '1234',
    },
  });

  console.log('Test data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });