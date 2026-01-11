'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client"; // Ensure you import the Enum
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: string, currentStatus: string) {
  // 1. Security Check
  const session = await auth();
  const admin = await db.user.findUnique({ where: { id: session?.user?.id } });

  if (!admin || admin.role !== 'ADMIN') {
    return { message: "Unauthorized: Admin access required." };
  }

  // 2. Determine New Status
  // If Active -> Freeze. If Frozen/Pending -> Make Active.
  const newStatus = currentStatus === 'ACTIVE'
    ? 'FROZEN' as UserStatus
    : 'ACTIVE' as UserStatus;

  // 3. Update Database
  await db.user.update({
    where: { id: userId },
    data: { status: newStatus }
  });

  revalidatePath("/admin");
  return { message: `User status updated to ${newStatus}` };
}

// Helper for random codes
const generateCode = (prefix: string) => {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export async function generateClearanceCodes(wireId: string) {
  const session = await auth();

  // 1. Security Check
  const admin = await db.user.findUnique({ where: { id: session?.user?.id } });
  if (!admin || admin.role !== 'ADMIN') {
    return { message: "Unauthorized" };
  }

  // 2. Generate Codes
  const taa = generateCode("TAA");
  const cot = generateCode("COT");
  const ijy = generateCode("IJY");

  // 3. Save to DB
  await db.wireTransfer.update({
    where: { id: wireId },
    data: {
      taaCode: taa,
      cotCode: cot,
      ijyCode: ijy,
    }
  });

  revalidatePath("/admin");
  return {
    message: "Codes Generated",
    codes: { taa, cot, ijy }
  };
}

export async function adminIssueCard(userId: string) {
    const session = await auth();
    const admin = await db.user.findUnique({ where: { id: session?.user?.id } });
    if (!admin || admin.role !== 'ADMIN') return { message: "Unauthorized" };

    try {
        // Generate Visa Details
        const cardNumber = "4" + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
        const cvv = Math.floor(100 + Math.random() * 900).toString();

        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        const expiryDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;

        await db.card.create({
            data: {
                userId,
                type: "VISA",
                cardNumber,
                cvv,
                expiryDate,
                status: "ACTIVE",
                isPhysical: false
            }
        });

        revalidatePath("/admin/users");
        return { success: true, message: "New Card Issued" };
    } catch (err) {
        return { message: "Failed to issue card" };
    }
}