'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkPermissions, checkInboundLimit, checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { getLiveMarketData } from "@/lib/marketData";
import {
  UserStatus,
  KycStatus,
  TransactionType,
  TransactionStatus,
  TransactionDirection
} from "@prisma/client";

// ==========================================
// 📈 TRADE CRYPTO (BUY/SELL)
// ==========================================
export async function tradeCrypto(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    // 1. 🚧 Global Kill Switch
    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    // 2. 🛡️ Permission Check (Features + KYC)
    const permission = await checkPermissions(user.id, 'CRYPTO_TRADE');
    if (!permission.allowed) return { message: `🚫 ${permission.error}` };

    const type = formData.get("type") as "BUY" | "SELL";
    const symbol = formData.get("currency") as string;
    const inputAmount = Number(formData.get("amount"));

    if (!inputAmount || inputAmount <= 0) return { message: "Invalid amount" };

    // 3. Fetch Market Data
    const marketData = await getLiveMarketData();
    const targetCoin = marketData.find(coin => coin.symbol === symbol);
    let currentPrice = targetCoin?.price || 0;
    if (symbol === 'HYPE' && currentPrice === 0) currentPrice = 25;

    if (!currentPrice || currentPrice <= 0) return { message: "Price unavailable. Try again." };

    // 4. 🛑 Balance Cap Check (For SELLS only)
    if (type === "SELL") {
        const inboundCheck = await checkInboundLimit(user.id, inputAmount);
        if (!inboundCheck.allowed) {
            return { message: `🚫 Cannot Sell: ${inboundCheck.error}` };
        }
    }

    try {
        const account = await db.account.findFirst({
            where: { userId: user.id, isPrimary: true }
        });
        if (!account) return { message: "No USD account found." };

        let asset = await db.cryptoAsset.findUnique({
            where: { userId_symbol: { userId: user.id, symbol } }
        });

        const cryptoAmount = inputAmount / currentPrice;

        let newQty = 0;
        let newAvgPrice = 0;

        if (asset) {
            const oldQty = Number(asset.quantity);
            const oldAvg = Number(asset.avgBuyPrice);
            if (type === "BUY") {
                newQty = oldQty + cryptoAmount;
                newAvgPrice = newQty > 0 ? ((oldQty * oldAvg) + (cryptoAmount * currentPrice)) / newQty : currentPrice;
            } else {
                newQty = oldQty - cryptoAmount;
                newAvgPrice = oldAvg;
            }
        } else {
            if (type === "SELL") return { message: "Insufficient Crypto balance." };
            newQty = cryptoAmount;
            newAvgPrice = currentPrice;
        }

        if (type === "BUY" && Number(account.availableBalance) < inputAmount) return { message: "Insufficient USD funds." };
        if (type === "SELL" && (!asset || Number(asset.quantity) < cryptoAmount)) return { message: "Insufficient Crypto balance." };

        // 5. Execute Trade
        const ledgerId = await db.$transaction(async (tx) => {
            // A. UPDATE USD
            await tx.account.update({
                where: { id: account.id },
                data: {
                    availableBalance: type === "BUY" ? { decrement: inputAmount } : { increment: inputAmount },
                    currentBalance: type === "BUY" ? { decrement: inputAmount } : { increment: inputAmount }
                }
            });

            // B. UPDATE CRYPTO
            if (asset) {
                await tx.cryptoAsset.update({
                    where: { id: asset.id },
                    data: { quantity: newQty, avgBuyPrice: newAvgPrice }
                });
            } else {
                await tx.cryptoAsset.create({
                    data: { userId: user.id, symbol, quantity: newQty, avgBuyPrice: newAvgPrice }
                });
            }

            // C. LOG TRANSACTION
            await tx.cryptoTransaction.create({
                data: {
                    userId: user.id,
                    type: type,
                    symbol,
                    amount: cryptoAmount,
                    priceAtTime: currentPrice,
                    totalUsd: inputAmount
                }
            });

            // D. LOG LEDGER
            const ledgerTx = await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    amount: inputAmount,
                    type: type === "BUY" ? TransactionType.CRYPTO_BUY : TransactionType.CRYPTO_SELL,
                    direction: type === "BUY" ? TransactionDirection.DEBIT : TransactionDirection.CREDIT,
                    status: TransactionStatus.COMPLETED,
                    description: type === "BUY" ? `Bought ${cryptoAmount.toFixed(6)} ${symbol}` : `Sold ${cryptoAmount.toFixed(6)} ${symbol}`,
                    referenceId: `${type}-${Date.now()}`,
                }
            });

            return ledgerTx.id;
        });

        // 6. Notification
        await db.notification.create({
            data: {
                userId: user.id,
                title: `Crypto ${type === "BUY" ? "Purchase" : "Sale"} Successful`,
                message: `You successfully ${type === "BUY" ? "bought" : "sold"} ${cryptoAmount.toFixed(6)} ${symbol} for $${inputAmount.toLocaleString()}.`,
                type: "SUCCESS",
                link: `/dashboard/transactions/${ledgerId}`,
                isRead: false
            }
        });

    } catch (err: any) {
        return { message: err.message || "Trade Failed" };
    }

    revalidatePath("/dashboard/crypto");
    revalidatePath("/dashboard");
    return { success: true, message: `${type} Order Executed Successfully!` };
}

// ==========================================
// 📤 TRANSFER CRYPTO (SEND)
// ==========================================
export async function transferCrypto(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    // 1. 🚧 Global Kill Switch
    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    // 2. 🛡️ Permission Check
    const permission = await checkPermissions(user.id, 'CRYPTO_TRANSFER');
    if (!permission.allowed) return { message: `🚫 ${permission.error}` };

    const symbol = formData.get("symbol") as string;
    const amount = Number(formData.get("amount"));
    const recipient = formData.get("recipient") as string;
    const pin = formData.get("pin") as string;

    if (!amount || amount <= 0) return { message: "Invalid amount" };

    const marketData = await getLiveMarketData();
    const targetCoin = marketData.find(c => c.symbol === symbol);
    const price = targetCoin?.price || 0;
    const usdValue = amount * price;

    try {
        const sender = await db.user.findUnique({ where: { id: user.id } });

        if (!sender) return { message: "User not found." };
        if (sender.status === UserStatus.FROZEN) return { message: "🚫 Account Frozen." };
        if (sender.transactionPin !== pin) return { message: "Invalid Security PIN" };

        // Redundant check removed since checkPermissions handles KYC
        // if (sender.kycStatus !== KycStatus.VERIFIED) ...

        let recipientUser = null;
        if (recipient.includes("@")) {
            recipientUser = await db.user.findUnique({ where: { email: recipient } });
        } else {
            recipientUser = await db.user.findUnique({ where: { id: recipient } });
        }

        // 3. Execute Transfer
        type TransferResult = {
            senderLedgerId?: string;
            recipientLedgerId?: string;
            recipientUserId?: string;
        };

        const result: TransferResult = await db.$transaction(async (tx) => {
            const senderAsset = await tx.cryptoAsset.findUnique({
                where: { userId_symbol: { userId: user.id, symbol } }
            });

            if (!senderAsset || Number(senderAsset.quantity) < amount) {
                throw new Error("Insufficient crypto balance.");
            }

            // A. DEDUCT SENDER
            await tx.cryptoAsset.update({
                where: { id: senderAsset.id },
                data: { quantity: { decrement: amount } }
            });

            await tx.cryptoTransaction.create({
                data: { userId: user.id, type: "SEND", symbol, amount, priceAtTime: price, totalUsd: usdValue }
            });

            const senderAccount = await tx.account.findFirst({ where: { userId: sender.id } });
            let senderLedgerId;

            if (senderAccount) {
                const sTx = await tx.ledgerEntry.create({
                    data: {
                        accountId: senderAccount.id, amount: usdValue,
                        type: TransactionType.CRYPTO_SEND,
                        direction: TransactionDirection.DEBIT,
                        status: TransactionStatus.COMPLETED,
                        description: `Sent ${amount} ${symbol} to ${recipient}`,
                        referenceId: `CSEND-${Date.now()}`
                    }
                });
                senderLedgerId = sTx.id;
            }

            let recipientLedgerId;
            let recipientUserId;

            // B. CREDIT RECIPIENT
            if (recipientUser) {
                recipientUserId = recipientUser.id;
                await tx.cryptoAsset.upsert({
                    where: { userId_symbol: { userId: recipientUser.id, symbol } },
                    update: { quantity: { increment: amount } },
                    create: { userId: recipientUser.id, symbol, quantity: amount, avgBuyPrice: 0 }
                });

                await tx.cryptoTransaction.create({
                    data: { userId: recipientUser.id, type: "RECEIVE", symbol, amount, priceAtTime: price, totalUsd: usdValue }
                });

                const recipientAccount = await tx.account.findFirst({ where: { userId: recipientUser.id } });
                if (recipientAccount) {
                    const rTx = await tx.ledgerEntry.create({
                        data: {
                            accountId: recipientAccount.id, amount: usdValue,
                            type: TransactionType.CRYPTO_RECEIVE,
                            direction: TransactionDirection.CREDIT,
                            status: TransactionStatus.COMPLETED,
                            description: `Received ${amount} ${symbol} from ${sender.email}`,
                            referenceId: `CRECV-${Date.now()}`
                        }
                    });
                    recipientLedgerId = rTx.id;
                }
            }

            return { senderLedgerId, recipientLedgerId, recipientUserId };
        });

        // 4. Notifications
        await db.notification.create({
            data: {
                userId: user.id,
                title: "Crypto Sent",
                message: `You sent ${amount} ${symbol} to ${recipient}.`,
                type: "SUCCESS",
                link: result.senderLedgerId ? `/dashboard/transactions/${result.senderLedgerId}` : "/dashboard/crypto",
                isRead: false
            }
        });

        if (result.recipientUserId) {
            await db.notification.create({
                data: {
                    userId: result.recipientUserId,
                    title: "Crypto Received",
                    message: `You received ${amount} ${symbol} from ${sender.email}.`,
                    type: "SUCCESS",
                    link: result.recipientLedgerId ? `/dashboard/transactions/${result.recipientLedgerId}` : "/dashboard/crypto",
                    isRead: false
                }
            });
        }

    } catch (err: any) {
        return { message: err.message || "Transfer failed." };
    }

    revalidatePath("/dashboard/crypto");
    return { success: true, message: `Successfully sent ${amount} ${symbol}` };
}

// ==========================================
// 🆕 GENERATE WALLET
// ==========================================
export async function generateWallet(prevState: any, formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

   // 1. 🚧 Maintenance Check
   if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    const permission = await checkPermissions(user.id, 'WALLET_GEN');
   if (!permission.allowed) return { message: `🚫 ${permission.error}` };

    const symbol = formData.get("symbol") as string;
    if (!symbol) return { success: false, message: "Currency required" };

    try {
        const existing = await db.cryptoAsset.findFirst({
            where: { userId: user.id, symbol: symbol }
        });

        if (existing) return { success: false, message: `You already have a ${symbol} wallet.` };

        await db.cryptoAsset.create({
            data: { userId: user.id, symbol: symbol, quantity: 0, avgBuyPrice: 0 }
        });

    } catch (error) {
        return { success: false, message: "Failed to generate wallet." };
    }

    revalidatePath("/dashboard/crypto");
    return { success: true, message: `${symbol} wallet generated successfully!` };
}


// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkPermissions } from "@/lib/security";
// import { getLiveMarketData } from "@/lib/marketData";
// import {
//   UserStatus,
//   KycStatus,
//   TransactionType,
//   TransactionStatus,
//   TransactionDirection
// } from "@prisma/client";

// // --- ACTION 1: TRADE (BUY / SELL) ---
// export async function tradeCrypto(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { message: "Unauthorized" };

//     // 1. CHECKS
//     const permission = await checkPermissions(session.user.id, 'CRYPTO');
//     if (!permission.allowed) return { message: `🚫 ${permission.error}` };

//     const user = await db.user.findUnique({ where: { id: session.user.id } });
//     if (!user) return { message: "User not found." };

//     if (user.status === UserStatus.FROZEN) return { message: "🚫 Account Frozen." };
//     if (user.kycStatus !== KycStatus.VERIFIED) return { message: "Trading disabled. Verify Identity." };

//     const type = formData.get("type") as "BUY" | "SELL";
//     const symbol = formData.get("currency") as string;
//     const inputAmount = Number(formData.get("amount"));

//     if (!inputAmount || inputAmount <= 0) return { message: "Invalid amount" };

//     // 2. FETCH MARKET DATA
//     const marketData = await getLiveMarketData();
//     const targetCoin = marketData.find(coin => coin.symbol === symbol);
//     let currentPrice = targetCoin?.price || 0;
//     if (symbol === 'HYPE' && currentPrice === 0) currentPrice = 25;

//     if (!currentPrice || currentPrice <= 0) return { message: "Price unavailable. Try again." };

//     try {
//         const account = await db.account.findFirst({
//             where: { userId: session.user.id, isPrimary: true }
//         });
//         if (!account) return { message: "No USD account found." };

//         let asset = await db.cryptoAsset.findUnique({
//             where: { userId_symbol: { userId: session.user.id, symbol } }
//         });

//         const cryptoAmount = inputAmount / currentPrice;

//         let newQty = 0;
//         let newAvgPrice = 0;

//         if (asset) {
//             const oldQty = Number(asset.quantity);
//             const oldAvg = Number(asset.avgBuyPrice);
//             if (type === "BUY") {
//                 newQty = oldQty + cryptoAmount;
//                 newAvgPrice = newQty > 0 ? ((oldQty * oldAvg) + (cryptoAmount * currentPrice)) / newQty : currentPrice;
//             } else {
//                 newQty = oldQty - cryptoAmount;
//                 newAvgPrice = oldAvg;
//             }
//         } else {
//             if (type === "SELL") return { message: "Insufficient Crypto balance." };
//             newQty = cryptoAmount;
//             newAvgPrice = currentPrice;
//         }

//         if (type === "BUY" && Number(account.availableBalance) < inputAmount) return { message: "Insufficient USD funds." };
//         if (type === "SELL" && (!asset || Number(asset.quantity) < cryptoAmount)) return { message: "Insufficient Crypto balance." };

//         await db.$transaction(async (tx) => {
//             // A. UPDATE USD
//             await tx.account.update({
//                 where: { id: account.id },
//                 data: {
//                     availableBalance: type === "BUY" ? { decrement: inputAmount } : { increment: inputAmount },
//                     currentBalance: type === "BUY" ? { decrement: inputAmount } : { increment: inputAmount }
//                 }
//             });

//             // B. UPDATE CRYPTO
//             if (asset) {
//                 await tx.cryptoAsset.update({
//                     where: { id: asset.id },
//                     data: { quantity: newQty, avgBuyPrice: newAvgPrice }
//                 });
//             } else {
//                 await tx.cryptoAsset.create({
//                     data: { userId: session.user.id, symbol, quantity: newQty, avgBuyPrice: newAvgPrice }
//                 });
//             }

//             // C. LOG TRANSACTION
//             await tx.cryptoTransaction.create({
//                 data: {
//                     userId: session.user.id,
//                     type: type,
//                     symbol,
//                     amount: cryptoAmount,
//                     priceAtTime: currentPrice,
//                     totalUsd: inputAmount
//                 }
//             });

//             // D. LOG LEDGER
//            const ledgerTx = await tx.ledgerEntry.create({
//                 data: {
//                     accountId: account.id,
//                     amount: inputAmount,
//                     type: type === "BUY" ? TransactionType.CRYPTO_BUY : TransactionType.CRYPTO_SELL,
//                     direction: type === "BUY" ? TransactionDirection.DEBIT : TransactionDirection.CREDIT,
//                     status: TransactionStatus.COMPLETED,
//                     description: type === "BUY" ? `Bought ${cryptoAmount.toFixed(6)} ${symbol}` : `Sold ${cryptoAmount.toFixed(6)} ${symbol}`,
//                     referenceId: `${type}-${Date.now()}`,
//                 }
//             });

//             // E. 👇 NOTIFICATION (Trade Confirmation)
//             await tx.notification.create({
//                 data: {
//                     userId: session.user.id,
//                     title: `Crypto ${type === "BUY" ? "Purchase" : "Sale"} Successful`,
//                     message: `You successfully ${type === "BUY" ? "bought" : "sold"} ${cryptoAmount.toFixed(6)} ${symbol} for $${inputAmount.toLocaleString()}.`,
//                     type: "SUCCESS",
//                     link: `/dashboard/transactions/${ledgerTx.id}`,
//                     isRead: false
//                 }
//             });
//         });

//     } catch (err: any) {
//         return { message: err.message || "Trade Failed" };
//     }

//     revalidatePath("/dashboard/crypto");
//     revalidatePath("/dashboard");
//     return { success: true, message: `${type} Order Executed Successfully!` };
// }

// // --- ACTION 2: TRANSFER (SEND CRYPTO) ---
// export async function transferCrypto(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { message: "Unauthorized" };

//     const permission = await checkPermissions(session.user.id, 'CRYPTO');
//     if (!permission.allowed) return { message: `🚫 ${permission.error}` };

//     const symbol = formData.get("symbol") as string;
//     const amount = Number(formData.get("amount"));
//     const recipient = formData.get("recipient") as string;
//     const pin = formData.get("pin") as string;

//     if (!amount || amount <= 0) return { message: "Invalid amount" };

//     const marketData = await getLiveMarketData();
//     const targetCoin = marketData.find(c => c.symbol === symbol);
//     const price = targetCoin?.price || 0;
//     const usdValue = amount * price;

//     try {
//         const sender = await db.user.findUnique({ where: { id: session.user.id } });

//         if (!sender) return { message: "User not found." };
//         if (sender.status === UserStatus.FROZEN) return { message: "🚫 Account Frozen." };
//         if (sender.transactionPin !== pin) return { message: "Invalid Security PIN" };
//         if (sender.kycStatus !== KycStatus.VERIFIED) return { message: "Identity verification required." };

//         let recipientUser = null;
//         if (recipient.includes("@")) {
//             recipientUser = await db.user.findUnique({ where: { email: recipient } });
//         } else {
//             recipientUser = await db.user.findUnique({ where: { id: recipient } });
//         }

//         await db.$transaction(async (tx) => {
//             const senderAsset = await tx.cryptoAsset.findUnique({
//                 where: { userId_symbol: { userId: session.user.id, symbol } }
//             });

//             if (!senderAsset || Number(senderAsset.quantity) < amount) {
//                 throw new Error("Insufficient crypto balance.");
//             }

//             // A. DEDUCT SENDER
//             await tx.cryptoAsset.update({
//                 where: { id: senderAsset.id },
//                 data: { quantity: { decrement: amount } }
//             });

//             await tx.cryptoTransaction.create({
//                 data: { userId: session.user.id, type: "SEND", symbol, amount, priceAtTime: price, totalUsd: usdValue }
//             });

//             const senderAccount = await tx.account.findFirst({ where: { userId: sender.id } });
//             let senderLedgerId = null;
//           if (senderAccount) {
//                 const sTx = await tx.ledgerEntry.create({
//                     data: {
//                         accountId: senderAccount.id, amount: usdValue,
//                         type: TransactionType.CRYPTO_SEND,
//                         direction: TransactionDirection.DEBIT,
//                         status: TransactionStatus.COMPLETED,
//                         description: `Sent ${amount} ${symbol} to ${recipient}`,
//                         referenceId: `CSEND-${Date.now()}`
//                     }
//                 });
//                 senderLedgerId = sTx.id;
//             }

//             // 👇 NOTIFY SENDER
//             await tx.notification.create({
//                 data: {
//                     userId: session.user.id,
//                     title: "Crypto Sent",
//                     message: `You sent ${amount} ${symbol} to ${recipient}.`,
//                     type: "SUCCESS",
//                     link: senderLedgerId ? `/dashboard/transactions/${senderLedgerId}` : "/dashboard/crypto",
//                     isRead: false
//                 }
//             });

//             // B. CREDIT RECIPIENT & NOTIFY
//             if (recipientUser) {
//                 await tx.cryptoAsset.upsert({
//                     where: { userId_symbol: { userId: recipientUser.id, symbol } },
//                     update: { quantity: { increment: amount } },
//                     create: { userId: recipientUser.id, symbol, quantity: amount, avgBuyPrice: 0 }
//                 });

//                 await tx.cryptoTransaction.create({
//                     data: { userId: recipientUser.id, type: "RECEIVE", symbol, amount, priceAtTime: price, totalUsd: usdValue }
//                 });

//                 const recipientAccount = await tx.account.findFirst({ where: { userId: recipientUser.id } });
//                 let recipientLedgerId = null;
//               if (recipientAccount) {
//                     const rTx = await tx.ledgerEntry.create({
//                         data: {
//                             accountId: recipientAccount.id, amount: usdValue,
//                             type: TransactionType.CRYPTO_RECEIVE,
//                             direction: TransactionDirection.CREDIT,
//                             status: TransactionStatus.COMPLETED,
//                             description: `Received ${amount} ${symbol} from ${sender.email}`,
//                             referenceId: `CRECV-${Date.now()}`
//                         }
//                     });
//                     recipientLedgerId = rTx.id;
//                 }

//                 // 👇 NOTIFY RECIPIENT
//                 await tx.notification.create({
//                     data: {
//                         userId: recipientUser.id,
//                         title: "Crypto Received",
//                         message: `You received ${amount} ${symbol} from ${sender.email}.`,
//                         type: "SUCCESS",
//                         link: recipientLedgerId ? `/dashboard/transactions/${recipientLedgerId}` : "/dashboard/crypto",
//                         isRead: false
//                     }
//                 });
//             }
//         });

//     } catch (err: any) {
//         return { message: err.message || "Transfer failed." };
//     }

//     revalidatePath("/dashboard/crypto");
//     return { success: true, message: `Successfully sent ${amount} ${symbol}` };
// }

// // --- ACTION 3: GENERATE WALLET ---
// // (No Notification needed here, just a setup step)
// export async function generateWallet(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { success: false, message: "Unauthorized" };

//     const symbol = formData.get("symbol") as string;
//     if (!symbol) return { success: false, message: "Currency required" };

//     try {
//         const existing = await db.cryptoAsset.findFirst({
//             where: { userId: session.user.id, symbol: symbol }
//         });

//         if (existing) return { success: false, message: `You already have a ${symbol} wallet.` };

//         await db.cryptoAsset.create({
//             data: { userId: session.user.id, symbol: symbol, quantity: 0, avgBuyPrice: 0 }
//         });

//     } catch (error) {
//         return { success: false, message: "Failed to generate wallet." };
//     }

//     revalidatePath("/dashboard/crypto");
//     return { success: true, message: `${symbol} wallet generated successfully!` };
// }