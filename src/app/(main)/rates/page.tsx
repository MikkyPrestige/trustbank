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

            {/* HEADER SECTION */}
            <section className={styles.header}>
                <div className={styles.bgImageWrapper}>
                    <Image
                        src={content.rates_hero_img || "/placeholder.jpg"}
                        alt={content.rates_hero_alt || "Current market rates"}
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

                    {/* 1. DEPOSIT RATES */}
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
                                    {/* HYSA - USING 'settings.' FOR DATA */}
                                    <tr>
                                        <td>
                                            <strong>{settings.rate_hysa_name}</strong>
                                            {content.rates_tag_popular && (
                                                <span className={styles.tag}>{content.rates_tag_popular}</span>
                                            )}
                                        </td>
                                        <td>{settings.rate_hysa_rate}%</td>
                                        <td className={styles.apy}>{settings.rate_hysa_apy}%</td>
                                        <td>{settings.rate_hysa_min}</td>
                                    </tr>
                                    {/* MMA */}
                                    <tr>
                                        <td><strong>{settings.rate_mma_name}</strong></td>
                                        <td>{settings.rate_mma_rate}%</td>
                                        <td className={styles.apy}>{settings.rate_mma_apy}%</td>
                                        <td>{settings.rate_mma_min}</td>
                                    </tr>
                                    {/* CD */}
                                    <tr>
                                        <td><strong>{settings.rate_cd_name}</strong></td>
                                        <td>{settings.rate_cd_rate}%</td>
                                        <td className={styles.apy}>{settings.rate_cd_apy}%</td>
                                        <td>{settings.rate_cd_min}</td>
                                    </tr>
                                    {/* KIDS */}
                                    <tr>
                                        <td><strong>{settings.rate_kids_name}</strong></td>
                                        <td>{settings.rate_kids_rate}%</td>
                                        <td className={styles.apy}>{settings.rate_kids_apy}%</td>
                                        <td>{settings.rate_kids_min}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 2. LENDING RATES */}
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
                                    {/* AUTO */}
                                    <tr>
                                        <td><strong>{settings.rate_auto_name}</strong></td>
                                        <td>{settings.rate_auto_term}</td>
                                        <td className={styles.apr}>{settings.rate_auto_apr}%</td>
                                        <td><Link href="/borrow">{content.rates_btn_view}</Link></td>
                                    </tr>
                                    {/* PERSONAL */}
                                    <tr>
                                        <td><strong>{settings.rate_personal_name}</strong></td>
                                        <td>{settings.rate_personal_term}</td>
                                        <td className={styles.apr}>{settings.rate_personal_apr}%</td>
                                        <td><Link href="/borrow">{content.rates_btn_view}</Link></td>
                                    </tr>
                                    {/* MORTGAGE */}
                                    <tr>
                                        <td><strong>{settings.rate_mortgage_name}</strong></td>
                                        <td>{settings.rate_mortgage_term}</td>
                                        <td className={styles.apr}>{settings.rate_mortgage_30yr}%</td>
                                        <td><Link href="/borrow">{content.rates_btn_view}</Link></td>
                                    </tr>
                                    {/* CREDIT CARD */}
                                    <tr>
                                        <td><strong>{settings.rate_cc_name}</strong></td>
                                        <td>{settings.rate_cc_term}</td>
                                        <td className={styles.apr}>{settings.rate_cc_intro}</td>
                                        <td><Link href="/borrow">{content.rates_btn_view}</Link></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DISCLAIMER */}
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