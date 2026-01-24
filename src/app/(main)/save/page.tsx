import { getSiteSettings } from "@/lib/get-settings";
import Image from "next/image";
import styles from "./save.module.css";
import SavingsCalculator from "@/components/main/save/SavingsCalculator";
import { ShieldCheck, ArrowRight, TrendingUp, PiggyBank, Lock, Award, Star, Briefcase, Sun } from "lucide-react";

export default async function SavePage() {
    const settings = await getSiteSettings();

    // Dynamic Product List
    const PRODUCTS = [
        {
            title: "High Yield Savings",
            apy: `${settings.rate_hysa_apy}% APY`,
            desc: "Make your money work harder. No monthly fees and daily compounding interest.",
            icon: <TrendingUp size={32} className={styles.iconGreen} />,
            link: "Start Saving"
        },
        {
            title: "Trust Certificates (CDs)",
            apy: `${settings.rate_cd_apy}% APY`,
            desc: "Lock in a guaranteed rate for a fixed term. Perfect for risk-free growth.",
            icon: <Award size={32} className={styles.iconGold} />,
            link: "View Rates"
        },
        {
            title: "Money Market",
            apy: `${settings.rate_mma_apy}% APY`,
            desc: "Higher rates with check-writing privileges. Flexibility meets growth.",
            icon: <PiggyBank size={32} className={styles.iconBlue} />,
            link: "Open Account"
        },
        {
            title: "Trust Kids Club",
            apy: `${settings.rate_kids_apy}% APY`,
            desc: "Teach the next generation financial literacy with a dedicated custodial account.",
            icon: <Star size={32} className={styles.iconPurple} />,
            link: "Learn More"
        },
        // NEW CARD 1
        {
            title: "Business Savings",
            apy: `${settings.rate_business_apy || "2.50"}% APY`,
            desc: "Keep your operating cash growing while maintaining full liquidity for payroll.",
            icon: <Briefcase size={32} className={styles.iconTeal} />,
            link: "Business Info"
        },
        // NEW CARD 2
        {
            title: "Retirement IRA",
            apy: `~${settings.rate_ira_apy || "7.00"}% Rtrn`,
            desc: "Tax-advantaged accounts to secure your future. Traditional and Roth options available.",
            icon: <Sun size={32} className={styles.iconOrange} />,
            link: "Plan Retirement"
        }
    ];

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/save-hero.png"
                    alt="Grandfather planting tree with granddaughter"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.pillBadge}><ShieldCheck size={16} /> FDIC Insured</div>
                    <h1 className={styles.heroTitle}>
                        {settings.save_hero_title} <br />
                        <span className={styles.highlight}>{settings.save_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.save_hero_desc}
                    </p>
                </div>
            </section>

            {/* 2. CALCULATOR SECTION */}
            <section className={styles.calcSection}>
                <div className={styles.container}>
                    <SavingsCalculator defaultApy={Number(settings.rate_hysa_apy)} />
                </div>
            </section>

            {/* 3. PRODUCT GRID */}
            <section className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Savings Solutions</h2>
                        <p>Choose the account that fits your financial timeline.</p>
                    </div>

                    <div className={styles.grid}>
                        {PRODUCTS.map((p, i) => (
                            <div key={i} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    {p.icon}
                                    <span className={styles.apyBadge}>{p.apy}</span>
                                </div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                                <button className={styles.cardBtn}>
                                    {p.link} <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY TRUST? */}
            <section className={styles.trustStrip}>
                <div className={styles.container}>
                    <div className={styles.trustContent}>
                        <div className={styles.trustText}>
                            <h2>Your money is safe with us.</h2>
                            <p>We use military-grade encryption and are fully FDIC insured up to $250,000 per depositor.</p>
                        </div>
                        <div className={styles.trustIcons}>
                            <div className={styles.trustBadge}>
                                <Lock size={24} /> 256-bit Encryption
                            </div>
                            <div className={styles.trustBadge}>
                                <ShieldCheck size={24} /> Fraud Monitoring
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}