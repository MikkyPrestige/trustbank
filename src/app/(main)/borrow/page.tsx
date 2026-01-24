import { getSiteSettings } from "@/lib/get-settings";
import LoanCalculator from '@/components/main/borrow/LoanCalculator';
import { CreditCard, Home, Car, GraduationCap, ArrowRight, ShieldCheck, Zap, Percent } from 'lucide-react';
import Image from 'next/image';
import styles from './borrow.module.css';

export default async function BorrowPage() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    const LOAN_PRODUCTS = [
        {
            title: "Personal Loans",
            desc: "Consolidate debt or fund a major purchase with fixed rates and no hidden fees.",
            icon: <Zap size={32} className={styles.iconYellow} />,
            rate: `From ${settings.rate_personal_apr}% APR` // Dynamic
        },
        {
            title: "Mortgages",
            desc: "Buy your dream home with our flexible 15 and 30-year fixed rate options.",
            icon: <Home size={32} className={styles.iconBlue} />,
            rate: settings.rate_mortgage_label // Dynamic Text
        },
        {
            title: "Auto Loans",
            desc: "New or used, hit the road faster with approvals in as little as 60 seconds.",
            icon: <Car size={32} className={styles.iconGreen} />,
            rate: `From ${settings.rate_auto_apr}% APR` // Dynamic
        },
        {
            title: "Student Loans",
            desc: "Invest in your future. Competitive rates for undergraduate and graduate studies.",
            icon: <GraduationCap size={32} className={styles.iconPurple} />,
            rate: settings.rate_student_label // Dynamic Text
        },
        {
            title: "Credit Cards",
            desc: `Earn 3% cash back on all dining and travel with the ${settings.site_name} Titanium Card.`,
            icon: <CreditCard size={32} className={styles.iconRed} />,
            rate: `${settings.rate_credit_intro_apr}% Intro APR` // Dynamic
        },
        {
            title: "Home Equity",
            desc: "Unlock the value of your home for renovations or big life events.",
            icon: <Percent size={32} className={styles.iconOrange} />,
            rate: settings.rate_home_equity_label // Dynamic Text
        }
    ];

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/loan-human.png"
                    alt="Couple with new home keys"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContentCentered}>
                    <h1 className={styles.heroTitle}>
                        {settings.borrow_hero_title} <br />
                        <span className={styles.highlight}>{settings.borrow_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.borrow_hero_desc}
                    </p>

                    <div className={styles.heroStatsRow}>
                        <div className={styles.statPill}>
                            <strong>{settings.borrow_stat_funded}</strong> Funded
                        </div>
                        <div className={styles.statPill}>
                            <strong>{settings.borrow_stat_speed}</strong> Speed
                        </div>
                        <div className={styles.statPill}>
                            <strong>{settings.borrow_stat_approval}</strong> Approval
                        </div>
                    </div>
                </div>
            </section>
            <div className={styles.statDivider}></div>

            {/* 2. CALCULATOR SECTION */}
            <section className={styles.calcSection}>
                <div className={styles.container}>
                    {/* Pass the default APR to the calculator */}
                    <LoanCalculator defaultRate={Number(settings.rate_personal_apr)} />
                </div>
            </section>

            {/* 3. PRODUCT GRID */}
            <section className={styles.productsSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Lending Solutions</h2>
                        <p>Choose the product that fits your life stage.</p>
                    </div>

                    <div className={styles.productGrid}>
                        {LOAN_PRODUCTS.map((product, i) => (
                            <div key={i} className={styles.productCard}>
                                <div className={styles.cardHeader}>
                                    {product.icon}
                                    <span className={styles.rateBadge}>{product.rate}</span>
                                </div>
                                <h3>{product.title}</h3>
                                <p>{product.desc}</p>
                                <a href="#" className={styles.cardLink}>
                                    Check Rates <ArrowRight size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY TRUST BANK STRIP */}
            <section className={styles.trustStrip}>
                <div className={styles.container}>
                    <div className={styles.trustGrid}>
                        <div className={styles.trustItem}>
                            <ShieldCheck size={40} className={styles.iconBlue} />
                            <div>
                                <h4>Payment Protection</h4>
                                <p>We safeguard you and your family with Borrower Security.</p>
                            </div>
                        </div>
                        <div className={styles.trustItem}>
                            <Zap size={40} className={styles.iconYellow} />
                            <div>
                                <h4>Instant Decisions</h4>
                                <p>Apply online and get a decision in under 60 seconds.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}