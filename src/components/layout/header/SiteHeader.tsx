import { MEGA_MENUS } from "@/lib/utils/constants";
import { auth } from "@/auth";
import Navbar from "./Navbar";


export default async function SiteHeader({ settings }: { settings: any }) {
    const session = await auth();

    // Initialize Menus
    let dynamicMenus;
    try {
        dynamicMenus = settings.nav_structure_json?.trim()
            ? JSON.parse(settings.nav_structure_json)
            : JSON.parse(JSON.stringify(MEGA_MENUS));
    } catch (error) {
        console.error("Nav JSON parse failed:", error);
        dynamicMenus = JSON.parse(JSON.stringify(MEGA_MENUS));
    }

    // Map CMS keys to Menu keys
    const menuKeys = [
        { key: 'BANK', prefix: 'nav_bank' },
        { key: 'BORROW', prefix: 'nav_borrow' },
        { key: 'WEALTH', prefix: 'nav_wealth' },
        { key: 'INSURE', prefix: 'nav_insure' },
        { key: 'RESOURCES', prefix: 'nav_learn' },
    ];

    menuKeys.forEach(({ key, prefix }) => {
        const menu = dynamicMenus[key];
        if (menu?.promo) {
            if (settings[`${prefix}_title`]) menu.promo.title = settings[`${prefix}_title`];
            if (settings[`${prefix}_desc`]) menu.promo.desc = settings[`${prefix}_desc`];
            if (settings[`${prefix}_link`]) menu.promo.link = settings[`${prefix}_link`];
        }
    });

    return (
        <Navbar
            settings={settings}
            menus={dynamicMenus}
            user={session?.user}
            // topNav={[
            //     { label: settings.nav_rates_label, href: settings.nav_rates_link },
            //     { label: settings.nav_locations_label, href: settings.nav_locations_link }
            // ]}
        />
    );
}