import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import Image from "next/image";
import styles from "./payments.module.css";
import TransferEstimator from "@/components/main/payments/TransferEstimator";
import { Zap, CreditCard, ArrowRight, RefreshCw, Building, Mail } from "lucide-react";

export default async function PaymentsPage() {
    const settings = await getSiteSettings();

    const currencies = await db.currency.findMany({
        where: { active: true },
        orderBy: { code: 'asc' }
    });

    const ANCHORS = [
        {
            id: 'bills',
            title: settings.payments_bills_title,
            desc: settings.payments_bills_desc,
            btn: settings.payments_bills_btn,
            img: settings.payments_bills_img,
            alt: settings.payments_bills_alt,
            link: settings.payments_bills_link
        },
        {
            id: 'p2p',
            title: settings.payments_p2p_title,
            desc: settings.payments_p2p_desc,
            btn: settings.payments_p2p_btn,
            img: settings.payments_p2p_img,
            alt: settings.payments_p2p_alt,
            link: settings.payments_p2p_link
        },
        {
            id: 'wires',
            title: settings.payments_wires_title,
            desc: settings.payments_wires_desc,
            btn: settings.payments_wires_btn,
            img: settings.payments_wires_img,
            alt: settings.payments_wires_alt,
            link: settings.payments_wires_link
        },
    ];

    // Supplemental Grid
    const SUPPLEMENTAL = [
        {
            title: settings.payments_supp1_title,
            desc: settings.payments_supp1_desc,
            link: settings.payments_supp1_link,
            icon: < RefreshCw size={32} className={styles.iconNeon} />
        },
        {
            title: settings.payments_supp2_title,
            desc: settings.payments_supp2_desc,
            link: settings.payments_supp2_link,
            icon: <CreditCard size={32} className={styles.iconNeon} />
        },
    ];

    return (
        <main className={styles.main}>
            {/* 1. HERO & WIDGET */}
            <section className={styles.heroBackground}>
                <Image
                    src={settings.payments_hero_img}
                    alt={settings.payments_hero_alt}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.neonBadge}><Zap size={14} /> {settings.payments_hero_badge}</div>
                    <h1 className={styles.heroTitle}>
                        {settings.payments_hero_title} <br />
                        <span className={styles.highlight}>{settings.payments_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>{settings.payments_hero_desc}</p>
                </div>

                <div className={styles.heroWidget}>
                    <TransferEstimator settings={settings} currencies={currencies} />
                </div>
            </section>

            {/* 2. ANCHOR SECTIONS  */}
            {ANCHORS.map((p, i) => (
                <section key={p.id} id={p.id} className={`${styles.productSection} ${i % 2 !== 0 ? styles.bgAlt : ''}`}>
                    <div className={styles.container}>
                        <div className={`${styles.productGrid} ${i % 2 !== 0 ? styles.reverseGrid : ''}`}>
                            <div className={styles.productContent}>
                                <h2 className={styles.productTitle}>{p.title}</h2>
                                <p className={styles.productDesc}>{p.desc}</p>
                                <a href={p.link} className={styles.productBtn}>
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

            {/* 3. SUPPLEMENTAL GRID */}
            <section id="manage" className={styles.suppSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.payments_supp_title}</h2>
                        <p>{settings.payments_supp_desc}</p>
                    </div>
                    <div className={styles.grid}>
                        {SUPPLEMENTAL.map((p, i) => (
                            <div key={i} className={styles.card}>
                                <div className={styles.cardHeader}>{p.icon}</div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                                <a href={p.link} className={styles.cardLink}>{settings.payments_supp_linkText} <ArrowRight size={16} /></a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. UTILITY STRIP */}
            <section className={styles.utilityStrip}>
                <div className={styles.container}>
                    <div className={styles.utilityRow}>
                        {/* Item 1 */}
                        <div className={styles.utilityItem}>
                            <Mail size={24} className={styles.utilIcon} />
                            <div>
                                <h4>{settings.payments_util1_title}</h4>
                                <p>{settings.payments_util1_desc}</p>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className={styles.utilityItem}>
                            <Building size={24} className={styles.utilIcon} />
                            <div>
                                <h4>{settings.payments_util2_title}</h4>
                                <p>{settings.payments_util2_desc}</p>
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className={styles.utilityItem}>
                            <CreditCard size={24} className={styles.utilIcon} />
                            <div>
                                <h4>{settings.payments_util3_title}</h4>
                                <p>{settings.payments_util3_desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}