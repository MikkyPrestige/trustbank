'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkPermissions } from "@/lib/security";
import { getLiveCryptoPrices } from "@/lib/crypto-api";

// --- ACTION 1: TRADE (BUY / SELL) ---
export async function tradeCrypto(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    // 1. SECURITY & PERMISSION CHECK
    const permission = await checkPermissions(session.user.id, 'CRYPTO');
    if (!permission.allowed) return { message: `🚫 ${permission.error}` };

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { message: "User not found." };

    // 🛑 NEW: FROZEN CHECK
    if (user.status === 'FROZEN') {
        return { message: "🚫 Account Frozen. Trading is disabled." };
    }

    // 🔒 KYC GATEKEEPER
    if (user.kycStatus !== 'VERIFIED') {
        return { message: "Trading disabled. Identity verification required." };
    }

    const type = formData.get("type") as "BUY" | "SELL";
    const symbol = formData.get("currency") as string;
    const inputAmount = Number(formData.get("amount"));

    if (!inputAmount || inputAmount <= 0) return { message: "Invalid amount" };

    // 2. FETCH LIVE PRICE
    const liveData = await getLiveCryptoPrices();

    const map: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
        'HYPE': 'hype'
    };

    const coinId = map[symbol] || 'bitcoin';
    const currentPrice = liveData[coinId]?.usd || 0;

    if (!currentPrice) return { message: "Price unavailable. Try again." };

    try {
        await db.$transaction(async (tx) => {
            // Find User's USD Account (Primary)
            const account = await tx.account.findFirst({
                where: { userId: session.user.id },
                orderBy: { availableBalance: 'desc' }
            });
            if (!account) throw new Error("No USD account found.");

            // Find or Create Crypto Asset Wallet
            let asset = await tx.cryptoAsset.findUnique({
                where: { userId_symbol: { userId: session.user.id, symbol } }
            });

            if (!asset) {
                asset = await tx.cryptoAsset.create({
                    data: { userId: session.user.id, symbol, quantity: 0, avgBuyPrice: 0 }
                });
            }

            if (type === "BUY") {
                // --- BUYING LOGIC (Spend USD -> Get Crypto) ---
                if (Number(account.availableBalance) < inputAmount) throw new Error("Insufficient USD funds.");

                const cryptoAmount = inputAmount / currentPrice;

                // Calculate New Weighted Average Price
                const oldQty = Number(asset.quantity);
                const oldAvg = Number(asset.avgBuyPrice);
                const newQty = oldQty + cryptoAmount;
                const newAvgPrice = ((oldQty * oldAvg) + (cryptoAmount * currentPrice)) / newQty;

                // 1. Deduct USD
                await tx.account.update({
                    where: { id: account.id },
                    data: { availableBalance: { decrement: inputAmount } }
                });

                // 2. Add Crypto
                await tx.cryptoAsset.update({
                    where: { id: asset.id },
                    data: {
                        quantity: { increment: cryptoAmount },
                        avgBuyPrice: newAvgPrice
                    }
                });

                // 3. Record Crypto Transaction
                await tx.cryptoTransaction.create({
                    data: {
                        userId: session.user.id,
                        type: "BUY",
                        symbol,
                        amount: cryptoAmount,
                        priceAtTime: currentPrice,
                        totalUsd: inputAmount
                    }
                });

                // 4. Record LEDGER
                await tx.ledgerEntry.create({
                    data: {
                        accountId: account.id,
                        amount: inputAmount,
                        type: "CRYPTO_BUY",
                        direction: "DEBIT",
                        status: "COMPLETED",
                        description: `Bought ${cryptoAmount.toFixed(6)} ${symbol}`,
                        referenceId: `BUY-${Date.now()}`
                    }
                });

            } else {
                // --- SELLING LOGIC (Spend Crypto -> Get USD) ---
                const cryptoToSell = inputAmount / currentPrice;

                if (Number(asset.quantity) < cryptoToSell) throw new Error("Insufficient Crypto balance.");

                // 1. Deduct Crypto
                await tx.cryptoAsset.update({
                    where: { id: asset.id },
                    data: { quantity: { decrement: cryptoToSell } }
                });

                // 2. Add USD
                await tx.account.update({
                    where: { id: account.id },
                    data: { availableBalance: { increment: inputAmount } }
                });

                 // 3. Record Crypto Transaction
                 await tx.cryptoTransaction.create({
                    data: {
                        userId: session.user.id,
                        type: "SELL",
                        symbol,
                        amount: cryptoToSell,
                        priceAtTime: currentPrice,
                        totalUsd: inputAmount
                    }
                });

                // 4. Record LEDGER
                await tx.ledgerEntry.create({
                    data: {
                        accountId: account.id,
                        amount: inputAmount,
                        type: "CRYPTO_SELL",
                        direction: "CREDIT",
                        status: "COMPLETED",
                        description: `Sold ${cryptoToSell.toFixed(6)} ${symbol}`,
                        referenceId: `SELL-${Date.now()}`
                    }
                });
            }
        });

        revalidatePath("/dashboard/crypto");
        revalidatePath("/dashboard");
        return { success: true, message: `Trade executed at $${currentPrice.toLocaleString()}` };

    } catch (err: any) {
        return { message: err.message || "Trade Failed" };
    }
}

// --- ACTION 2: TRANSFER (SEND CRYPTO) ---
export async function transferCrypto(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const permission = await checkPermissions(session.user.id, 'CRYPTO');
    if (!permission.allowed) return { message: `🚫 ${permission.error}` };

    const symbol = formData.get("symbol") as string;
    const amount = Number(formData.get("amount"));
    const recipient = formData.get("recipient") as string;
    const pin = formData.get("pin") as string;

    if (!amount || amount <= 0) return { message: "Invalid amount" };

    try {
        const sender = await db.user.findUnique({ where: { id: session.user.id } });

        // Security Checks
        if (!sender) return { message: "User not found." };

        // 🛑 NEW: FROZEN CHECK
        if (sender.status === 'FROZEN') {
            return { message: "🚫 Account Frozen. Crypto transfers are disabled." };
        }

        if (sender.transactionPin !== pin) return { message: "Invalid Security PIN" };

        // 🔒 KYC GATEKEEPER
        if (sender.kycStatus !== 'VERIFIED') {
            return { message: "Transfers disabled. Identity verification required." };
        }

        await db.$transaction(async (tx) => {
            // Check Sender Balance
            const senderAsset = await tx.cryptoAsset.findUnique({
                where: { userId_symbol: { userId: session.user.id, symbol } }
            });

            if (!senderAsset || Number(senderAsset.quantity) < amount) {
                throw new Error("Insufficient crypto balance.");
            }

            // Check if Recipient is Internal
            const recipientUser = recipient.includes("@")
                ? await tx.user.findUnique({ where: { email: recipient } })
                : null;

            // Deduct from Sender
            await tx.cryptoAsset.update({
                where: { id: senderAsset.id },
                data: { quantity: { decrement: amount } }
            });

            // Log Sender Transaction
            await tx.cryptoTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "SEND",
                    symbol,
                    amount,
                    priceAtTime: 0,
                    totalUsd: 0,
                }
            });

            if (recipientUser) {
                // INTERNAL TRANSFER
                let recipientAsset = await tx.cryptoAsset.findUnique({
                    where: { userId_symbol: { userId: recipientUser.id, symbol } }
                });

                if (!recipientAsset) {
                    recipientAsset = await tx.cryptoAsset.create({
                        data: { userId: recipientUser.id, symbol, quantity: 0, avgBuyPrice: 0 }
                    });
                }

                // Add to Recipient
                await tx.cryptoAsset.update({
                    where: { id: recipientAsset.id },
                    data: { quantity: { increment: amount } }
                });

                // Log Recipient Transaction
                await tx.cryptoTransaction.create({
                    data: {
                        userId: recipientUser.id,
                        type: "RECEIVE",
                        symbol,
                        amount,
                        priceAtTime: 0,
                        totalUsd: 0
                    }
                });
            }
            // External transfers just deduct funds (simulation)
        });

        revalidatePath("/dashboard/crypto");
        return { success: true, message: `Successfully sent ${amount} ${symbol}` };

    } catch (err: any) {
        return { message: err.message || "Transfer failed." };
    }
}