'use server';

import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";

// --- VALIDATION SCHEMA ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  pin: z.string().length(4, "PIN must be 4 digits"),
  // Optional fields
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  taxId: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  nokName: z.string().optional(),
  nokPhone: z.string().optional(),
  nokRelationship: z.string().optional(),
});

export type RegisterState = {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
};

// --- HELPER GENERATORS (Using Global DB, not Transaction) ---

async function generateAccountNumber(prefix: string): Promise<string> {
  let isUnique = false;
  let accountNumber = "";
  // Safety break: try max 10 times to avoid infinite loops
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    accountNumber = `${prefix}${randomSuffix}`;
    // We check against the global DB
    const existing = await db.account.findUnique({ where: { accountNumber } });
    if (!existing) isUnique = true;
    attempts++;
  }
  return accountNumber;
}

async function generateCardDetails() {
  let isUnique = false;
  let cardNumber = "";
  let attempts = 0;

  const cvv = Math.floor(100 + Math.random() * 900).toString();
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

  while (!isUnique && attempts < 10) {
    const section2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const section3 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const section4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    cardNumber = `4242 ${section2} ${section3} ${section4}`;

    const existing = await db.card.findUnique({ where: { cardNumber } });
    if (!existing) isUnique = true;
    attempts++;
  }

  return { cardNumber, cvv, expiryDate };
}

// --- THE ACTION ---

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const rawData = Object.fromEntries(formData.entries());

  // 1. Validation
  const validated = registerSchema.safeParse(rawData);
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validated.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return { errors: fieldErrors, message: "Please check your inputs." };
  }

  const data = validated.data;

  try {
    // 2. PREPARE DATA *OUTSIDE* THE TRANSACTION
    // This prevents "Unable to start transaction" errors by doing the heavy work first.
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const savingsNum = await generateAccountNumber("10");
    const checkingNum = await generateAccountNumber("20");
    const cardDetails = await generateCardDetails();

    // 3. FAST TRANSACTION (Only Writes)
    await db.$transaction(async (tx) => {

      // A. Create User
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          passwordHash: hashedPassword,
          transactionPin: data.pin,
          role: UserRole.CLIENT,
          status: UserStatus.ACTIVE,
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender || null,
          occupation: data.occupation || null,
          taxId: data.taxId || null,
          country: data.country || null,
          city: data.city || null,
          address: data.address || null,
          zipCode: data.zipCode || null,
          nokName: data.nokName || null,
          nokPhone: data.nokPhone || null,
          nokRelationship: data.nokRelationship || null,
        },
      });

      // B. Create Savings
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountNumber: savingsNum,
          accountName: data.fullName,
          type: "SAVINGS",
          status: "ACTIVE",
          isPrimary: true
        }
      });

      // C. Create Checking
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountNumber: checkingNum,
          accountName: data.fullName,
          type: "CHECKING",
          status: "ACTIVE",
          isPrimary: false
        }
      });

      // D. Create Card
      await tx.card.create({
        data: {
          userId: newUser.id,
          type: "VISA",
          cardNumber: cardDetails.cardNumber,
          cvv: cardDetails.cvv,
          expiryDate: cardDetails.expiryDate,
          pin: data.pin,
          status: "ACTIVE",
          isPhysical: false
        }
      });
    }, {
        maxWait: 5000, // Wait longer for a connection
        timeout: 10000 // Allow transaction to run longer if needed
    });

    return { success: true, message: "Account created successfully!" };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { message: "Email already in use." };
      }
    }
    console.error("Registration Error:", error);
    return { message: "System error. Please try again." };
  }
}