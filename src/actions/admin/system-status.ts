'use server';

import { db } from "@/lib/db";

export async function getFeatureStatus() {
    // Fetch generic settings manually since we are outside the 'security' logic flow
    const settings = await db.systemSettings.findMany({
        where: {
            key: { in: ['feature_loans_enabled', 'feature_crypto_enabled'] }
        }
    });

    // Convert to simple object
    const flags = {
        loans: true,
        crypto: true
    };

    settings.forEach(s => {
        if (s.key === 'feature_loans_enabled') flags.loans = s.value === 'true';
        if (s.key === 'feature_crypto_enabled') flags.crypto = s.value === 'true';
    });

    return flags;
}