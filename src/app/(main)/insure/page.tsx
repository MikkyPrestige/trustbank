import Image from "next/image";
import styles from "./insure.module.css";
import CoverageWizard from "@/components/insure/CoverageWizard";
import { Umbrella, HeartPulse, Home, Car, Activity, ArrowRight, ShieldCheck } from "lucide-react";

const PRODUCTS = [
    {
        title: "Medicare Insurance",
        desc: "Navigate your options with confidence. We help you find the right plan for your health needs.",
        icon: <HeartPulse size={32} className={styles.iconTeal} />
    },
    {
        title: "Auto Insurance",
        desc: "Comprehensive coverage for the road ahead. Get protected against accidents and theft.",
        icon: <Car size={32} className={styles.iconBlue} />
    },
    {
        title: "Home & Renters",
        desc: "Protect your sanctuary. Coverage for structural damage, personal property, and liability.",
        icon: <Home size={32} className={styles.iconOrange} />
    },
    {
        title: "Life Insurance",
        desc: "Secure your family's financial future with Term, Whole, or Universal life options.",
        icon: <Umbrella size={32} className={styles.iconPurple} />
    },
    {
        title: "Accident Protection",
        desc: "Cash benefits paid directly to you for hospital stays or accidental injuries.",
        icon: <Activity size={32} className={styles.iconRed} />
    },
    {
        title: "Business Insurance",
        desc: "Safeguard your hard work with liability, property, and workers' comp solutions.",
        icon: <ShieldCheck size={32} className={styles.iconGold} />
    }
];

export default function InsurePage() {
    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/insure-hero.png"
                    alt="Safe family in storm"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.tealBadge}>Trust Assurance</div>
                    <h1 className={styles.heroTitle}>
                        Prepared for the <br />
                        <span className={styles.highlight}>unexpected.</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Life is unpredictable. Your coverage shouldn&apos;t be.
                        We partner with top-rated carriers to bring you protection that actually pays out when you need it.
                    </p>
                </div>
            </section>

            {/* 2. WIZARD SECTION */}
            <section className={styles.wizardSection}>
                <div className={styles.container}>
                    <CoverageWizard />
                </div>
            </section>

            {/* 3. PRODUCT GRID */}
            <section className={styles.productsSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Coverage Solutions</h2>
                        <p>A full suite of insurance products designed for every stage of life.</p>
                    </div>

                    <div className={styles.grid}>
                        {PRODUCTS.map((p, i) => (
                            <div key={i} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    {p.icon}
                                    <div className={styles.arrowBox}><ArrowRight size={16} /></div>
                                </div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. PARTNER STRIP */}
            <section className={styles.partnerStrip}>
                <div className={styles.container}>
                    <h3>Backed by the world&apos;s strongest carriers</h3>

                    <div className={styles.logos}>
                        {/* 1. Allstate */}
                        <div className={styles.logoItem}>
                            <Image
                                src="/logos/allstate-1.png"
                                alt="Allstate"
                                width={120}
                                height={40}
                                className={styles.logoImg}
                            />
                        </div>

                        {/* 2. Prudential */}
                        <div className={styles.logoItem}>
                            <Image
                                src="/logos/prudential-1.png"
                                alt="Prudential"
                                width={120}
                                height={40}
                                className={styles.logoImg}
                            />
                        </div>

                        {/* 3. MetLife */}
                        <div className={styles.logoItem}>
                            <Image
                                src="/logos/metlife-1.png"
                                alt="MetLife"
                                width={120}
                                height={40}
                                className={styles.logoImg}
                            />
                        </div>

                        {/* 4. Liberty Mutual */}
                        <div className={styles.logoItem}>
                            <Image
                                src="/logos/liberty-1.png"
                                alt="Liberty Mutual"
                                width={120}
                                height={40}
                                className={styles.logoImg}
                            />
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}