import { getSiteSettings } from "@/lib/content/get-settings";
import { MEGA_MENUS } from "@/lib/content/navbar.data";
import Navbar from "./Navbar";

export default async function SiteHeader() {
    // 1. Fetch CMS Settings
    const settings = await getSiteSettings();

    // 2. Initialize Menu Logic (Database JSON vs Default File)
    let dynamicMenus;

    if (settings.nav_structure_json && settings.nav_structure_json.trim() !== "") {
        try {
            // A. Try to use the Custom JSON from Admin Panel
            dynamicMenus = JSON.parse(settings.nav_structure_json);
        } catch (error) {
            console.error("Failed to parse Nav JSON from DB, reverting to default.", error);
            // B. Fallback if JSON is broken
            dynamicMenus = JSON.parse(JSON.stringify(MEGA_MENUS));
        }
    } else {
        // C. Fallback if DB is empty
        dynamicMenus = JSON.parse(JSON.stringify(MEGA_MENUS));
    }

    // 3. Update Menu Promo Content Based on Settings (CMS Overrides)
    // We safely check if the menu key exists before trying to assign promo data
    // to prevent crashes if you renamed keys in your JSON.

    // Banking
    if (dynamicMenus['BANK']?.promo) {
        if (settings.nav_bank_title) dynamicMenus['BANK'].promo.title = settings.nav_bank_title;
        if (settings.nav_bank_desc) dynamicMenus['BANK'].promo.desc = settings.nav_bank_desc;
        if (settings.nav_bank_link) dynamicMenus['BANK'].promo.link = settings.nav_bank_link;
    }

    // Savings
    if (dynamicMenus['SAVE']?.promo) {
        if (settings.nav_save_title) dynamicMenus['SAVE'].promo.title = settings.nav_save_title;
        if (settings.nav_save_desc) dynamicMenus['SAVE'].promo.desc = settings.nav_save_desc;
        if (settings.nav_save_link) dynamicMenus['SAVE'].promo.link = settings.nav_save_link;
    }

    // Borrow
    if (dynamicMenus['BORROW']?.promo) {
        if (settings.nav_borrow_title) dynamicMenus['BORROW'].promo.title = settings.nav_borrow_title;
        if (settings.nav_borrow_desc) dynamicMenus['BORROW'].promo.desc = settings.nav_borrow_desc;
        if (settings.nav_borrow_link) dynamicMenus['BORROW'].promo.link = settings.nav_borrow_link;
    }

    // Wealth
    if (dynamicMenus['WEALTH']?.promo) {
        if (settings.nav_wealth_title) dynamicMenus['WEALTH'].promo.title = settings.nav_wealth_title;
        if (settings.nav_wealth_desc) dynamicMenus['WEALTH'].promo.desc = settings.nav_wealth_desc;
        if (settings.nav_wealth_link) dynamicMenus['WEALTH'].promo.link = settings.nav_wealth_link;
    }

    // Insurance
    if (dynamicMenus['INSURE']?.promo) {
        if (settings.nav_insure_title) dynamicMenus['INSURE'].promo.title = settings.nav_insure_title;
        if (settings.nav_insure_desc) dynamicMenus['INSURE'].promo.desc = settings.nav_insure_desc;
        if (settings.nav_insure_link) dynamicMenus['INSURE'].promo.link = settings.nav_insure_link;
    }

    // Payments
    if (dynamicMenus['PAYMENTS']?.promo) {
        if (settings.nav_payments_title) dynamicMenus['PAYMENTS'].promo.title = settings.nav_payments_title;
        if (settings.nav_payments_desc) dynamicMenus['PAYMENTS'].promo.desc = settings.nav_payments_desc;
        if (settings.nav_payments_link) dynamicMenus['PAYMENTS'].promo.link = settings.nav_payments_link;
    }

    // Learning
    if (dynamicMenus['LEARN']?.promo) {
        if (settings.nav_learn_title) dynamicMenus['LEARN'].promo.title = settings.nav_learn_title;
        if (settings.nav_learn_desc) dynamicMenus['LEARN'].promo.desc = settings.nav_learn_desc;
        if (settings.nav_learn_link) dynamicMenus['LEARN'].promo.link = settings.nav_learn_link;
    }

    // Company
    if (dynamicMenus['COMPANY']?.promo) {
        if (settings.nav_company_title) dynamicMenus['COMPANY'].promo.title = settings.nav_company_title;
        if (settings.nav_company_desc) dynamicMenus['COMPANY'].promo.desc = settings.nav_company_desc;
        if (settings.nav_company_link) dynamicMenus['COMPANY'].promo.link = settings.nav_company_link;
    }

    // 4. Render the Client Component with Data
    return (
        <Navbar
            logoUrl={settings.site_logo}
            siteName={settings.site_name}
            menus={dynamicMenus}
        />
    );
}