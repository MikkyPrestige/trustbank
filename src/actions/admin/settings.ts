'use server';

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

const SETTING_METADATA: Record<string, { group: string, type: string }> = {
    // --- GENERAL ---
    site_name: { group: 'BRANDING', type: 'STRING' },
    site_logo: { group: 'BRANDING', type: 'IMAGE' },
    contact_email: { group: 'CONTACT', type: 'STRING' },
    contact_phone: { group: 'CONTACT', type: 'STRING' },
    address_main:  { group: 'CONTACT', type: 'STRING' },

    // --- HOME PAGE ---
    hero_title:    { group: 'HOME', type: 'STRING' },
    hero_subtitle: { group: 'HOME', type: 'STRING' },
    hero_cta_text: { group: 'HOME', type: 'STRING' },
    announcement_active: { group: 'HOME', type: 'BOOLEAN' },
    announcement_text:   { group: 'HOME', type: 'STRING' },

    // --- PRODUCT PAGES (The Missing Ones Added) ---
    // Bank & Save
    bank_hero_title_1: { group: 'PAGES', type: 'STRING' },
    bank_hero_desc:    { group: 'PAGES', type: 'STRING' },
    save_hero_title:   { group: 'PAGES', type: 'STRING' },
    save_hero_desc:    { group: 'PAGES', type: 'STRING' },

    // Borrow & Wealth
    borrow_hero_title: { group: 'PAGES', type: 'STRING' },
    borrow_hero_desc:  { group: 'PAGES', type: 'STRING' },
    wealth_hero_title: { group: 'PAGES', type: 'STRING' },
    wealth_hero_desc:  { group: 'PAGES', type: 'STRING' },

    // Crypto, Insure, Payments, Learn
    crypto_hero_title:   { group: 'PAGES', type: 'STRING' },
    crypto_hero_desc:    { group: 'PAGES', type: 'STRING' },
    insure_hero_title:   { group: 'PAGES', type: 'STRING' },
    insure_hero_desc:    { group: 'PAGES', type: 'STRING' },
    payments_hero_title: { group: 'PAGES', type: 'STRING' },
    payments_hero_desc:  { group: 'PAGES', type: 'STRING' },
    learn_hero_title:    { group: 'PAGES', type: 'STRING' },
    learn_hero_desc:     { group: 'PAGES', type: 'STRING' },

    // --- NAVBAR PROMOS ---
    nav_bank_title:   { group: 'NAV', type: 'STRING' },
    nav_bank_desc:    { group: 'NAV', type: 'STRING' },
    nav_wealth_title: { group: 'NAV', type: 'STRING' },
    nav_wealth_desc:  { group: 'NAV', type: 'STRING' },

    // --- DASHBOARD ---
    dashboard_promo_title: { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_desc:  { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_btn:   { group: 'DASHBOARD', type: 'STRING' },
    dashboard_promo_link:  { group: 'DASHBOARD', type: 'STRING' },
    dashboard_alert_show:  { group: 'DASHBOARD', type: 'BOOLEAN' },
    dashboard_alert_type:  { group: 'DASHBOARD', type: 'STRING' },
    dashboard_alert_msg:   { group: 'DASHBOARD', type: 'STRING' },

    // --- RATES ---
    rate_hysa_apy:       { group: 'RATES', type: 'NUMBER' },
    rate_cd_apy:         { group: 'RATES', type: 'NUMBER' },
    rate_mortgage_30yr:  { group: 'RATES', type: 'NUMBER' },
    rate_personal_apr:   { group: 'RATES', type: 'NUMBER' },
    rate_auto_low:       { group: 'RATES', type: 'NUMBER' },
    rate_checking_bonus: { group: 'RATES', type: 'NUMBER' },

    // --- SUPPORT ---
    dashboard_support_phone: { group: 'SUPPORT', type: 'STRING' },
    dashboard_support_email: { group: 'SUPPORT', type: 'STRING' },

    // --- LEGAL DOCUMENTS ---
    legal_privacy_policy:          { group: 'LEGAL', type: 'RICH_TEXT' },
    legal_terms_of_use:            { group: 'LEGAL', type: 'RICH_TEXT' },
    legal_accessibility_statement: { group: 'LEGAL', type: 'RICH_TEXT' },
};

export async function updateSiteSettings(formData: FormData) {
    await requireAdmin();

    try {
        for (const [key, meta] of Object.entries(SETTING_METADATA)) {
            let value = formData.get(key) as string;

            if (meta.type === 'BOOLEAN') {
                value = value === 'on' ? 'true' : 'false';
            }

            if (value !== null || meta.type === 'BOOLEAN') {
                await db.systemSettings.upsert({
                    where: { key },
                    update: { value: value || "" },
                    create: { key, value: value || "", group: meta.group, type: meta.type }
                });
            }
        }
        revalidatePath('/');
        return { success: true, message: "Settings updated successfully" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to save settings" };
    }
}