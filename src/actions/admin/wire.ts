'use server';

import { db } from "@/lib/db";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { canPerform } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { TransactionStatus, UserRole, TransactionType, TransactionDirection, Prisma } from "@prisma/client";

// GENERATE CODES
const generateCode = (prefix: string) => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// 1. SET CLEARANCE CODE (Manual Entry)
export async function adminSetWireCode(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { success: false, message: "Insufficient permissions. Access Level: EDIT required." };
    }

    const wireId = formData.get("wireId") as string;
    const stage = formData.get("stage") as string;
    const code = formData.get("code") as string;

    if (!code) return { success: false, message: "Code is required" };

    try {
        const updateData: any = {};
        if (stage === 'TAA') updateData.taaCode = code;
        if (stage === 'COT') updateData.cotCode = code;
        if (stage === 'IMF') updateData.imfCode = code;
        if (stage === 'IJY') updateData.ijyCode = code;

        const updatedWire = await db.wireTransfer.update({
            where: { id: wireId },
            data: updateData
        });

        await db.notification.create({
            data: {
                userId: updatedWire.userId,
                title: "Clearance Code Updated",
                message: `The ${stage} clearance code for your pending transaction has been issued.`,
                type: "INFO",
                link: `/dashboard/wire/status?id=${wireId}`,
                isRead: false
            }
        });

        await logAdminAction(
            "UPDATE_WIRE_CODE",
            wireId,
            { stage, code, admin: session?.user?.email },
            "INFO",
            "SUCCESS"
        );

    } catch (error) {
        return { success: false, message: "Failed to update code" };
    }

    revalidatePath("/admin/wires");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, message: `${stage} Code Updated!` };
}

// 2. REJECT & REFUND
export async function adminRejectWire(wireId: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Security Alert: Only Admins can refund transactions." };
    }

    try {
        const wire = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            const w = await tx.wireTransfer.findUnique({ where: { id: wireId } });

            if (!w || w.status === TransactionStatus.COMPLETED) {
                throw new Error("Invalid wire status or already processed");
            }

            await tx.wireTransfer.update({
                where: { id: wireId },
                data: { status: TransactionStatus.FAILED }
            });

            if (w.accountId) {
                // Find Pending Debit
                const pendingLedger = await tx.ledgerEntry.findFirst({
                    where: {
                        referenceId: { contains: w.id },
                        accountId: w.accountId,
                        direction: TransactionDirection.DEBIT,
                        status: TransactionStatus.PENDING
                    }
                });

                // Deduct Current Balance to "Realize" the loss before refunding
                await tx.account.update({
                    where: { id: w.accountId },
                    data: { currentBalance: { decrement: w.amount } }
                });

                if (pendingLedger) {
                    await tx.ledgerEntry.update({
                        where: { id: pendingLedger.id },
                        data: {
                            status: TransactionStatus.COMPLETED,
                            description: `Wire Transfer (Rejected)`
                        }
                    });
                }

                // REFUND PRINCIPAL
                await tx.account.update({
                    where: { id: w.accountId },
                    data: {
                        availableBalance: { increment: w.amount },
                        currentBalance: { increment: w.amount }
                    }
                });

                await tx.ledgerEntry.create({
                    data: {
                        accountId: w.accountId,
                        amount: w.amount,
                        description: `Refund: Wire Principal`,
                        type: 'REFUND' as any,
                        direction: TransactionDirection.CREDIT,
                        status: TransactionStatus.COMPLETED,
                        referenceId: `REF-${w.id}`
                    }
                });

                // REFUND FEE
                const feeLedger = await tx.ledgerEntry.findFirst({
                    where: {
                        accountId: w.accountId,
                        type: 'FEE' as any,
                        status: TransactionStatus.COMPLETED,
                        createdAt: {
                            gte: new Date(w.createdAt.getTime() - 60000),
                            lte: new Date(w.createdAt.getTime() + 60000)
                        }
                    }
                });

                if (feeLedger) {
                    await tx.account.update({
                        where: { id: w.accountId },
                        data: {
                            availableBalance: { increment: feeLedger.amount },
                            currentBalance: { increment: feeLedger.amount }
                        }
                    });

                    await tx.ledgerEntry.create({
                        data: {
                            accountId: w.accountId,
                            amount: feeLedger.amount,
                            description: `Refund: Service Fee`,
                            type: 'REFUND' as any,
                            direction: TransactionDirection.CREDIT,
                            status: TransactionStatus.COMPLETED,
                            referenceId: `REF-FEE-${w.id}`
                        }
                    });
                }
            }

            await tx.notification.create({
                data: {
                    userId: w.userId,
                    title: "Transaction Refunded",
                    message: `Your wire transfer of $${Number(w.amount).toLocaleString()} has been rejected and fully refunded.`,
                    type: "ERROR",
                    link: "/dashboard",
                    isRead: false
                }
            });

            return w;
        });

        await logAdminAction(
            "REJECT_WIRE",
            wireId,
            { reason: "Admin rejected", admin: session?.user?.email },
            "WARNING",
            "SUCCESS"
        );

    } catch (error) {
        console.error("Refund Error:", error);
        return { success: false, message: "Refund Failed: " + (error as Error).message };
    }

    revalidatePath("/admin/wires");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true, message: "Wire Refunded Successfully" };
}

// 3. COMPLETE WIRE
export async function adminCompleteWire(input: string | FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'MONEY')) {
        return { success: false, message: "Security Alert: Only Admins can finalize transactions." };
    }

    let wireId: string;
    if (input instanceof FormData) {
        wireId = input.get("wireId") as string;
    } else {
        wireId = input;
    }

    if (!wireId || typeof wireId !== "string") {
        return { success: false, message: "Invalid Wire ID." };
    }

    try {
        const wire = await db.$transaction(async (tx: Prisma.TransactionClient) => {
            const w = await tx.wireTransfer.findUnique({ where: { id: wireId } });

            if (!w) throw new Error("Wire not found.");
            if (w.status === TransactionStatus.COMPLETED) throw new Error("Wire is already finalized.");

            await tx.wireTransfer.update({
                where: { id: wireId },
                data: {
                    status: TransactionStatus.COMPLETED,
                    currentStage: 'COMPLETED'
                }
            });

            if (w.accountId) {
                const feeAmount = w.fee ? Number(w.fee) : 0;
                const totalDeduction = Number(w.amount) + feeAmount;

                await tx.account.update({
                    where: { id: w.accountId },
                    data: { currentBalance: { decrement: totalDeduction } }
                });

                const updateResult = await tx.ledgerEntry.updateMany({
                    where: {
                        referenceId: { contains: w.id },
                        status: TransactionStatus.ON_HOLD
                    },
                    data: {
                        status: TransactionStatus.COMPLETED,
                        description: `Wire Transfer to ${w.bankName}`
                    }
                });

                if (updateResult.count === 0) {
                     await tx.ledgerEntry.create({
                        data: {
                            accountId: w.accountId,
                            amount: w.amount,
                            description: `Wire Transfer to ${w.bankName}`,
                            type: TransactionType.WIRE,
                            direction: TransactionDirection.DEBIT,
                            status: TransactionStatus.COMPLETED,
                            referenceId: `WIRE-${w.id}`
                        }
                    });
                }

                if (feeAmount > 0) {
                    await tx.ledgerEntry.create({
                        data: {
                            accountId: w.accountId,
                            amount: feeAmount,
                            description: "Service Fee: Wire Transfer",
                            type: TransactionType.FEE,
                            direction: TransactionDirection.DEBIT,
                            status: TransactionStatus.COMPLETED,
                            referenceId: `FEE-${w.id}`
                        }
                    });
                }
            }

            await tx.notification.create({
                data: {
                    userId: w.userId,
                    title: "Transfer Successful",
                    message: `Your wire transfer of $${Number(w.amount).toLocaleString()} has been successfully sent.`,
                    type: "SUCCESS",
                    link: `/dashboard/wire/status?id=${wireId}`,
                    isRead: false
                }
            });

            return w;
        });

        await logAdminAction(
            "APPROVE_WIRE",
            wireId,
            { status: "COMPLETED", admin: session?.user?.email },
            "INFO",
            "SUCCESS"
        );

    } catch (error: any) {
        console.error("Completion Error:", error);
        return { success: false, message: error.message || "Failed to complete wire" };
    }

    revalidatePath("/admin/wires");
    return { success: true, message: "Wire Settled Successfully" };
}

// 4. GENERATE CLEARANCE CODES
export async function generateClearanceCodes(wireId: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }

    if (!canPerform(session.user.role as UserRole, 'EDIT')) {
        return { message: "Insufficient permissions." };
    }

    const taa = generateCode("TAA");
    const cot = generateCode("COT");
    const imf = generateCode("IMF");
    const ijy = generateCode("IJY");

    await db.wireTransfer.update({
        where: { id: wireId },
        data: {
            taaCode: taa,
            cotCode: cot,
            imfCode: imf,
            ijyCode: ijy,
        }
    });

    await logAdminAction(
        "GENERATE_CODES",
        wireId,
        { taa, cot, imf, ijy, admin: session?.user?.email },
        "INFO",
        "SUCCESS"
    );

    revalidatePath("/admin");
    revalidatePath("/admin/users");

    return {
        message: "Codes Generated",
        codes: { taa, cot, imf, ijy }
    };
}

// 'use server';

// import { db } from "@/lib/db";
// import { logAdminAction } from "@/lib/utils/admin-logger";
// import { canPerform } from "@/lib/auth/permissions";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/auth/admin-auth";
// import { TransactionStatus, UserRole, TransactionType, TransactionDirection, Prisma } from "@prisma/client";

// // GENERATE CODES
// const generateCode = (prefix: string) => {
//     return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
// };

// // 1. SET CLEARANCE CODE (Manual Entry)
// //  PERMISSION: 'EDIT' (Support can help users by updating codes)
// export async function adminSetWireCode(formData: FormData) {
//     const { authorized, session } = await checkAdminAction();
//    if (!authorized || !session || !session.user) {
//     return { success: false, message: "Unauthorized" };
// }

//     if (!canPerform(session.user.role as UserRole, 'EDIT')) {
//         return { success: false, message: "Insufficient permissions. Access Level: EDIT required." };
//     }

//     const wireId = formData.get("wireId") as string;
//     const stage = formData.get("stage") as string;
//     const code = formData.get("code") as string;

//     if (!code) return { success: false, message: "Code is required" };

//     try {
//         const updateData: any = {};
//         if (stage === 'TAA') updateData.taaCode = code;
//         if (stage === 'COT') updateData.cotCode = code;
//         if (stage === 'IMF') updateData.imfCode = code;
//         if (stage === 'IJY') updateData.ijyCode = code;

//         // Update and return the wire
//         const updatedWire = await db.wireTransfer.update({
//             where: { id: wireId },
//             data: updateData
//         });

//         // NOTIFY USER
//         await db.notification.create({
//             data: {
//                 userId: updatedWire.userId,
//                 title: "Clearance Code Updated",
//                 message: `The ${stage} clearance code for your pending transaction has been issued.`,
//                 type: "INFO",
//                 link: `/dashboard/wire/status?id=${wireId}`,
//                 isRead: false
//             }
//         });

//         // Log who did it
//         await logAdminAction("UPDATE_WIRE_CODE", wireId, { stage, code, admin: session?.user?.email });

//     } catch (error) {
//         return { success: false, message: "Failed to update code" };
//     }

//     revalidatePath("/admin/wires");
//     revalidatePath("/admin");
//     revalidatePath("/dashboard");
//     return { success: true, message: `${stage} Code Updated!` };
// }

// // 2. REJECT & REFUND (The "Visual Refund" Strategy)
// export async function adminRejectWire(wireId: string) {
//     // 1. Auth Check
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized || !session || !session.user) {
//         return { success: false, message: "Unauthorized" };
//     }

//     // 2. Permission Check (RESTORED)
//     if (!canPerform(session.user.role as UserRole, 'MONEY')) {
//         return { success: false, message: "Security Alert: Only Admins can refund transactions." };
//     }

//     try {
//         const wire = await db.$transaction(async (tx: Prisma.TransactionClient) => {
//             const w = await tx.wireTransfer.findUnique({ where: { id: wireId } });

//             // Safety Checks
//             // We allow 'FAILED' status here just in case you need to re-run a refund that got stuck halfway
//             if (!w || w.status === TransactionStatus.COMPLETED) {
//                 throw new Error("Invalid wire status or already processed");
//             }

//             // =========================================================
//             // 1. SETTLE THE PENDING DEBIT (Make it Real)
//             // =========================================================
//             // We mark the original debit as COMPLETED and deduct Current Balance.
//             // This ensures the "-1000" history remains as a record of the attempt.

//             await tx.wireTransfer.update({
//                 where: { id: wireId },
//                 data: { status: TransactionStatus.FAILED } // Mark wire itself as failed
//             });

//             if (w.accountId) {
//                 // A. Find the Original Pending Ledger
//                 const pendingLedger = await tx.ledgerEntry.findFirst({
//                     where: {
//                         referenceId: { contains: w.id },
//                         accountId: w.accountId,
//                         direction: TransactionDirection.DEBIT,
//                         status: TransactionStatus.PENDING
//                     }
//                 });

//                 // B. "Realize" the Debit (Deduct Current Balance so we can Refund it)
//                 // Note: availableBalance was ALREADY deducted when wire was created.
//                 await tx.account.update({
//                     where: { id: w.accountId },
//                     data: { currentBalance: { decrement: w.amount } }
//                 });

//                 if (pendingLedger) {
//                     await tx.ledgerEntry.update({
//                         where: { id: pendingLedger.id },
//                         data: {
//                             status: TransactionStatus.COMPLETED, // Mark as a completed charge
//                             description: `Wire Transfer (Rejected)`
//                         }
//                     });
//                 }

//                 // =========================================================
//                 // 2. CREATE PRINCIPAL REFUND (The Green Line) 🟢
//                 // =========================================================
//                 // Now we give the money back as a Credit.

//                 await tx.account.update({
//                     where: { id: w.accountId },
//                     data: {
//                         availableBalance: { increment: w.amount }, // Give back available
//                         currentBalance: { increment: w.amount }    // Give back current
//                     }
//                 });

//                 await tx.ledgerEntry.create({
//                     data: {
//                         accountId: w.accountId,
//                         amount: w.amount,
//                         description: `Refund: Wire Principal`,
//                         type: 'REFUND' as any, // Cast to any in case Enum is missing 'REFUND'
//                         direction: TransactionDirection.CREDIT, // 🟢 GREEN
//                         status: TransactionStatus.COMPLETED,
//                         referenceId: `REF-${w.id}`
//                     }
//                 });

//                 // =========================================================
//                 // 3. HANDLE FEE REFUND (The Missing +25) 🟢
//                 // =========================================================

//                 // Try to find the fee more loosely (created within +/- 1 min of wire)
//                 const feeLedger = await tx.ledgerEntry.findFirst({
//                     where: {
//                         accountId: w.accountId,
//                         type: 'FEE' as any,
//                         status: TransactionStatus.COMPLETED,
//                         createdAt: {
//                             gte: new Date(w.createdAt.getTime() - 60000),
//                             lte: new Date(w.createdAt.getTime() + 60000)
//                         }
//                     }
//                 });

//                 if (feeLedger) {
//                     // Refund the Fee
//                     await tx.account.update({
//                         where: { id: w.accountId },
//                         data: {
//                             availableBalance: { increment: feeLedger.amount },
//                             currentBalance: { increment: feeLedger.amount }
//                         }
//                     });

//                     await tx.ledgerEntry.create({
//                         data: {
//                             accountId: w.accountId,
//                             amount: feeLedger.amount,
//                             description: `Refund: Service Fee`,
//                             type: 'REFUND' as any,
//                             direction: TransactionDirection.CREDIT, // 🟢 GREEN
//                             status: TransactionStatus.COMPLETED,
//                             referenceId: `REF-FEE-${w.id}`
//                         }
//                     });
//                 }
//             }

//             // NOTIFY USER
//             await tx.notification.create({
//                 data: {
//                     userId: w.userId,
//                     title: "Transaction Refunded",
//                     message: `Your wire transfer of $${Number(w.amount).toLocaleString()} has been rejected and fully refunded.`,
//                     type: "ERROR",
//                     link: "/dashboard",
//                     isRead: false
//                 }
//             });

//             return w;
//         });

//         await logAdminAction("REJECT_WIRE", wireId, { reason: "Admin rejected", admin: session?.user?.email });

//     } catch (error) {
//         console.error("Refund Error:", error);
//         return { success: false, message: "Refund Failed: " + (error as Error).message };
//     }

//     revalidatePath("/admin/wires");
//     revalidatePath("/admin");
//     revalidatePath("/dashboard");
//     return { success: true, message: "Wire Refunded Successfully" };
// }

// // 3. COMPLETE WIRE (Final Settlement)
// export async function adminCompleteWire(input: string | FormData) {
//     // 1. Auth & Permissions
//     const { authorized, session } = await checkAdminAction();
//     if (!authorized || !session || !session.user) {
//         return { success: false, message: "Unauthorized" };
//     }

//     if (!canPerform(session.user.role as UserRole, 'MONEY')) {
//         return { success: false, message: "Security Alert: Only Admins can finalize transactions." };
//     }

//     // Extract ID
//     let wireId: string;
//     if (input instanceof FormData) {
//         wireId = input.get("wireId") as string;
//     } else {
//         wireId = input;
//     }

//     if (!wireId || typeof wireId !== "string") {
//         return { success: false, message: "Invalid Wire ID." };
//     }

//     try {
//         const wire = await db.$transaction(async (tx: Prisma.TransactionClient) => {
//             const w = await tx.wireTransfer.findUnique({ where: { id: wireId } });

//             if (!w) throw new Error("Wire not found.");
//             if (w.status === TransactionStatus.COMPLETED) throw new Error("Wire is already finalized.");

//             // =========================================================
//             // 1. UPDATE WIRE STATUS
//             // =========================================================
//             await tx.wireTransfer.update({
//                 where: { id: wireId },
//                 data: {
//                     status: TransactionStatus.COMPLETED,
//                     currentStage: 'COMPLETED'
//                 }
//             });

//             if (w.accountId) {
//                 const feeAmount = w.fee ? Number(w.fee) : 0;
//                 const totalDeduction = Number(w.amount) + feeAmount;

//                 // =========================================================
//                 // 2. SETTLEMENT (Deduct Current Balance)
//                 // =========================================================
//                 // We deduct Principal + Fee from Current Balance.
//                 // (Available Balance was already deducted during the Hold, so we don't touch it)

//                 await tx.account.update({
//                     where: { id: w.accountId },
//                     data: { currentBalance: { decrement: totalDeduction } }
//                 });

//                 // =========================================================
//                 // 3. THE FIX: TRANSFORM THE "HOLD" LEDGER 🟢
//                 // =========================================================
//                 // Instead of creating a NEW entry, we find the "ON_HOLD" entry
//                 // and simply change its status to "COMPLETED".

//                 // Note: We use updateMany just in case duplication happened,
//                 // but usually this affects 1 row.
//                 const updateResult = await tx.ledgerEntry.updateMany({
//                     where: {
//                         // Look for the entry linked to this wire that is still ON_HOLD
//                         referenceId: { contains: w.id },
//                         status: TransactionStatus.ON_HOLD
//                     },
//                     data: {
//                         status: TransactionStatus.COMPLETED,
//                         // Update description to remove "Authorization Hold" text
//                         description: `Wire Transfer to ${w.bankName}`
//                     }
//                 });

//                 // FALLBACK: If for some reason no HOLD entry existed (rare bug), create one now.
//                 if (updateResult.count === 0) {
//                      await tx.ledgerEntry.create({
//                         data: {
//                             accountId: w.accountId,
//                             amount: w.amount,
//                             description: `Wire Transfer to ${w.bankName}`,
//                             type: TransactionType.WIRE,
//                             direction: TransactionDirection.DEBIT,
//                             status: TransactionStatus.COMPLETED,
//                             referenceId: `WIRE-${w.id}`
//                         }
//                     });
//                 }

//                 // =========================================================
//                 // 4. CREATE FEE LEDGER (New Entry)
//                 // =========================================================
//                 // The fee was never on the ledger before, so we create it fresh.

//                 if (feeAmount > 0) {
//                     await tx.ledgerEntry.create({
//                         data: {
//                             accountId: w.accountId,
//                             amount: feeAmount,
//                             description: "Service Fee: Wire Transfer",
//                             type: TransactionType.FEE,
//                             direction: TransactionDirection.DEBIT,
//                             status: TransactionStatus.COMPLETED,
//                             referenceId: `FEE-${w.id}`
//                         }
//                     });
//                 }
//             }

//             // NOTIFY USER
//             await tx.notification.create({
//                 data: {
//                     userId: w.userId,
//                     title: "Transfer Successful",
//                     message: `Your wire transfer of $${Number(w.amount).toLocaleString()} has been successfully sent.`,
//                     type: "SUCCESS",
//                     link: `/dashboard/wire/status?id=${wireId}`,
//                     isRead: false
//                 }
//             });

//             return w;
//         });

//         await logAdminAction("APPROVE_WIRE", wireId, { status: "COMPLETED", admin: session?.user?.email });

//     } catch (error: any) {
//         console.error("Completion Error:", error);
//         return { success: false, message: error.message || "Failed to complete wire" };
//     }

//     revalidatePath("/admin/wires");
//     return { success: true, message: "Wire Settled Successfully" };
// }

// // 4. GENERATE CLEARANCE CODES (Auto-Generator)
// // PERMISSION: 'EDIT' (Support allowed)
// export async function generateClearanceCodes(wireId: string) {
//     const { authorized, session } = await checkAdminAction();
//    if (!authorized || !session || !session.user) {
//     return { success: false, message: "Unauthorized" };
// }

//     // 👇 NEW PERMISSION CHECK
//     if (!canPerform(session.user.role as UserRole, 'EDIT')) {
//         return { message: "Insufficient permissions." };
//     }

//     const taa = generateCode("TAA");
//     const cot = generateCode("COT");
//     const imf = generateCode("IMF");
//     const ijy = generateCode("IJY");

//     await db.wireTransfer.update({
//         where: { id: wireId },
//         data: {
//             taaCode: taa,
//             cotCode: cot,
//             imfCode: imf,
//             ijyCode: ijy,
//         }
//     });

//     await logAdminAction("GENERATE_CODES", wireId, { taa, cot, imf, ijy, admin: session?.user?.email });

//     revalidatePath("/admin");
//  revalidatePath("/admin/users");

//     return {
//         message: "Codes Generated",
//         codes: { taa, cot, imf, ijy }
//     };
// }