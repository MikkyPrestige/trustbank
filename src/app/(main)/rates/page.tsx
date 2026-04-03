import { getSiteSettings } from "@/lib/content/get-settings";
import styles from "./rates.module.css";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function RatesPage() {
    const settings = await getSiteSettings();
    const content = settings.content || {};

    return (
        <main className={styles.main}>
            <section className={styles.header}>
                <div className={styles.bgImageWrapper}>
                    <Image
                        src={content.rates_hero_img}
                        alt={content.rates_hero_alt}
                        fill
                        priority
                        className={styles.bgImage}
                    />
                    <div className={styles.overlay}></div>
                </div>
                <div className={styles.headerContent}>
                    <div className={styles.container}>
                        <h1>
                            {content.rates_hero_title}
                            <span className={styles.highlight}> {content.rates_hero_highlight}</span>
                        </h1>
                        <p>{content.rates_hero_desc}</p>
                    </div>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.rateGroup}>
                        <h2>{content.rates_title_deposit}</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.rateTable}>
                                <thead>
                                    <tr>
                                        <th>{content.rates_dep_head_prod}</th>
                                        <th>{content.rates_dep_head_rate}</th>
                                        <th>{content.rates_dep_head_apy}</th>
                                        <th>{content.rates_dep_head_min}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>{settings.rate_hysa_name}</strong>
                                            {content.rates_tag_popular && (
                                                <span className={styles.tag}>{content.rates_tag_popular}</span>
                                            )}
                                        </td>
                                        <td>{settings.rate_hysa_rate}{settings.rates_percent}</td>
                                        <td className={styles.apy}>{settings.rate_hysa_apy}{settings.rates_percent}</td>
                                        <td>{settings.rate_hysa_min}</td>
                                    </tr>

                                    <tr>
                                        <td><strong>{settings.rate_mma_name}</strong></td>
                                        <td>{settings.rate_mma_rate}{settings.rates_percent}</td>
                                        <td className={styles.apy}>{settings.rate_mma_apy}{settings.rates_percent}</td>
                                        <td>{settings.rate_mma_min}</td>
                                    </tr>

                                    <tr>
                                        <td><strong>{settings.rate_cd_name}</strong></td>
                                        <td>{settings.rate_cd_rate}{settings.rates_percent}</td>
                                        <td className={styles.apy}>{settings.rate_cd_apy}{settings.rates_percent}</td>
                                        <td>{settings.rate_cd_min}</td>
                                    </tr>

                                    <tr>
                                        <td><strong>{settings.rate_kids_name}</strong></td>
                                        <td>{settings.rate_kids_rate}{settings.rates_percent}</td>
                                        <td className={styles.apy}>{settings.rate_kids_apy}{settings.rates_percent}</td>
                                        <td>{settings.rate_kids_min}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={styles.rateGroup}>
                        <h2>{content.rates_title_borrow}</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.rateTable}>
                                <thead>
                                    <tr>
                                        <th>{content.rates_loan_head_type}</th>
                                        <th>{content.rates_loan_head_term}</th>
                                        <th>{content.rates_loan_head_apr}</th>
                                        <th>{content.rates_loan_head_detail}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>{settings.rate_auto_name}</strong></td>
                                        <td>{settings.rate_auto_term}</td>
                                        <td className={styles.apr}>{settings.rate_auto_apr}{settings.rates_percent}</td>
                                        <td><Link href={settings.rate_auto_apr_link}>{content.rates_btn_view}</Link></td>
                                    </tr>

                                    <tr>
                                        <td><strong>{settings.rate_personal_name}</strong></td>
                                        <td>{settings.rate_personal_term}</td>
                                        <td className={styles.apr}>{settings.rate_personal_apr}{settings.rates_percent}</td>
                                        <td><Link href={settings.rate_personal_link}>{content.rates_btn_view}</Link></td>
                                    </tr>

                                    <tr>
                                        <td><strong>{settings.rate_mortgage_name}</strong></td>
                                        <td>{settings.rate_mortgage_term}</td>
                                        <td className={styles.apr}>{settings.rate_mortgage_30yr}{settings.rates_percent}</td>
                                        <td><Link href={settings.rate_mortgage_link}>{content.rates_btn_view}</Link></td>
                                    </tr>

                                    <tr>
                                        <td><strong>{settings.rate_cc_name}</strong></td>
                                        <td>{settings.rate_cc_term}</td>
                                        <td className={styles.apr}>{settings.rate_cc_intro}</td>
                                        <td><Link href={settings.rate_cc_link}>{content.rates_btn_view}</Link></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={styles.disclaimerBox}>
                        <h4>
                            <CheckCircle2 size={16} />
                            {content.rates_disclaimer_title}
                        </h4>
                        <p>{content.rates_disclaimer}</p>
                    </div>
                </div>
            </section>
        </main>
    );
}