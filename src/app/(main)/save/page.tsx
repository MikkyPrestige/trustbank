import { getSiteSettings } from "@/lib/content/get-settings";
import Image from "next/image";
import styles from "./save.module.css";
import SavingsCalculator from "@/components/main/save/SavingsCalculator";
import { ShieldCheck, ArrowRight, TrendingUp, Briefcase, Sun, Lock } from "lucide-react";

export default async function SavePage() {
    const settings = await getSiteSettings();

    const GRID_PRODUCTS = [
        {
            title: settings.save_prod1_title, // HYSA
            apy: `${settings.rate_hysa_apy}% APY`,
            desc: settings.save_prod1_desc,
            link: settings.save_prod1_link,
            anchorLink: settings.save_prod1_anchorLink,
            icon: <TrendingUp size={32} className={styles.iconGreen} />
        },
        {
            title: settings.save_prod2_title, // Business
            apy: `${settings.rate_business_apy}% APY`,
            desc: settings.save_prod2_desc,
            link: settings.save_prod2_link,
            anchorLink: settings.save_prod2_anchorLink,
            icon: <Briefcase size={32} className={styles.iconTeal} />
        },
        {
            title: settings.save_prod3_title, // Retirement
            apy: `~${settings.rate_ira_apy}% Rtrn`,
            desc: settings.save_prod3_desc,
            link: settings.save_prod3_link,
            anchorLink: settings.save_prod3_anchorLink,
            icon: <Sun size={32} className={styles.iconOrange} />
        }
    ];

    return (
        <main className={styles.main}>
            {/* 1. HERO */}
            <section className={styles.heroBackground}>
                <Image
                    src={settings.save_hero_img}
                    alt={settings.save_hero_alt}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.pillBadge}><ShieldCheck size={16} /> {settings.save_fdic_badge}</div>
                    <h1 className={styles.heroTitle}>
                        {settings.save_hero_title} <br />
                        <span className={styles.highlight}>{settings.save_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>{settings.save_hero_desc}</p>
                </div>
            </section>

            {/* 2. CALCULATOR */}
            <section className={styles.calcSection}>
                <div className={styles.container}>
                    <SavingsCalculator settings={settings} />
                </div>
            </section>

            {/* 3. CDS SECTION */}
            <section id="cds" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.productGrid}>
                        <div className={styles.productImageWrapper}>
                            <Image src={settings.save_cds_img} alt={settings.save_cds_img_alt} fill className={styles.productImage} />
                        </div>
                        <div className={styles.productContent}>
                            <span className={styles.apyDisplay}>Up to {settings.rate_cd_apy}{settings.rate_cd_apy_percent}</span>
                            <h2 className={styles.productTitle}>{settings.save_cds_title}</h2>
                            <p className={styles.productDesc}>{settings.save_cds_desc}</p>
                            <a href={settings.save_cds_link} className={styles.productBtn}>
                                {settings.save_cds_btn} <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. MMA SECTION (#mma) */}
            <section id="mma" className={`${styles.productSection} ${styles.bgAlt}`}>
                <div className={styles.container}>
                    <div className={`${styles.productGrid} ${styles.reverseGrid}`}>
                        <div className={styles.productContent}>
                            <span className={styles.apyDisplay}>Up to {settings.rate_mma_apy}{settings.rate_cd_apy_percent}</span>
                            <h2 className={styles.productTitle}>{settings.save_mma_title}</h2>
                            <p className={styles.productDesc}>{settings.save_mma_desc}</p>
                            <a href={settings.save_mma_link} className={styles.productBtn}>
                                {settings.save_mma_btn} <ArrowRight size={18} />
                            </a>
                        </div>
                        <div className={styles.productImageWrapper}>
                            <Image src={settings.save_mma_img} alt={settings.save_mma_img_alt} fill className={styles.productImage} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. KIDS CLUB SECTION (#kids) */}
            <section id="kids" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.productGrid}>
                        <div className={styles.productImageWrapper}>
                            <Image src={settings.save_kids_img} alt={settings.save_kids_img_alt} fill className={styles.productImage} />
                        </div>
                        <div className={styles.productContent}>
                            <span className={styles.apyDisplay}>{settings.rate_kids_apy}{settings.rate_cd_apy_percent}</span>
                            <h2 className={styles.productTitle}>{settings.save_kids_title}</h2>
                            <p className={styles.productDesc}>{settings.save_kids_desc}</p>
                            <a href={settings.save_kids_link} className={styles.productBtn}>
                                {settings.save_kids_btn} <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. MORE PRODUCTS GRID  */}
            <section className={styles.suppSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.save_prod_title}</h2>
                        <p>{settings.save_prod_subtitle}</p>
                    </div>

                    <div className={styles.grid}>
                        {GRID_PRODUCTS.map((p, i) => (
                            <div key={i} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    {p.icon}
                                    <span className={styles.apyBadge}>{p.apy}</span>
                                </div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                                <a href={p.anchorLink} className={styles.cardBtn}>
                                    {p.link} <ArrowRight size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. TRUST SECTION */}
            <section className={styles.trustStrip}>
                <div className={styles.container}>
                    <div className={styles.trustContent}>
                        <div className={styles.trustText}>
                            <h2>{settings.save_trust_title}</h2>
                            <p>{settings.save_trust_desc}</p>
                        </div>
                        <div className={styles.trustIcons}>
                            <div className={styles.trustBadge}>
                                <Lock size={24} /> {settings.save_trust_badge_1}
                            </div>
                            <div className={styles.trustBadge}>
                                <ShieldCheck size={24} /> {settings.save_trust_badge_2}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}