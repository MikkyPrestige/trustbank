import { db } from "@/lib/db";
import { auth } from "@/auth";
import { cache } from "react";

export const getUserCurrencyData = cache(async () => {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Get User's Preferred Currency
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { currency: true }
    });

    const currencyCode = user?.currency || "USD";

    // If USD, no conversion needed
    if (currencyCode === "USD") {
        return { currency: "USD", rate: 1 };
    }

    // If other, get the exchange rate
    const rateData = await db.exchangeRate.findUnique({
        where: { currency: currencyCode }
    });

    return {
        currency: currencyCode,
        rate: Number(rateData?.rate) || 1
    };
});