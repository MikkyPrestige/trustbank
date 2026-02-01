import { getSiteSettings } from "@/lib/content/get-settings";
import Image from "next/image";
import styles from "./insure.module.css";
import CoverageWizard from "@/components/main/insure/CoverageWizard";
import { Activity, ShieldCheck, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Insurance Coverage | TrustBank",
    description: "Find the right coverage for your life, home, and business.",
};

export default async function InsurePage() {
    const settings = await getSiteSettings();

    // The "Big 4" Anchors (Zig-Zag)
    const ANCHORS = [
        {
            id: 'medicare',
            title: settings.insure_prod1_title,
            desc: settings.insure_prod1_desc,
            btn: settings.insure_prod1_btn,
            img: settings.insure_prod1_img || "/insure-medicare.png",
            alt: settings.insure_prod1_img_alt
        },
        {
            id: 'auto',
            title: settings.insure_prod2_title,
            desc: settings.insure_prod2_desc,
            btn: settings.insure_prod2_btn,
            img: settings.insure_prod2_img || "/insure-auto.png",
            alt: settings.insure_prod2_img_alt
        },
        {
            id: 'home',
            title: settings.insure_prod3_title,
            desc: settings.insure_prod3_desc,
            btn: settings.insure_prod3_btn,
            img: settings.insure_prod3_img || "/insure-home.png",
            alt: settings.insure_prod3_img_alt
        },
        {
            id: 'life',
            title: settings.insure_prod4_title,
            desc: settings.insure_prod4_desc,
            btn: settings.insure_prod4_btn,
            img: settings.insure_prod4_img || "/insure-life.png",
            alt: settings.insure_prod4_img_alt
        },
    ];

    // The Supplemental Grid
    const SUPPLEMENTAL = [
        {
            title: settings.insure_prod5_title,
            desc: settings.insure_prod5_desc,
            icon: <Activity size={32} className={styles.iconRed} />
        },
        {
            id: 'business',
            title: settings.insure_prod6_title,
            desc: settings.insure_prod6_desc,
            icon: <ShieldCheck size={32} className={styles.iconGold} />
        },
    ];

    // Partners
    const PARTNERS = [
        { src: settings.insure_partner1_img || "/logos/allstate-1.png" },
        { src: settings.insure_partner2_img || "/logos/prudential-1.png" },
        { src: settings.insure_partner3_img || "/logos/metlife-1.png" },
        { src: settings.insure_partner4_img || "/logos/liberty-1.png" },
    ];

    return (
        <main className={styles.main}>

            {/* HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src={settings.insure_hero_img || "/insure-hero.png"}
                    alt={settings.insure_hero_alt || "Insurance Protection"}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.tealBadge}>{settings.insure_hero_badge}</div>
                    <h1 className={styles.heroTitle}>
                        {settings.insure_hero_title} <br />
                        <span className={styles.highlight}>{settings.insure_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.insure_hero_desc}
                    </p>
                </div>
            </section>

            {/* WIZARD */}
            <section className={styles.wizardSection}>
                <div className={styles.container}>
                    <CoverageWizard settings={settings} />
                </div>
            </section>

            {/* ANCHOR SECTIONS */}
            {ANCHORS.map((p, i) => (
                <section key={p.id} id={p.id} className={`${styles.productSection} ${i % 2 !== 0 ? styles.bgAlt : ''}`}>
                    <div className={styles.container}>
                        <div className={`${styles.productGrid} ${i % 2 !== 0 ? styles.reverseGrid : ''}`}>
                            <div className={styles.productContent}>
                                <h2 className={styles.productTitle}>{p.title}</h2>
                                <p className={styles.productDesc}>{p.desc}</p>
                                <a href="#" className={styles.productBtn}>
                                    {p.btn} <ArrowRight size={18} />
                                </a>
                            </div>
                            <div className={styles.productImageWrapper}>
                                <Image src={p.img} alt={p.alt} fill className={styles.productImage} />
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* SUPPLEMENTAL GRID */}
            <section id="supplemental" className={styles.suppSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.insure_supp_title}</h2>
                        <p>{settings.insure_supp_desc}</p>
                    </div>
                    <div className={styles.grid}>
                        {SUPPLEMENTAL.map((p, i) => (
                            <div key={i} id={p.id} className={styles.card}>
                                <div className={styles.cardHeader}>{p.icon}</div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                                <a href="#" className={styles.cardLink}>Learn More <ArrowRight size={16} /></a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PARTNER STRIP */}
            <section className={styles.partnerStrip}>
                <div className={styles.container}>
                    <h3>{settings.insure_partners_title}</h3>

                    <div className={styles.logos}>
                        {PARTNERS.map((partner, i) => (
                            <div key={i} className={styles.logoItem}>
                                <Image
                                    src={partner.src}
                                    alt="Insurance Partner"
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