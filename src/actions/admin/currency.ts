'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

interface ExchangeRateResponse {
    rates: Record<string, number>;
}

// 1. GET ALL RATES
export async function getExchangeRates() {
    try {
        const rates = await db.exchangeRate.findMany({
            orderBy: { currency: 'asc' }
        });
        return { success: true, data: rates };
    } catch (error) {
        return { success: false, message: "Failed to fetch rates" };
    }
}

// 2. REFRESH RATES (Fetches from Open API)
export async function refreshLiveRates() {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        // Fetching from a standard open exchange rate API (Base: USD)
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error("Failed to fetch external rates");

        const data: ExchangeRateResponse = await res.json();

        // Currencies we want to support specifically
        const targetCurrencies = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "ZAR"];

        // Upsert each rate into the DB
        for (const currency of targetCurrencies) {
            if (data.rates[currency]) {
                await db.exchangeRate.upsert({
                    where: { currency },
                    update: { rate: data.rates[currency] },
                    create: {
                        currency,
                        rate: data.rates[currency]
                    }
                });
            }
        }

        revalidatePath("/admin/rates");
        return { success: true, message: "Exchange rates updated successfully" };

    } catch (error: any) {
        console.error("Rate Refresh Error:", error);
        return { success: false, message: error.message || "Failed to update rates" };
    }
}

// 3. MANUAL UPDATE (If you want to set a custom rate)
export async function updateManualRate(currency: string, newRate: number) {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        await db.exchangeRate.update({
            where: { currency },
            data: { rate: newRate }
        });

        revalidatePath("/admin/rates");
        return { success: true, message: `Updated ${currency} rate` };
    } catch (error) {
        return { success: false, message: "Failed to update rate" };
    }
}


// --- CREATE ---
export async function createCurrency(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const code = formData.get("code") as string;
    const flag = formData.get("flag") as string;
    const rate = parseFloat(formData.get("rate") as string);

    if (!code || !flag || isNaN(rate)) {
        return { success: false, message: "Missing or invalid currency fields" };
    }

    try {
        await db.currency.create({
            data: {
                code: code.toUpperCase(),
                flag,
                rate,
                active: true
            }
        });

        await logAdminAction(
            "CREATE_CURRENCY",
            code.toUpperCase(),
            {
                code,
                rate,
                action: "Added new currency rate",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { success: true, message: "Currency added successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create currency" };
    }
}

// --- UPDATE RATE ---
export async function updateCurrencyRate(id: string, rate: number) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const currency = await db.currency.update({
            where: { id },
            data: { rate }
        });

        await logAdminAction(
            "UPDATE_CURRENCY_RATE",
            currency.code,
            {
                newRate: rate,
                action: "Updated exchange rate",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        return { success: false, message: "Update failed" };
    }
}

// --- DELETE ---
export async function deleteCurrency(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const currency = await db.currency.findUnique({ where: { id } });

        await db.currency.delete({ where: { id } });

        await logAdminAction(
            "DELETE_CURRENCY",
            currency?.code || id,
            {
                action: "Removed currency from system",
                admin: auth.session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/');
        revalidatePath('/admin/settings');
        return { success: true, message: "Currency removed" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}