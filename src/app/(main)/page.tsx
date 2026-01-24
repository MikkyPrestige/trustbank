import { getSiteSettings } from "@/lib/get-settings";
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
                title={settings.hero_title}
                subtitle={settings.hero_subtitle}
                ctaText={settings.hero_cta_text}
            />
            <InfoBar
                isActive={settings.announcement_active === 'true'}
                text={settings.announcement_text}
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