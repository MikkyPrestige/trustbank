'use server';

import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { checkMaintenanceMode, getBooleanSetting, hashPin } from "@/lib/security";
import { getSiteSettings } from "@/lib/content/get-settings";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { sendVerificationEmail } from "@/lib/mail";
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


const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  taxId: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  nokName: z.string().optional(),
  nokPhone: z.string().optional(),
  nokEmail: z.string().email("Invalid NOK email").optional().or(z.literal("")),
  nokAddress: z.string().optional(),
  nokRelationship: z.string().optional(),
  docType: z.string().optional(),
  currency: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export type RegisterState = {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
  requireOtp?: boolean;
  isUnverified?: boolean;
  email?: string;
  callbackUrl?: string;
};

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


const MAX_INDIVIDUAL_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;      // 25MB

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const rawData = Object.fromEntries(formData.entries());
  const settings = await getSiteSettings();
  const siteName = settings.site_name;

  const isRegistrationEnabled = await getBooleanSetting('feature_register_enabled', true);
  if (!isRegistrationEnabled) {
        return {
            success: false,
            message: "Registration is currently closed. Please check back later."
        };
    }

  if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

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
  const callbackUrl = data.callbackUrl || "/dashboard";

  const idFrontFile = formData.get("idDocumentFront") as File;
  const idBackFile = formData.get("idDocumentBack") as File;
  const passportFile = formData.get("passportPhoto") as File;

  const hasFront = idFrontFile && idFrontFile.size > 0;
  const hasBack = idBackFile && idBackFile.size > 0;

  if ((hasFront && !hasBack) || (!hasFront && hasBack)) {
      return { message: "Incomplete ID Upload. You must upload BOTH front and back images, or neither." };
  }

  if (hasFront && idFrontFile.size > MAX_INDIVIDUAL_SIZE) return { message: "ID Front is too large (Max 10MB)." };
  if (hasBack && idBackFile.size > MAX_INDIVIDUAL_SIZE) return { message: "ID Back is too large (Max 10MB)." };
  if (passportFile && passportFile.size > MAX_INDIVIDUAL_SIZE) return { message: "Passport Photo is too large (Max 10MB)." };

  const totalSize = (idFrontFile?.size || 0) + (idBackFile?.size || 0) + (passportFile?.size || 0);
  if (totalSize > MAX_TOTAL_SIZE) {
      return { message: "Total upload size exceeds 25MB. Please use smaller files." };
  }

  let idCardUrl: string | null = null;
  let idCardBackUrl: string | null = null;
  let userImageUrl: string | null = null;
  let kycStatus: KycStatus = KycStatus.NOT_SUBMITTED;

  try {
      if (hasFront) {
          try {
              idCardUrl = await uploadFileToCloud(idFrontFile, 'kyc');
              kycStatus = KycStatus.PENDING;
          } catch (uploadError) {
              console.error("ID Front Upload Failed:", uploadError);
              return { message: "Failed to upload ID Front. Please try again." };
          }
      }

      if (hasBack) {
          try {
              idCardBackUrl = await uploadFileToCloud(idBackFile, 'kyc');
              kycStatus = KycStatus.PENDING;
          } catch (uploadError) {
              console.error("ID Back Upload Failed:", uploadError);
              return { message: "Failed to upload ID Back. Please try again." };
          }
      }

      if (passportFile && passportFile.size > 0) {
          try {
              userImageUrl = await uploadFileToCloud(passportFile, 'avatars');
          } catch (uploadError) {
              console.error("Avatar Upload Failed:", uploadError);
              return { message: "Failed to upload Profile Photo. Please try again." };
          }
      }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const hashedPin = await hashPin(data.pin);

    const savingsNum = await generateAccountNumber("10");
    const checkingNum = await generateAccountNumber("20");
    const routingNum = generateRoutingNumber();
    const cardDetails = await generateCardDetails();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const newUserId = await db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email: data.email,
                fullName: data.fullName,
                passwordHash: hashedPassword,
                transactionPin: hashedPin,
                role: UserRole.CLIENT,
                status: UserStatus.PENDING_VERIFICATION,
                emailVerified: null,
                otpCode: otpCode,
                otpExpires: otpExpires,
                image: userImageUrl,
                idCardUrl: idCardUrl,
                idCardBackUrl: idCardBackUrl,
                kycStatus: kycStatus,
                phone: data.phone || null,
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                gender: data.gender || null,
                occupation: data.occupation || null,
                taxId: data.taxId || null,
                country: data.country || null,
                city: data.city || null,
                state: data.state || null,
                address: data.address || null,
                zipCode: data.zipCode || null,
                nokName: data.nokName || null,
                nokPhone: data.nokPhone || null,
                nokEmail: data.nokEmail || null,
                nokAddress: data.nokAddress || null,
                nokRelationship: data.nokRelationship || null,
                currency: data.currency || "USD",
            },
            select: { id: true, email: true }
        });

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

        return newUser;
    }, {
        maxWait: 5000,
        timeout: 10000
    });

    if (newUserId) {
       await sendVerificationEmail(data.email, otpCode, siteName);

       await db.notification.create({
           data: {
               userId: newUserId.id,
               title: `Welcome to ${siteName}`,
               message: "Please verify your email address to activate your account.",
               type: "INFO",
               link: "/verify-otp",
               isRead: false
           }
       });
    }

    return {
        success: true,
        message: "Verification code sent to your email.",
        requireOtp: true,
        email: data.email,
        callbackUrl: callbackUrl
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        if (target && target.includes('email')) {
          const existingUser = await db.user.findUnique({
      where: { email: data.email }
  });
  if (existingUser) {
      if (existingUser.emailVerified) {
          return { message: "Email already registered. Please Login." };
      } else {
          return {
              success: false,
              isUnverified: true,
              email: data.email,
              callbackUrl: callbackUrl,
              message: "Account exists but is not verified."
          };
      }
  }
        }
        return { message: "System busy (Collision). Please try again." };
      }
    }
    console.error("Registration Error:", error);
    return { message: "System error. Please contact support." };
  }
}