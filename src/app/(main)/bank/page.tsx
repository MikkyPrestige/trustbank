import { getSiteSettings } from "@/lib/get-settings";
import Image from "next/image";
import styles from "./bank.module.css";
import DebitCard3D from "@/components/main/bank/DebitCard3D";
import { Zap, Smartphone, Globe, Check, X } from "lucide-react";

export default async function BankPage() {
    // 1. Fetch Dynamic Content
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/bank-hero.png"
                    alt="Paying with TrustBank Card"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {settings.bank_hero_title_1} <br />
                        <span className={styles.highlight}>{settings.bank_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.bank_hero_desc}
                    </p>
                    <div className={styles.heroActions}>
                        <button className={styles.primaryBtn}>Open Account</button>
                        <button className={styles.secondaryBtn}>View Features</button>
                    </div>
                </div>
            </section>

            {/* 2. CARD SHOWCASE SECTION */}
            <section className={styles.cardSection}>
                <div className={styles.container}>
                    <div className={styles.cardGrid}>
                        <div className={styles.cardText}>
                            <div className={styles.badge}>{settings.bank_card_badge}</div>
                            <h2>{settings.bank_card_title}</h2>
                            <p>{settings.bank_card_desc}</p>

                            <ul className={styles.featureList}>
                                <li><Check size={20} className={styles.check} /> Contactless & Chip Enabled</li>
                                <li><Check size={20} className={styles.check} /> Instant Lock/Unlock in App</li>
                                <li><Check size={20} className={styles.check} /> Zero Foreign Transaction Fees</li>
                            </ul>
                        </div>
                        <div className={styles.cardVisual}>
                            <DebitCard3D bankName={settings.site_name} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FEATURES GRID */}
            <section className={styles.featureSection}>
                <div className={styles.container}>
                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <div className={styles.iconBox}><Zap size={28} /></div>
                            <h3>{settings.bank_feat_1_title}</h3>
                            <p>{settings.bank_feat_1_desc}</p>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.iconBox}><Smartphone size={28} /></div>
                            <h3>{settings.bank_feat_2_title}</h3>
                            <p>{settings.bank_feat_2_desc}</p>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.iconBox}><Globe size={28} /></div>
                            <h3>{settings.bank_feat_3_title}</h3>
                            <p>{settings.bank_feat_3_desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. COMPARISON TABLE */}
            <section className={styles.compareSection}>
                <div className={styles.container}>
                    <div className={styles.compareHeader}>
                        <h2>{settings.bank_compare_title}</h2>
                        <p>{settings.bank_compare_desc}</p>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.compareTable}>
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th className={styles.thTrust}>{settings.site_name}</th>
                                    <th>Traditional Banks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Monthly Maintenance Fee</td>
                                    <td className={styles.tdTrust}>$0</td>
                                    <td>$12 - $25</td>
                                </tr>
                                <tr>
                                    <td>Overdraft Fees</td>
                                    <td className={styles.tdTrust}>$0</td>
                                    <td>$35 per item</td>
                                </tr>
                                <tr>
                                    <td>Foreign Transaction Fees</td>
                                    <td className={styles.tdTrust}>0%</td>
                                    <td>3%</td>
                                </tr>
                                <tr>
                                    <td>Minimum Balance</td>
                                    <td className={styles.tdTrust}>$0</td>
                                    <td>$1,500</td>
                                </tr>
                                <tr>
                                    <td>Early Direct Deposit</td>
                                    <td className={styles.tdTrust}><Check size={20} /></td>
                                    <td><X size={20} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

        </main>
    );
}