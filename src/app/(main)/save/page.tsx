import Image from "next/image";
import styles from "./save.module.css";
import SavingsCalculator from "@/components/main/save/SavingsCalculator";
import { ShieldCheck, ArrowRight, TrendingUp, PiggyBank, Lock, Award, Star } from "lucide-react";

const PRODUCTS = [
    {
        title: "High Yield Savings",
        apy: "4.50% APY",
        desc: "Make your money work harder. No monthly fees and daily compounding interest.",
        icon: <TrendingUp size={32} className={styles.iconGreen} />,
        link: "Start Saving"
    },
    {
        title: "Trust Certificates (CDs)",
        apy: "5.10% APY",
        desc: "Lock in a guaranteed rate for a fixed term. Perfect for risk-free growth.",
        icon: <Award size={32} className={styles.iconGold} />,
        link: "View Rates"
    },
    {
        title: "Money Market",
        apy: "4.25% APY",
        desc: "Higher rates with check-writing privileges. Flexibility meets growth.",
        icon: <PiggyBank size={32} className={styles.iconBlue} />,
        link: "Open Account"
    },
    {
        title: "Trust Kids Club",
        apy: "3.00% APY",
        desc: "Teach the next generation financial literacy with a dedicated custodial account.",
        icon: <Star size={32} className={styles.iconPurple} />,
        link: "Learn More"
    }
];

export default function SavePage() {
    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION (Background Image) */}
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
                        Grow your wealth with <br />
                        <span className={styles.highlight}>unshakable security.</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Whether you are saving for a rainy day, a dream vacation, or your
                        family’s future—TrustBank gives you industry-leading rates to get there faster.
                    </p>
                </div>
            </section>

            {/* 2. CALCULATOR SECTION */}
            <section className={styles.calcSection}>
                <div className={styles.container}>
                    <SavingsCalculator />
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

            {/* 4. WHY TRUST? (Security Focus) */}
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