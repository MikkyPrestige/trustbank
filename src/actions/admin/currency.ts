'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { z } from "zod";

interface ExchangeRateResponse {
    rates: Record<string, number>;
}

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const currencySchema = z.object({
  code: z.string().min(1, "Code is required").max(10),
  flag: z.string().max(100),
  rate: z.coerce.number().positive("Rate must be positive"),
});


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

export async function refreshLiveRates() {
    const { authorized } = await checkAdminAction();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!res.ok) throw new Error("Failed to fetch external rates");

        const data: ExchangeRateResponse = await res.json();

        const targetCurrencies = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "ZAR"];

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


export async function createCurrency(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

   const rawData = {
  code: formData.get("code") as string,
  flag: formData.get("flag") as string,
  rate: formData.get("rate") as string,
};

const validated = currencySchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { code: rawCode, flag: rawFlag, rate } = validated.data;

const code = sanitize(rawCode).toUpperCase();
const flag = sanitize(rawFlag);

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

export async function updateCurrencyRate(id: string, rate: number) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: "Unauthorized" };
    }

    const rateSchema = z.number().positive("Rate must be positive");
const validatedRate = rateSchema.safeParse(rate);
if (!validatedRate.success) {
  return { success: false, message: "Invalid rate value" };
}
const safeRate = validatedRate.data;

    try {
        const currency = await db.currency.update({
            where: { id },
            data: { rate: safeRate }
        });

        await logAdminAction(
            "UPDATE_CURRENCY_RATE",
            currency.code,
            {
                newRate: safeRate,
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