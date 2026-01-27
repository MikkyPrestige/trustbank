import { getSiteSettings } from "@/lib/content/get-settings";
import styles from "./rates.module.css";
import { CheckCircle2 } from "lucide-react";

export default async function RatesPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>

            <section className={styles.header}>
                <div className={styles.container}>
                    <h1>{settings.rates_hero_title} <span className={styles.highlight}>{settings.rates_hero_highlight}</span></h1>
                    <p>{settings.rates_hero_desc}</p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>

                    {/* 1. DEPOSIT RATES */}
                    <div className={styles.rateGroup}>
                        <h2>Savings & Certificates</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.rateTable}>
                                <thead>
                                    <tr>
                                        <th>Account Product</th>
                                        <th>Interest Rate</th>
                                        <th>APY*</th>
                                        <th>Min. Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Platinum Savings</strong><span className={styles.tag}>Popular</span></td>
                                        <td>4.40%</td>
                                        <td className={styles.apy}>{settings.rate_hysa_apy}%</td>
                                        <td>$0.00</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Money Market</strong></td>
                                        <td>4.15%</td>
                                        <td className={styles.apy}>{settings.rate_mma_apy}%</td>
                                        <td>$2,500.00</td>
                                    </tr>
                                    <tr>
                                        <td><strong>12-Month CD</strong></td>
                                        <td>5.05%</td>
                                        <td className={styles.apy}>{settings.rate_cd_apy}%</td>
                                        <td>$500.00</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Kids Club Savings</strong></td>
                                        <td>2.95%</td>
                                        <td className={styles.apy}>{settings.rate_kids_apy}%</td>
                                        <td>$0.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 2. LENDING RATES */}
                    <div className={styles.rateGroup}>
                        <h2>Borrowing Rates</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.rateTable}>
                                <thead>
                                    <tr>
                                        <th>Loan Type</th>
                                        <th>Term</th>
                                        <th>APR as low as*</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Auto Loan (New)</strong></td>
                                        <td>Up to 72 mo</td>
                                        <td className={styles.apr}>{settings.rate_auto_apr}%</td>
                                        <td><a href="/borrow">View</a></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Personal Loan</strong></td>
                                        <td>12 - 60 mo</td>
                                        <td className={styles.apr}>{settings.rate_personal_apr}%</td>
                                        <td><a href="/borrow">View</a></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Mortgage (30yr Fixed)</strong></td>
                                        <td>30 Years</td>
                                        <td className={styles.apr}>{settings.rate_mortgage_30yr}%</td>
                                        <td><a href="#">View</a></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Credit Card</strong></td>
                                        <td>Variable</td>
                                        <td className={styles.apr}>{settings.rate_credit_intro_apr}% Intro</td>
                                        <td><a href="#">View</a></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DISCLAIMER */}
                    <div className={styles.disclaimerBox}>
                        <h4><CheckCircle2 size={16} /> Important Rate Information</h4>
                        <p>
                            *APY = Annual Percentage Yield. APR = Annual Percentage Rate. Rates are subject to change at any time without notice.
                            Fees may reduce earnings on accounts. Penalty for early withdrawal from Certificates of Deposit.
                            Loan rates based on creditworthiness.
                        </p>
                    </div>

                </div>
            </section>
        </main>
    );
}