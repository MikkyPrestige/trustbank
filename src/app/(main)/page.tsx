import styles from "../../components/home/home.module.css";
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

export default function Home() {
    return (
        <main className={styles.main}>
            <Hero />
            <InfoBar />
            <RatesGrid />
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