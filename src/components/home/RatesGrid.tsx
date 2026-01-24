'use client';

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Flame, ShieldCheck, Info, TrendingUp, CheckCircle2 } from "lucide-react";
import styles from "./home.module.css";


interface RatesGridProps {
    settings: any;
}

export default function RatesGrid({ settings }: RatesGridProps) {
    const [activeTab, setActiveTab] = useState<'deposits' | 'borrowing'>('deposits');

    return (
        <section className={styles.ratesSection}>
            <div className={styles.container}>

                {/* 1. HEADER WITH TABS */}
                <div className={styles.ratesHeader}>
                    <div className={styles.headerText}>
                        <h2 className={styles.sectionTitleDark}>{settings.home_rates_title}</h2>
                        <p className={styles.sectionDescDark}>
                            {settings.home_rates_desc}
                        </p>
                    </div>

                    {/* THE TAB SWITCHER */}
                    <div className={styles.rateTabs}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'deposits' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('deposits')}
                        >
                            Save & Grow
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'borrowing' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('borrowing')}
                        >
                            Borrow & Spend
                        </button>
                    </div>
                </div>

                {/* 2. THE DYNAMIC GRID */}
                <div className={styles.ratesGrid}>

                    {activeTab === 'deposits' ? (
                        <>
                            {/* CARD 1: SAVINGS (Uses HYSA Rate from Save Page) */}
                            <div className={`${styles.rateCard} ${styles.featuredCard}`}>
                                <div className={styles.badge}>
                                    <Flame size={14} fill="white" className={styles.badgeIcon} /> POPULAR
                                </div>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>Platinum Savings</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_hysa_apy}% <small>APY</small>
                                    </div>
                                    <p className={styles.rateSub}>
                                        <TrendingUp size={16} /> 7x the national average
                                    </p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>Min. Balance</span>
                                        <strong>$0.00</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Monthly Fee</span>
                                        <strong>$0</strong>
                                    </div>
                                </div>
                                <Link href="/register" className={styles.btnFull}>
                                    Start Saving <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 2: CD (Uses CD Rate from Save Page) */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>12-Month CD</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_cd_apy}% <small>APY</small>
                                    </div>
                                    <p className={styles.rateSub}>
                                        <ShieldCheck size={16} /> Guaranteed return
                                    </p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>Term</span>
                                        <strong>12 Months</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Min. Deposit</span>
                                        <strong>$500</strong>
                                    </div>
                                </div>
                                <Link href="/register" className={styles.btnOutlineDark}>
                                    Open CD <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 3: CHECKING (Uses Checking Bonus) */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>Total Checking</h3>
                                    <div className={styles.rateValue}>
                                        ${settings.rate_checking_bonus} <small>BONUS</small>
                                    </div>
                                    <p className={styles.rateSub}>
                                        <CheckCircle2 size={16} /> With direct deposit
                                    </p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>ATMs</span>
                                        <strong>Unlimited</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>Overdraft</span>
                                        <strong>$0 Fee</strong>
                                    </div>
                                </div>
                                <Link href="/register" className={styles.btnOutlineDark}>
                                    Open Checking <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* CARD 4: MORTGAGE (Uses 30yr Rate from Borrow Page) */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>30-Year Fixed</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_mortgage_30yr}% <small>APR</small>
                                    </div>
                                    <p className={styles.rateSub}>Purchase or Refinance.</p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>Closing Costs</span>
                                        <strong>Low</strong>
                                    </div>
                                </div>
                                <Link href="/borrow" className={styles.btnOutlineDark}>
                                    Check Rates <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 5: AUTO (Uses Low Auto Rate from Borrow Page) */}
                            <div className={`${styles.rateCard} ${styles.featuredCard}`}>
                                <div className={styles.badge}>
                                    <TrendingUp size={14} /> LOW RATE
                                </div>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>Auto Loans</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_auto_low}% <small>APR</small>
                                    </div>
                                    <p className={styles.rateSub}>New or Used vehicles.</p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>Term</span>
                                        <strong>Up to 72 mo</strong>
                                    </div>
                                </div>
                                <Link href="/borrow" className={styles.btnFull}>
                                    Apply Now <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 6: PERSONAL (Uses Personal Rate from Borrow Page) */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>Personal Loan</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_personal_apr}% <small>APR</small>
                                    </div>
                                    <p className={styles.rateSub}>Consolidate debt instantly.</p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>Funding</span>
                                        <strong>Same Day</strong>
                                    </div>
                                </div>
                                <Link href="/borrow" className={styles.btnOutlineDark}>
                                    View Options <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    )}

                </div>

                <div className={styles.disclaimer}>
                    <Info size={14} /> Rates are subject to change without notice. APY = Annual Percentage Yield. APR = Annual Percentage Rate.
                    See full <Link href="/terms">disclosures</Link> for details.
                </div>
            </div>
        </section>
    );
}