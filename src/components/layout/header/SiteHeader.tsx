import { getSiteSettings } from "@/lib/get-settings";
import { MEGA_MENUS } from "@/lib/navbar.data"; // Import default structure
import Navbar from "./Navbar";

export default async function SiteHeader() {
    // 1. Fetch CMS Settings
    const settings = await getSiteSettings();

    // 2. Clone the default menu so we don't mutate the original
    const dynamicMenus = JSON.parse(JSON.stringify(MEGA_MENUS));

    // 3. Apply Overrides from CMS (if they exist)

    // Banking Menu Promo
    if (settings.nav_bank_title) dynamicMenus['BANK'].promo.title = settings.nav_bank_title;
    if (settings.nav_bank_desc) dynamicMenus['BANK'].promo.desc = settings.nav_bank_desc;

    // Wealth Menu Promo
    if (settings.nav_wealth_title) dynamicMenus['WEALTH'].promo.title = settings.nav_wealth_title;
    if (settings.nav_wealth_desc) dynamicMenus['WEALTH'].promo.desc = settings.nav_wealth_desc;

    // 4. Render the Client Component with Data
    return (
        <Navbar
            logoUrl={settings.site_logo}
            siteName={settings.site_name}
            menus={dynamicMenus}
        />
    );
}