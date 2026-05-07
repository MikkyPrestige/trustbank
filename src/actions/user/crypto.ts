'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkPermissions, checkInboundLimit, checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getLiveMarketData } from "@/lib/marketData";
import {
    UserStatus,
    TransactionType,
    TransactionStatus,
    TransactionDirection
} from "@prisma/client";
import { z } from "zod";
import { verifyPin } from "@/lib/security";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const tradeSchema = z.object({
  type: z.enum(["BUY", "SELL"], { message: "Invalid trade type" }),
  currency: z.string().min(1).max(10),
  amount: z.coerce.number().positive("Amount must be positive"),
  displayAmount: z.string().optional(),
  displayCurrency: z.string().optional(),
});

const transferCryptoSchema = z.object({
  symbol: z.string().min(1).max(10),
  amount: z.coerce.number().positive("Amount must be positive"),
  recipient: z.string().min(1).max(100),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

const walletSchema = z.object({
  symbol: z.string().min(1).max(10),
});


export async function tradeCrypto(prevState: any, formData: FormData) {
    const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    const permission = await checkPermissions(user.id, 'CRYPTO_TRADE');
    if (!permission.allowed) return { message: `🚫 ${permission.error}` };

   const rawTrade = {
  type: formData.get("type") as string,
  currency: formData.get("currency") as string,
  amount: formData.get("amount") as string,
  displayAmount: formData.get("displayAmount") as string,
  displayCurrency: formData.get("displayCurrency") as string,
};

const validatedTrade = tradeSchema.safeParse(rawTrade);
if (!validatedTrade.success) {
  return { message: validatedTrade.error.issues[0].message };
}

const { type, currency: symbol, amount: inputAmount, displayAmount, displayCurrency } = validatedTrade.data;

const safeSymbol = sanitize(symbol);

    const { assets: marketData } = await getLiveMarketData();
    const targetCoin = marketData.find(coin => coin.symbol === safeSymbol);

    let currentPrice = targetCoin?.price || 0;
    if (safeSymbol === 'HYPE' && currentPrice === 0) currentPrice = 25;

    if (!currentPrice || currentPrice <= 0) return { message: "Price unavailable. Try again." };

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
            where: { userId_symbol: { userId: user.id, symbol: safeSymbol } }
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

        if (type === "BUY" && Number(account.availableBalance) < inputAmount) return { message: "Insufficient funds." };
        if (type === "SELL" && (!asset || Number(asset.quantity) < cryptoAmount)) return { message: "Insufficient Crypto balance." };

        const ledgerId = await db.$transaction(async (tx) => {
            await tx.account.update({
                where: { id: account.id },
                data: {
                    availableBalance: type === "BUY" ? { decrement: inputAmount } : { increment: inputAmount },
                    currentBalance: type === "BUY" ? { decrement: inputAmount } : { increment: inputAmount }
                }
            });

            if (asset) {
                await tx.cryptoAsset.update({
                    where: { id: asset.id },
                    data: { quantity: newQty, avgBuyPrice: newAvgPrice }
                });
            } else {
                await tx.cryptoAsset.create({
                    data: { userId: user.id, symbol: safeSymbol, quantity: newQty, avgBuyPrice: newAvgPrice }
                });
            }

            await tx.cryptoTransaction.create({
                data: {
                    userId: user.id,
                    type: type,
                    symbol: safeSymbol,
                    amount: cryptoAmount,
                    priceAtTime: currentPrice,
                    totalUsd: inputAmount
                }
            });

            const ledgerTx = await tx.ledgerEntry.create({
                data: {
                    accountId: account.id,
                    amount: inputAmount,
                    type: type === "BUY" ? TransactionType.CRYPTO_BUY : TransactionType.CRYPTO_SELL,
                    direction: type === "BUY" ? TransactionDirection.DEBIT : TransactionDirection.CREDIT,
                    status: TransactionStatus.COMPLETED,
                    description: type === "BUY" ? `Bought ${cryptoAmount.toFixed(6)} ${safeSymbol}` : `Sold ${cryptoAmount.toFixed(6)} ${safeSymbol}`,
                    referenceId: `${type}-${Date.now()}`,
                    metadata: JSON.stringify({ originalAmount: displayAmount, originalCurrency: displayCurrency })
                }
            });

            return ledgerTx.id;
        });

        const formatMoney = (displayAmount && displayCurrency)
            ? `${displayCurrency} ${Number(displayAmount).toLocaleString()}`
            : `$${inputAmount.toLocaleString()}`;

        await db.notification.create({
            data: {
                userId: user.id,
                title: `Crypto ${type === "BUY" ? "Purchase" : "Sale"} Successful`,
                message: `You successfully ${type === "BUY" ? "bought" : "sold"} ${cryptoAmount.toFixed(6)} ${safeSymbol} for ${formatMoney}.`,
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

export async function transferCrypto(prevState: any, formData: FormData) {
    const { success, message, user: sessionUser } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !sessionUser) {
        return { message };
    }

    const permission = await checkPermissions(sessionUser.id, 'CRYPTO_TRANSFER');
    if (!permission.allowed) return { message: `🚫 ${permission.error}` };

  const rawTransfer = {
  symbol: formData.get("symbol") as string,
  amount: formData.get("amount") as string,
  recipient: formData.get("recipient") as string,
  pin: formData.get("pin") as string,
};

const validatedTransfer = transferCryptoSchema.safeParse(rawTransfer);
if (!validatedTransfer.success) {
  return { message: validatedTransfer.error.issues[0].message };
}

const { symbol, amount, recipient: rawRecipient, pin } = validatedTransfer.data;

const recipient = sanitize(rawRecipient);
const safeSymbol = sanitize(symbol);

const pinValidation = await verifyPin(sessionUser.id, pin);
if (!pinValidation.success) {
  return { message: pinValidation.error };
}

    const { assets: marketData } = await getLiveMarketData();
    const targetCoin = marketData.find(c => c.symbol === safeSymbol);
    const price = targetCoin?.price || 0;
    const usdValue = amount * price;

    try {
        const sender = await db.user.findUnique({ where: { id: sessionUser.id } });

        if (!sender) return { message: "User not found." };
        if (sender.status === UserStatus.FROZEN) return { message: "🚫 Account Frozen." };

        let recipientUser = null;
        if (recipient.includes("@")) {
            recipientUser = await db.user.findUnique({ where: { email: recipient } });
        } else {
            recipientUser = await db.user.findUnique({ where: { id: recipient } });
        }

        type TransferResult = {
            senderLedgerId?: string;
            recipientLedgerId?: string;
            recipientUserId?: string;
        };

        const result: TransferResult = await db.$transaction(async (tx) => {
            const senderAsset = await tx.cryptoAsset.findUnique({
                where: { userId_symbol: { userId: sender.id, symbol: safeSymbol } }
            });

            if (!senderAsset || Number(senderAsset.quantity) < amount) {
                throw new Error("Insufficient crypto balance.");
            }

            await tx.cryptoAsset.update({
                where: { id: senderAsset.id },
                data: { quantity: { decrement: amount } }
            });

            await tx.cryptoTransaction.create({
                data: { userId: sender.id, type: "SEND", symbol: safeSymbol, amount, priceAtTime: price, totalUsd: usdValue }
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
                        description: `Sent ${amount} ${safeSymbol} to ${recipient}`,
                        referenceId: `CSEND-${Date.now()}`
                    }
                });
                senderLedgerId = sTx.id;
            }

            let recipientLedgerId;
            let recipientUserId;

            if (recipientUser) {
                recipientUserId = recipientUser.id;
                await tx.cryptoAsset.upsert({
                    where: { userId_symbol: { userId: recipientUser.id, symbol: safeSymbol } },
                    update: { quantity: { increment: amount } },
                    create: { userId: recipientUser.id, symbol: safeSymbol, quantity: amount, avgBuyPrice: 0 }
                });

                await tx.cryptoTransaction.create({
                    data: { userId: recipientUser.id, type: "RECEIVE", symbol: safeSymbol, amount, priceAtTime: price, totalUsd: usdValue }
                });

                const recipientAccount = await tx.account.findFirst({ where: { userId: recipientUser.id } });
                if (recipientAccount) {
                    const rTx = await tx.ledgerEntry.create({
                        data: {
                            accountId: recipientAccount.id, amount: usdValue,
                            type: TransactionType.CRYPTO_RECEIVE,
                            direction: TransactionDirection.CREDIT,
                            status: TransactionStatus.COMPLETED,
                            description: `Received ${amount} ${safeSymbol} from ${sender.email}`,
                            referenceId: `CRECV-${Date.now()}`
                        }
                    });
                    recipientLedgerId = rTx.id;
                }
            }

            return { senderLedgerId, recipientLedgerId, recipientUserId };
        });

        await db.notification.create({
            data: {
                userId: sender.id,
                title: "Crypto Sent",
                message: `You sent ${amount} ${safeSymbol} to ${recipient}.`,
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
                    message: `You received ${amount} ${safeSymbol} from ${sender.email}.`,
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
    return { success: true, message: `Successfully sent ${amount} ${safeSymbol}` };
}

export async function generateWallet(prevState: any, formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

   if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) {
        return { message };
    }

    const permission = await checkPermissions(user.id, 'WALLET_GEN');
   if (!permission.allowed) return { message: `🚫 ${permission.error}` };

  const symbolRaw = formData.get("symbol") as string;
const parsedSymbol = walletSchema.safeParse({ symbol: symbolRaw });
if (!parsedSymbol.success) {
  return { success: false, message: "Currency required" };
}
const symbol = sanitize(parsedSymbol.data.symbol);

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