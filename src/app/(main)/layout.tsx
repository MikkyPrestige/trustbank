import { getSiteSettings } from "@/lib/content/get-settings";
import SiteHeader from "@/components/layout/header/SiteHeader";
import Footer from "@/components/layout/footer/Footer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();
    return (
        <>
            <SiteHeader />
            <main>
                {children}
            </main>
            <Footer settings={settings} />
        </>
    );
}