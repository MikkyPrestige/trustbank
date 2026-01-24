import { getSiteSettings } from "@/lib/get-settings";
import Image from "next/image";
import Link from "next/link";
import styles from "./insure.module.css";
import CoverageWizard from "@/components/main/insure/CoverageWizard";
import { Umbrella, HeartPulse, Home, Car, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Insurance Coverage | TrustBank",
    description: "Find the right coverage for your life, home, and business.",
};

const PRODUCTS = [
    {
        title: "Medicare Insurance",
        desc: "Navigate your options with confidence. We help you find the right plan.",
        icon: <HeartPulse size={32} className={styles.iconTeal} />,
        href: "/insure#medicare"
    },
    {
        title: "Auto Insurance",
        desc: "Comprehensive coverage for the road ahead. Get protected against accidents.",
        icon: <Car size={32} className={styles.iconBlue} />,
        href: "/insure#auto"
    },
    {
        title: "Home & Renters",
        desc: "Protect your sanctuary. Coverage for structural damage and property.",
        icon: <Home size={32} className={styles.iconOrange} />,
        href: "/insure#home"
    },
    {
        title: "Life Insurance",
        desc: "Secure your family's financial future with Term or Whole life options.",
        icon: <Umbrella size={32} className={styles.iconPurple} />,
        href: "/insure#life"
    },
    {
        title: "Accident Protection",
        desc: "Cash benefits paid directly to you for hospital stays or injuries.",
        icon: <Activity size={32} className={styles.iconRed} />,
        href: "/insure#accident"
    },
    {
        title: "Business Insurance",
        desc: "Safeguard your hard work with liability and workers' comp solutions.",
        icon: <ShieldCheck size={32} className={styles.iconGold} />,
        href: "/insure#business"
    }
];

// 3. IMPROVEMENT: Data-driven Partner logos
const PARTNERS = [
    { name: "Allstate", src: "/logos/allstate-1.png" },
    { name: "Prudential", src: "/logos/prudential-1.png" },
    { name: "MetLife", src: "/logos/metlife-1.png" },
    { name: "Liberty Mutual", src: "/logos/liberty-1.png" },
];

export default async function InsurePage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>

            {/* HERO SECTION */}
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
                        {settings.insure_hero_title} <br />
                        <span className={styles.highlight}>{settings.insure_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.insure_hero_desc}
                    </p>
                </div>
            </section>

            {/* WIZARD SECTION */}
            <section className={styles.wizardSection}>
                <div className={styles.container}>
                    <CoverageWizard />
                </div>
            </section>

            {/* PRODUCT GRID */}
            <section className={styles.productsSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.insure_products_title}</h2>
                        <p>{settings.insure_products_desc}</p>
                    </div>

                    <div className={styles.grid}>
                        {PRODUCTS.map((p, i) => (
                            <Link key={i} href={p.href} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    {p.icon}
                                    <div className={styles.arrowBox}><ArrowRight size={16} /></div>
                                </div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* PARTNER STRIP */}
            <section className={styles.partnerStrip}>
                <div className={styles.container}>
                    <h3>{settings.insure_partners_title}</h3>

                    <div className={styles.logos}>
                        {PARTNERS.map((partner) => (
                            <div key={partner.name} className={styles.logoItem}>
                                <Image
                                    src={partner.src}
                                    alt={`${partner.name} logo`}
                                    width={120}
                                    height={40}
                                    className={styles.logoImg}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </main>
    );
}