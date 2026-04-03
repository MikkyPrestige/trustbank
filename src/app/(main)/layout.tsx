import { getSiteSettings } from "@/lib/content/get-settings";
import { db } from "@/lib/db";
import SiteHeader from "@/components/layout/header/SiteHeader";
import Footer from "@/components/layout/footer/Footer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();

    const footerLinks = await db.footerLink.findMany({
        orderBy: { order: "asc" },
    });
    return (
        <>
            <SiteHeader settings={settings} />
            <main>
                {children}
            </main>
            <Footer settings={settings} links={footerLinks} />
        </>
    );
}