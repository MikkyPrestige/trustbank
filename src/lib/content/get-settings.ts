import { db } from "@/lib/db";
import { STATIC_MENUS } from "@/lib/utils/constants";
import { cache } from "react";

export const getSiteSettings = cache(async () => {
    try {
        // 1. Fetch Dynamic Settings from DB
        let settings = await db.siteSettings.findFirst();

        // 2. If no settings exist (First run), create defaults
        if (!settings) {
            settings = await db.siteSettings.create({
                data: {
                    site_name: "TrustBank",
                }
            });
        }

        // 3. Navigation Logic: Determine Base Structure
        // Default to the code constants (Safety Net)
        let baseMenuStructure = STATIC_MENUS;

        // If Admin has saved a custom JSON structure, try to use it
        if (settings.nav_structure_json && settings.nav_structure_json.length > 20) {
            try {
                baseMenuStructure = JSON.parse(settings.nav_structure_json);
            } catch (error) {
                console.error("Failed to parse Nav JSON from DB. Reverting to static defaults.", error);
            }
        }

        // 4. Hydrate Navigation (Hybrid Merge)
        const navigation = {
            BANK: {
                ...baseMenuStructure.BANK,
                promo: {
                    ...baseMenuStructure.BANK?.promo,
                    title: settings.nav_bank_title,
                    desc: settings.nav_bank_desc,
                }
            },
            SAVE: {
                ...baseMenuStructure.SAVE,
                promo: {
                    ...baseMenuStructure.SAVE?.promo,
                    title: settings.nav_save_title,
                    desc: settings.nav_save_desc,
                }
            },
            BORROW: {
                ...baseMenuStructure.BORROW,
                promo: {
                    ...baseMenuStructure.BORROW?.promo,
                    title: settings.nav_borrow_title,
                    desc: settings.nav_borrow_desc,
                }
            },
            WEALTH: {
                ...baseMenuStructure.WEALTH,
                promo: {
                    ...baseMenuStructure.WEALTH?.promo,
                    title: settings.nav_wealth_title,
                    desc: settings.nav_wealth_desc,
                }
            },
            INSURE: {
                ...baseMenuStructure.INSURE,
                promo: {
                    ...baseMenuStructure.INSURE?.promo,
                    title: settings.nav_insure_title,
                    desc: settings.nav_insure_desc,
                }
            },
            PAYMENTS: {
                ...baseMenuStructure.PAYMENTS,
                promo: {
                    ...baseMenuStructure.PAYMENTS?.promo,
                    title: settings.nav_payments_title,
                    desc: settings.nav_payments_desc,
                }
            },
            LEARN: {
                ...baseMenuStructure.LEARN,
                promo: {
                    ...baseMenuStructure.LEARN?.promo,
                    title: settings.nav_learn_title,
                    desc: settings.nav_learn_desc,
                }
            },
            COMPANY: {
                ...baseMenuStructure.COMPANY,
                promo: {
                    ...baseMenuStructure.COMPANY?.promo,
                    title: settings.nav_company_title,
                    desc: settings.nav_company_desc,
                }
            }
        };

        // 5. Return Merged Settings
        return {
            ...settings,
            navigation
        };

    } catch (error) {
        console.error("CRITICAL: Failed to fetch settings", error);

        return {
            site_name: "TrustBank",
            site_logo: "/logo.png",
            navigation: STATIC_MENUS,
        } as any;
    }
});