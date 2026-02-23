import { db } from "@/lib/db";
import { SITE_NAME, SITE_DESCRIPTION, SITE_LOGO, MEGA_MENUS } from "@/lib/utils/constants";
import { cache } from "react";

export const getSiteSettings = cache(async () => {

    try {
        let mainSettings = await db.siteSettings.findFirst({
            include: {
                content: true,
                features: true
             }
        });

        // 2. Initialize Defaults (Singleton Pattern)
        if (!mainSettings) {
            mainSettings = await db.siteSettings.create({
                data: {
                    id: "settings",
                    site_name: "Trust Bank",
                    auth_login_limit: 5,
                    content: { create: { id: "content-settings" } },
                    features: { create: { } }
                },
                include: {
                    content: true,
                    features: true
                }
            });
        }

        if (!mainSettings) throw new Error("Failed to initialize settings");

        // Self-Healing: If Content is missing (e.g. manual DB edit)
        if (!mainSettings.content) {
            const newContent = await db.contentSettings.create({
                data: { id: "content-settings", siteSettingsId: mainSettings.id }
            });
            mainSettings.content = newContent as any;
        }

        // Self-Healing: If Features is missing
        if (!mainSettings.features) {
             await db.contentFeatures.create({
                 data: { siteSettingsId: mainSettings.id }
             });

             // Re-fetch to get the join
             mainSettings = await db.siteSettings.findUnique({
                 where: { id: mainSettings.id },
                 include: { content: true, features: true }
             });
        }

        // RE-VERIFY after re-fetch
        if (!mainSettings) throw new Error("Failed to reload settings");

        // 3. Navigation Logic
        let baseMenuStructure = MEGA_MENUS;

        // 4. Hydrate Navigation
        const navigation = {
            BANKING: {
                ...baseMenuStructure.BANKING,
                promo: {
                    ...baseMenuStructure.BANKING?.promo,
                    title: mainSettings.nav_bank_title,
                    desc: mainSettings.nav_bank_desc,
                }
            },
            LENDING: {
                ...baseMenuStructure.LENDING,
                promo: {
                    ...baseMenuStructure.LENDING?.promo,
                    title: mainSettings.nav_borrow_title,
                    desc: mainSettings.nav_borrow_desc,
                }
            },
            WEALTH: {
                ...baseMenuStructure.WEALTH,
                promo: {
                    ...baseMenuStructure.WEALTH?.promo,
                    title: mainSettings.nav_wealth_title,
                    desc: mainSettings.nav_wealth_desc,
                }
            },
            INSURE: {
                ...baseMenuStructure.INSURE,
                promo: {
                    ...baseMenuStructure.INSURE?.promo,
                    title: mainSettings.nav_insure_title,
                    desc: mainSettings.nav_insure_desc,
                }
            },
            RESOURCES: {
                ...baseMenuStructure.RESOURCES,
                promo: {
                    ...baseMenuStructure.RESOURCES?.promo,
                    title: mainSettings.nav_learn_title,
                    desc: mainSettings.nav_learn_desc,
                }
            }
        };

        // 5. Return Merged Settings
        return {
            ...mainSettings,
            ...mainSettings.content,
            ...mainSettings.features,
            navigation
        };

    } catch (error) {
        console.error("CRITICAL: Failed to fetch settings", error);

        return {
            site_name: SITE_NAME,
            site_description: SITE_DESCRIPTION,
            site_logo: SITE_LOGO,
            auth_login_limit: 5,
            navigation: MEGA_MENUS,
        } as any;
    }
});