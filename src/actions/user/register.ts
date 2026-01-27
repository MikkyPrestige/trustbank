'use server';

import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { uploadFileToCloud } from "@/lib/utils/upload";
import {
  Prisma,
  UserRole,
  UserStatus,
  AccountType,
  AccountStatus,
  CardType,
  CardStatus,
  KycStatus
} from "@prisma/client";

// --- VALIDATION SCHEMA ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),

  // Basic Profile
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  taxId: z.string().optional(),

  // Address
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),

  // Next of Kin
  nokName: z.string().optional(),
  nokPhone: z.string().optional(),
  nokEmail: z.string().email("Invalid NOK email").optional().or(z.literal("")),
  nokAddress: z.string().optional(),
  nokRelationship: z.string().optional(),
});

export type RegisterState = {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
};

// --- HELPER GENERATORS ---

async function generateAccountNumber(prefix: string): Promise<string> {
  let isUnique = false;
  let accountNumber = "";
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    accountNumber = `${prefix}${randomSuffix}`;
    const existing = await db.account.findUnique({ where: { accountNumber } });
    if (!existing) isUnique = true;
    attempts++;
  }
  return accountNumber;
}

function generateRoutingNumber() {
    return "0" + Math.floor(20000000 + Math.random() * 10000000).toString();
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
    const suffix = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    cardNumber = `4242 ${suffix.slice(0, 4)} ${suffix.slice(4, 8)} ${suffix.slice(8, 12)}`;
    const existing = await db.card.findUnique({ where: { cardNumber } });
    if (!existing) isUnique = true;
    attempts++;
  }
  return { cardNumber, cvv, expiryDate };
}

// --- THE ACTION ---

// Limits
const MAX_INDIVIDUAL_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 21 * 1024 * 1024;      // 21MB

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

  // 2. File Upload Handling
  const idFile = formData.get("idDocument") as File;
  const passportFile = formData.get("passportPhoto") as File;

  // 🛡️ SERVER-SIDE SIZE CHECKS

  // A. Check Individual Sizes
  if (idFile && idFile.size > MAX_INDIVIDUAL_SIZE) {
    return { message: "ID Document is too large. Max size is 10MB." };
  }
  if (passportFile && passportFile.size > MAX_INDIVIDUAL_SIZE) {
    return { message: "Passport Photo is too large. Max size is 10MB." };
  }

  // B. Check Total Size (To prevent combined overflow)
  const totalSize = (idFile ? idFile.size : 0) + (passportFile ? passportFile.size : 0);
  if (totalSize > MAX_TOTAL_SIZE) {
      return { message: "Total upload size exceeds 21MB. Please use smaller files." };
  }

  let idCardUrl: string | null = null;
  let userImageUrl: string | null = null;
  let kycStatus: KycStatus = KycStatus.NOT_SUBMITTED;

  try {
      // Upload ID Document (KYC)
      if (idFile && idFile.size > 0) {
          try {
              idCardUrl = await uploadFileToCloud(idFile, 'kyc');
              kycStatus = KycStatus.PENDING;
          } catch (uploadError) {
              console.error("ID Upload Failed:", uploadError);
              return { message: "Failed to upload ID Document. Please try again." };
          }
      }

      // Upload Passport Photo (Avatar)
      if (passportFile && passportFile.size > 0) {
          try {
              userImageUrl = await uploadFileToCloud(passportFile, 'avatars');
          } catch (uploadError) {
              console.error("Avatar Upload Failed:", uploadError);
              return { message: "Failed to upload Profile Photo. Please try again." };
          }
      }

    // 3. Generators & Hashing
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const savingsNum = await generateAccountNumber("10");
    const checkingNum = await generateAccountNumber("20");
    const routingNum = generateRoutingNumber();
    const cardDetails = await generateCardDetails();

    // 4. CRITICAL DB TRANSACTION
    const newUserId = await db.$transaction(async (tx) => {
        // A. Create User
        const newUser = await tx.user.create({
            data: {
                email: data.email,
                fullName: data.fullName,
                passwordHash: hashedPassword,
                transactionPin: data.pin,
                role: UserRole.CLIENT,
                status: UserStatus.ACTIVE,
                image: userImageUrl,
                kycStatus: kycStatus,
                idCardUrl: idCardUrl,
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
                nokEmail: data.nokEmail || null,
                nokAddress: data.nokAddress || null,
                nokRelationship: data.nokRelationship || null,
            },
            select: { id: true } // Return only ID for efficiency
        });

        // B. Create Savings
        await tx.account.create({
            data: {
                userId: newUser.id,
                accountNumber: savingsNum,
                routingNumber: routingNum,
                accountName: data.fullName,
                type: AccountType.SAVINGS,
                status: AccountStatus.ACTIVE,
                isPrimary: true
            }
        });

        // C. Create Checking
        await tx.account.create({
            data: {
                userId: newUser.id,
                accountNumber: checkingNum,
                routingNumber: routingNum,
                accountName: data.fullName,
                type: AccountType.CHECKING,
                status: AccountStatus.ACTIVE,
                isPrimary: false
            }
        });

        // D. Create Card
        await tx.card.create({
            data: {
                userId: newUser.id,
                type: CardType.VISA,
                cardNumber: cardDetails.cardNumber,
                cvv: cardDetails.cvv,
                expiryDate: cardDetails.expiryDate,
                pin: data.pin,
                status: CardStatus.ACTIVE,
                isPhysical: false
            }
        });

        return newUser.id;
    }, {
        maxWait: 5000,
        timeout: 10000
    });

    // 5. NOTIFICATION (Outside Transaction)
    // If we reach here, the user exists. Safe to notify.
    if (newUserId) {
        await db.notification.create({
            data: {
                userId: newUserId,
                title: "Welcome to TrustBank",
                message: "Your account has been successfully created. Please verify your identity to unlock full features.",
                type: "SUCCESS",
                link: "/dashboard/verify",
                isRead: false
            }
        });
    }

    return { success: true, message: "Account created successfully!" };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target && target.includes('email')) {
            return { message: "This email is already registered." };
        }
        return { message: "System busy (Collision). Please try again." };
      }
    }
    console.error("Registration Error:", error);
    return { message: "System error. Please contact support." };
  }
}




// 'use server';

// import { db } from "@/lib/db";
// import { z } from "zod";
// import bcrypt from "bcryptjs";
// import { uploadFileToCloud } from "@/lib/upload";
// import {
//   Prisma,
//   UserRole,
//   UserStatus,
//   AccountType,
//   AccountStatus,
//   CardType,
//   CardStatus,
//   KycStatus
// } from "@prisma/client";

// // --- VALIDATION SCHEMA ---
// const registerSchema = z.object({
//   fullName: z.string().min(2, "Name is required"),
//   email: z.string().email("Invalid email"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   pin: z.string().length(4, "PIN must be exactly 4 digits"),

//   // Basic Profile
//   phone: z.string().optional(),
//   dateOfBirth: z.string().optional(),
//   gender: z.string().optional(),
//   occupation: z.string().optional(),
//   taxId: z.string().optional(),

//   // Address
//   country: z.string().optional(),
//   city: z.string().optional(),
//   address: z.string().optional(),
//   zipCode: z.string().optional(),

//   // Next of Kin
//   nokName: z.string().optional(),
//   nokPhone: z.string().optional(),
//   nokEmail: z.string().email("Invalid NOK email").optional().or(z.literal("")),
//   nokAddress: z.string().optional(),
//   nokRelationship: z.string().optional(),
// });

// export type RegisterState = {
//   message?: string;
//   errors?: Record<string, string[]>;
//   success?: boolean;
// };

// // --- HELPER GENERATORS ---

// async function generateAccountNumber(prefix: string): Promise<string> {
//   let isUnique = false;
//   let accountNumber = "";
//   let attempts = 0;

//   while (!isUnique && attempts < 10) {
//     const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
//     accountNumber = `${prefix}${randomSuffix}`;
//     const existing = await db.account.findUnique({ where: { accountNumber } });
//     if (!existing) isUnique = true;
//     attempts++;
//   }
//   return accountNumber;
// }

// function generateRoutingNumber() {
//     return "0" + Math.floor(20000000 + Math.random() * 10000000).toString();
// }

// async function generateCardDetails() {
//   let isUnique = false;
//   let cardNumber = "";
//   let attempts = 0;

//   const cvv = Math.floor(100 + Math.random() * 900).toString();
//   const date = new Date();
//   date.setFullYear(date.getFullYear() + 3);
//   const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

//   while (!isUnique && attempts < 10) {
//     const suffix = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
//     cardNumber = `4242 ${suffix.slice(0, 4)} ${suffix.slice(4, 8)} ${suffix.slice(8, 12)}`;
//     const existing = await db.card.findUnique({ where: { cardNumber } });
//     if (!existing) isUnique = true;
//     attempts++;
//   }
//   return { cardNumber, cvv, expiryDate };
// }

// // --- THE ACTION ---

// // Limits
// const MAX_INDIVIDUAL_SIZE = 10 * 1024 * 1024; // 10MB
// const MAX_TOTAL_SIZE = 21 * 1024 * 1024;      // 21MB

// export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
//   const rawData = Object.fromEntries(formData.entries());

//   // 1. Validation
//   const validated = registerSchema.safeParse(rawData);
//   if (!validated.success) {
//     const fieldErrors: Record<string, string[]> = {};
//     for (const issue of validated.error.issues) {
//       const field = issue.path[0] as string;
//       if (!fieldErrors[field]) fieldErrors[field] = [];
//       fieldErrors[field].push(issue.message);
//     }
//     return { errors: fieldErrors, message: "Please check your inputs." };
//   }

//   const data = validated.data;

//   // 2. File Upload Handling
//   const idFile = formData.get("idDocument") as File;
//   const passportFile = formData.get("passportPhoto") as File;

//   // 🛡️ SERVER-SIDE SIZE CHECKS

//   // A. Check Individual Sizes
//   if (idFile && idFile.size > MAX_INDIVIDUAL_SIZE) {
//     return { message: "ID Document is too large. Max size is 10MB." };
//   }
//   if (passportFile && passportFile.size > MAX_INDIVIDUAL_SIZE) {
//     return { message: "Passport Photo is too large. Max size is 10MB." };
//   }

//   // B. Check Total Size (To prevent combined overflow)
//   const totalSize = (idFile ? idFile.size : 0) + (passportFile ? passportFile.size : 0);
//   if (totalSize > MAX_TOTAL_SIZE) {
//       return { message: "Total upload size exceeds 21MB. Please use smaller files." };
//   }

//   let idCardUrl: string | null = null;
//   let userImageUrl: string | null = null;
//   let kycStatus: KycStatus = KycStatus.NOT_SUBMITTED;

//   try {
//       // Upload ID Document (KYC)
//       if (idFile && idFile.size > 0) {
//           try {
//               idCardUrl = await uploadFileToCloud(idFile, 'kyc');
//               kycStatus = KycStatus.PENDING;
//           } catch (uploadError) {
//               console.error("ID Upload Failed:", uploadError);
//               return { message: "Failed to upload ID Document. Please try again." };
//           }
//       }

//       // Upload Passport Photo (Avatar)
//       if (passportFile && passportFile.size > 0) {
//           try {
//               userImageUrl = await uploadFileToCloud(passportFile, 'avatars');
//           } catch (uploadError) {
//               console.error("Avatar Upload Failed:", uploadError);
//               return { message: "Failed to upload Profile Photo. Please try again." };
//           }
//       }

//     // 3. Generators & Hashing
//     const hashedPassword = await bcrypt.hash(data.password, 10);
//     const savingsNum = await generateAccountNumber("10");
//     const checkingNum = await generateAccountNumber("20");
//     const routingNum = generateRoutingNumber();
//     const cardDetails = await generateCardDetails();

//     await db.$transaction(async (tx) => {
//         // A. Create User
//         const newUser = await tx.user.create({
//             data: {
//                 email: data.email,
//                 fullName: data.fullName,
//                 passwordHash: hashedPassword,
//                 transactionPin: data.pin,
//                 role: UserRole.CLIENT,
//                 status: UserStatus.ACTIVE,
//                 image: userImageUrl,
//                 kycStatus: kycStatus,
//                 idCardUrl: idCardUrl,
//                 phone: data.phone || null,
//                 dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
//                 gender: data.gender || null,
//                 occupation: data.occupation || null,
//                 taxId: data.taxId || null,
//                 country: data.country || null,
//                 city: data.city || null,
//                 address: data.address || null,
//                 zipCode: data.zipCode || null,
//                 nokName: data.nokName || null,
//                 nokPhone: data.nokPhone || null,
//                 nokEmail: data.nokEmail || null,
//                 nokAddress: data.nokAddress || null,
//                 nokRelationship: data.nokRelationship || null,
//             },
//         });

//         // Welcome Notification
//         await tx.notification.create({
//             data: {
//                 userId: newUser.id,
//                 title: "Welcome to TrustBank",
//                 message: "Your account has been successfully created. Please verify your identity to unlock full features.",
//                 type: "SUCCESS",
//                 link: "/dashboard/verify",
//                 isRead: false
//             }
//         });

//         // B. Create Savings
//         await tx.account.create({
//             data: {
//                 userId: newUser.id,
//                 accountNumber: savingsNum,
//                 routingNumber: routingNum,
//                 accountName: data.fullName,
//                 type: AccountType.SAVINGS,
//                 status: AccountStatus.ACTIVE,
//                 isPrimary: true
//             }
//         });

//         // C. Create Checking
//         await tx.account.create({
//             data: {
//                 userId: newUser.id,
//                 accountNumber: checkingNum,
//                 routingNumber: routingNum,
//                 accountName: data.fullName,
//                 type: AccountType.CHECKING,
//                 status: AccountStatus.ACTIVE,
//                 isPrimary: false
//             }
//         });

//         // D. Create Card
//         await tx.card.create({
//             data: {
//                 userId: newUser.id,
//                 type: CardType.VISA,
//                 cardNumber: cardDetails.cardNumber,
//                 cvv: cardDetails.cvv,
//                 expiryDate: cardDetails.expiryDate,
//                 pin: data.pin,
//                 status: CardStatus.ACTIVE,
//                 isPhysical: false
//             }
//         });
//     }, {
//         maxWait: 5000,
//         timeout: 10000
//     });

//     return { success: true, message: "Account created successfully!" };

//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === 'P2002') {
//         const target = error.meta?.target as string[];
//         if (target && target.includes('email')) {
//             return { message: "This email is already registered." };
//         }
//         return { message: "System busy (Collision). Please try again." };
//       }
//     }
//     console.error("Registration Error:", error);
//     return { message: "System error. Please contact support." };
//   }
// }