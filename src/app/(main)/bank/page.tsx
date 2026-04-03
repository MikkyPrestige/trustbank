import { getSiteSettings } from "@/lib/content/get-settings";
import Image from "next/image";
import styles from "./bank.module.css";
import DebitCard3D from "@/components/main/bank/DebitCard3D";
import { Zap, Smartphone, Globe, Check, X, ArrowRight } from "lucide-react";

export default async function BankPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <section className={styles.heroBackground}>
                <Image
                    src={settings.bank_hero_img}
                    alt={settings.bank_hero_alt}
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
                        <button className={styles.primaryBtn}>{settings.bank_hero_btn_primary}</button>
                        <button className={styles.secondaryBtn}>{settings.bank_hero_btn_secondary}</button>
                    </div>
                </div>
            </section>

            <section className={styles.cardSection}>
                <div className={styles.container}>
                    <div className={styles.cardGrid}>
                        <div className={styles.cardText}>
                            <div className={styles.badge}>{settings.bank_card_badge}</div>
                            <h2>{settings.bank_card_title}</h2>
                            <p>{settings.bank_card_desc}</p>
                            <ul className={styles.featureList}>
                                <li><Check size={20} className={styles.check} /> {settings.bank_card_feat_1}</li>
                                <li><Check size={20} className={styles.check} /> {settings.bank_card_feat_2}</li>
                                <li><Check size={20} className={styles.check} /> {settings.bank_card_feat_3}</li>
                            </ul>
                        </div>
                        <div className={styles.cardVisual}>
                            <DebitCard3D settings={settings} />
                        </div>
                    </div>
                </div>
            </section>

            <section id="cs" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.productGrid}>
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={settings.bank_cs_img}
                                alt={settings.bank_cs_img_alt}
                                fill
                                className={styles.productImage}
                            />
                        </div>
                        <div className={styles.productContent}>
                            <h2 className={styles.productTitle}>{settings.bank_cs_title}</h2>
                            <p className={styles.productDesc}>{settings.bank_cs_desc}</p>
                            <a href={settings.bank_cs_link} className={styles.productBtn}>
                                    {settings.bank_cs_btn} <ArrowRight size={18} />
                             </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="business" className={`${styles.productSection} ${styles.bgAlt}`}>
                <div className={styles.container}>
                    <div className={`${styles.productGrid} ${styles.reverseGrid}`}>
                        <div className={styles.productContent}>
                            <h2 className={styles.productTitle}>{settings.bank_biz_title}</h2>
                            <p className={styles.productDesc}>{settings.bank_biz_desc}</p>
                            <a href={settings.bank_biz_link} className={styles.productBtn}>
                                {settings.bank_biz_btn} <ArrowRight size={18} />
                            </a>
                        </div>
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={settings.bank_biz_img}
                                alt={settings.bank_biz_img_alt}
                                fill
                                className={styles.productImage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id="student" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.productGrid}>
                        <div className={styles.productImageWrapper}>
                            <Image
                                src={settings.bank_stu_img}
                                alt={settings.bank_stu_img_alt}
                                fill
                                className={styles.productImage}
                            />
                        </div>
                        <div className={styles.productContent}>
                            <h2 className={styles.productTitle}>{settings.bank_stu_title}</h2>
                            <p className={styles.productDesc}>{settings.bank_stu_desc}</p>
                            <a href={settings.bank_stu_link} className={styles.productBtn}>
                                {settings.bank_stu_btn} <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

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
                                    <th>{settings.bank_compare_col_1}</th>
                                    <th className={styles.thTrust}>{settings.site_name}</th>
                                    <th>{settings.bank_compare_col_2}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{settings.bank_tbl_row_1_label}</td>
                                    <td className={styles.tdTrust}>{settings.bank_fee_monthly}</td>
                                    <td>{settings.bank_competitor_fee_monthly}</td>
                                </tr>
                                <tr>
                                    <td>{settings.bank_tbl_row_2_label}</td>
                                    <td className={styles.tdTrust}>{settings.bank_fee_overdraft}</td>
                                    <td>{settings.bank_competitor_fee_overdraft}</td>
                                </tr>
                                <tr>
                                    <td>{settings.bank_tbl_row_3_label}</td>
                                    <td className={styles.tdTrust}>{settings.bank_fee_foreign}</td>
                                    <td>{settings.bank_competitor_fee_foreign}</td>
                                </tr>
                                <tr>
                                    <td>{settings.bank_tbl_row_4_label}</td>
                                    <td className={styles.tdTrust}>{settings.bank_min_balance}</td>
                                    <td>{settings.bank_competitor_min_balance}</td>
                                </tr>
                                <tr>
                                    <td>{settings.bank_tbl_row_5_label}</td>
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