'use server';

import { db } from "@/lib/db";

export async function getFeatureStatus() {
    // 1. Fetch relevant settings
    const settings = await db.systemSettings.findMany({
        where: {
            key: {
                in: [
                    'feature_loan_apply_enabled',
                    'feature_crypto_enabled',
                    'feature_transfer_enabled',
                    'feature_wire_enabled'
                ]
            }
        }
    });

    // 2. Default State (Default to TRUE so features work if DB is empty)
    const flags = {
        loans: true,
        crypto: true,
        transfers: true,
        wire: true
    };

    // 3. Map Database Values to Simple Flags
    settings.forEach(s => {
        // Loans
        if (s.key === 'feature_loan_apply_enabled') {
            flags.loans = s.value === 'true';
        }

        // Crypto
        if (s.key === 'feature_crypto_enabled') {
            flags.crypto = s.value === 'true';
        }

        // Transfers (Internal)
        if (s.key === 'feature_transfer_enabled') {
            flags.transfers = s.value === 'true';
        }

        // Wire
        if (s.key === 'feature_wire_enabled') {
            flags.wire = s.value === 'true';
        }
    });

    return flags;
}