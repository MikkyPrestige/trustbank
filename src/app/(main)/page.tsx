import { getSiteSettings } from "@/lib/content/get-settings";
import Hero from "@/components/home/Hero";
import InfoBar from "@/components/home/InfoBar";
import RatesGrid from "@/components/home/RatesGrid";
import CardShowcase from "@/components/home/CardShowcase";
import FinancialGuidance from "@/components/home/FinancialGuidance";
import LoanSection from "@/components/home/LoanSection";
import InvestmentSection from "@/components/home/InvestmentSection";
import GlobalReach from "@/components/home/GlobalReach";
import PartnerStrip from "@/components/home/PartnerStrip";
import FinalCTA from "@/components/home/FinalCTA";
import styles from "../../components/home/home.module.css";

export default async function Home() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <Hero
                siteName={settings.site_name}
                badgeText={settings.hero_badge}
                imgSrc={settings.home_hero_img}
                imgAlt={settings.home_hero_alt}
                title={settings.hero_title}
                subtitle={settings.hero_subtitle}
                ctaLink={settings.hero_cta_link}
                ctaText={settings.hero_cta_text}
                cta1Text={settings.hero_cta1_text}
                cta1Link={settings.hero_cta1_link}
            />
            <InfoBar
                isActive={settings.announcement_active === 'true'}
                text={settings.announcement_text}
                phone={settings.announcement_contact_phone}
                routingNumber={settings.routingNumber}
                swiftCode={settings.swiftCode}
                labelSupport={settings.home_support_label}
                labelHours={settings.home_hours_label}
                labelBanking={settings.home_banking_label}
                labelRouting={settings.home_routing_label}
                labelSwift={settings.home_swift_label}
                locationLinkText={settings.home_location_link_text}
                locationLinkUrl={settings.home_location_link_url}
            />
            <RatesGrid settings={settings} />
            <CardShowcase />
            <FinancialGuidance />
            <LoanSection />
            <InvestmentSection />
            <GlobalReach />
            <PartnerStrip />
            <FinalCTA />
        </main>
    );
}