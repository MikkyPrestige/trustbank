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

                    <div className={styles.rateTabs}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'deposits' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('deposits')}
                        >
                            {settings.home_rates_tab1_label}
                        </button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'borrowing' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('borrowing')}
                        >
                            {settings.home_rates_tab2_label}
                        </button>
                    </div>
                </div>

                {/* 2.  GRID */}
                <div className={styles.ratesGrid}>
                    {activeTab === 'deposits' ? (
                        <>
                            {/* CARD 1: SAVINGS */}
                            <div className={`${styles.rateCard} ${styles.featuredCard}`}>
                                <div className={styles.badge}>
                                    <Flame size={14} fill="white" className={styles.badgeIcon} /> {settings.home_rates_c1_badge}
                                </div>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>{settings.home_rates_c1_title}</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_hysa_apy}{settings.home_rates_percent_symbol} <small>{settings.home_rates_unit_apy}</small>
                                    </div>
                                    <p className={styles.rateSub}>
                                        <TrendingUp size={16} /> {settings.home_rates_c1_sub}
                                    </p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c1_row1_label}</span>
                                        <strong>{settings.home_rates_c1_row1_value}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c1_row2_label}</span>
                                        <strong>{settings.home_rates_c1_row2_value}</strong>
                                    </div>
                                </div>
                                <Link href={settings.home_rates_c1_btn_link} className={styles.btnFull}>
                                    {settings.home_rates_c1_btn_text} <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 2: CD */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>{settings.home_rates_c2_title}</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_cd_apy}{settings.home_rates_percent_symbol} <small>{settings.home_rates_unit_apy}</small>
                                    </div>
                                    <p className={styles.rateSub}>
                                        <ShieldCheck size={16} /> {settings.home_rates_c2_sub}
                                    </p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c2_row1_label}</span>
                                        <strong>{settings.home_rates_c2_row1_value}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c2_row2_label}</span>
                                        <strong>{settings.home_rates_c2_row2_value}</strong>
                                    </div>
                                </div>
                                <Link href={settings.home_rates_c2_btn_link} className={styles.btnOutlineDark}>
                                    {settings.home_rates_c2_btn_text} <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 3: CHECKING */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>{settings.home_rates_c3_title}</h3>
                                    <div className={styles.rateValue}>
                                        {settings.home_rates_currency_symbol}{settings.rate_checking_bonus} <small>{settings.home_rates_unit_bonus}</small>
                                    </div>
                                    <p className={styles.rateSub}>
                                        <CheckCircle2 size={16} /> {settings.home_rates_c3_sub}
                                    </p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c3_row1_label}</span>
                                        <strong>{settings.home_rates_c3_row1_value}</strong>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c3_row2_label}</span>
                                        <strong>{settings.home_rates_c3_row2_value}</strong>
                                    </div>
                                </div>
                                <Link href={settings.home_rates_c3_btn_link} className={styles.btnOutlineDark}>
                                    {settings.home_rates_c3_btn_text} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* CARD 4: MORTGAGE */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>{settings.home_rates_c4_title}</h3>
                                    <div className={styles.rateValue}>
                                        {settings.rate_mortgage_30yr}{settings.home_rates_percent_symbol} <small>{settings.home_rates_unit_apr}</small>
                                    </div>
                                    <p className={styles.rateSub}>{settings.home_rates_c4_sub}</p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c4_row1_label}</span>
                                        <strong>{settings.home_rates_c4_row1_value}</strong>
                                    </div>
                                </div>
                                <Link href={settings.home_rates_c4_btn_link} className={styles.btnOutlineDark}>
                                    {settings.home_rates_c4_btn_text} <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 5: AUTO */}
                            <div className={`${styles.rateCard} ${styles.featuredCard}`}>
                                <div className={styles.badge}>
                                    <TrendingUp size={14} /> {settings.home_rates_c5_badge}
                                </div>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>{settings.home_rates_c5_title}</h3>
                                        <div className={styles.rateValue}>
                                            {settings.rate_auto_low}{settings.home_rates_percent_symbol} <small>{settings.home_rates_unit_apr}</small>
                                        </div>
                                    <p className={styles.rateSub}>{settings.home_rates_c5_sub}</p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c5_row1_label}</span>
                                        <strong>{settings.home_rates_c5_row1_value}</strong>
                                    </div>
                                </div>
                                <Link href={settings.home_rates_c5_btn_link} className={styles.btnFull}>
                                    {settings.home_rates_c5_btn_text} <ArrowRight size={18} />
                                </Link>
                            </div>

                            {/* CARD 6: PERSONAL */}
                            <div className={styles.rateCard}>
                                <div className={styles.cardTop}>
                                    <h3 className={styles.rateTitle}>{settings.home_rates_c6_title}</h3>
                                 <div className={styles.rateValue}>
                                        {settings.rate_personal_apr}{settings.home_rates_percent_symbol} <small>{settings.home_rates_unit_apr}</small>
                                    </div>
                                    <p className={styles.rateSub}>{settings.home_rates_c6_sub}</p>
                                </div>
                                <div className={styles.cardDetails}>
                                    <div className={styles.detailRow}>
                                        <span>{settings.home_rates_c6_row1_label}</span>
                                        <strong>{settings.home_rates_c6_row1_value}</strong>
                                    </div>
                                </div>
                                <Link href={settings.home_rates_c6_btn_link} className={styles.btnOutlineDark}>
                                    {settings.home_rates_c6_btn_text} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </>
                    )}

                </div>

                <div className={styles.disclaimer}>
                    <Info size={14} /> {settings.home_rates_disclaimer}
                </div>
            </div>
        </section>
    );
}