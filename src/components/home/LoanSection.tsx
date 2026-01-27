import Link from "next/link";
import Image from "next/image";
import { Car, Home, Briefcase, GraduationCap, Calculator, ChevronRight, Percent } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function LoanSection() {
    const settings = await getSiteSettings();

    return (
        <section className={styles.loanSection}>
            <div className={styles.container}>

                {/* 1. HEADER & CATEGORIES */}
                <div className={styles.loanHeader}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.sectionTitleDark}>{settings.home_loan_title}</h2>
                        <p className={styles.sectionDescDark}>
                            {settings.home_loan_desc}
                        </p>
                    </div>
                    <div className={styles.loanIcons}>
                        <div className={styles.loanIconItem}><Home size={24} /><span>Home</span></div>
                        <div className={styles.loanIconItem}><Car size={24} /><span>Auto</span></div>
                        <div className={styles.loanIconItem}><GraduationCap size={24} /><span>Student</span></div>
                        <div className={styles.loanIconItem}><Briefcase size={24} /><span>Business</span></div>
                    </div>
                </div>

                {/* 2. SPLIT FEATURE CARDS */}
                <div className={styles.loanGrid}>
                    {/* CARD 1: MORTGAGE*/}
                    <div className={styles.loanCardBlue}>
                        <div className={styles.loanTextContent}>
                            <div className={styles.iconBoxWhite}>
                                <Home size={24} className={styles.iconBlue} />
                            </div>
                            <h3>{settings.home_loan_card1_title}</h3>
                            <p>
                                {settings.home_loan_card1_desc}
                            </p>

                            <div className={styles.loanStatRow}>
                                <div>
                                    <span className={styles.statLabel}>30-Year Fixed</span>
                                    <span className={styles.statValue}>{settings.rate_mortgage_30yr}% <small>APR</small></span>
                                </div>
                                <div className={styles.verticalDivider}></div>
                                <div>
                                    <span className={styles.statLabel}>Closing Costs</span>
                                    <span className={styles.statValue}>$0 <small>Origination</small></span>
                                </div>
                            </div>

                            <div className={styles.loanActions}>
                                <Link href="/borrow" className={styles.btnWhite}>
                                    Get Pre-Approved
                                </Link>
                                <Link href="/payments" className={styles.linkLight}>
                                    Calculate Payment <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className={styles.loanImageWrapper}>
                            <Image
                                src={settings.home_loan_card1_img || "/loan-home.png"}
                                alt={settings.home_loan_card1_alt || "Home Loan"}
                                fill
                                className={styles.loanImage}
                            />
                        </div>
                    </div>

                    {/* CARD 2: AUTO (The "Grey" Card) */}
                    <div className={styles.loanCardGrey}>
                        <div className={styles.loanTextContent}>
                            <div className={styles.iconBoxBlue}>
                                <Car size={24} className={styles.iconWhite} />
                            </div>
                            <h3>{settings.home_loan_card2_title}</h3>
                            <p>
                                {settings.home_loan_card2_desc}
                            </p>
                            <p className={styles.smallNote}>
                                Rates as low as <strong>{settings.rate_auto_low}% APR</strong>.
                            </p>

                            <ul className={styles.loanChecklist}>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> Decisions in minutes</li>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> No pre-payment penalties</li>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> Rate discounts for members</li>
                            </ul>

                            <div className={styles.loanActions}>
                                <Link href="/borrow" className={styles.btnBlueOutline}>
                                    View Auto Rates
                                </Link>
                                <Link href="payments" className={styles.linkDark}>
                                    Estimate Payment <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className={styles.loanImageWrapper}>
                            <Image
                                src={settings.home_loan_card2_img || "/loan-car.png"}
                                alt={settings.home_loan_card2_alt || "Auto Loan"}
                                fill
                                className={styles.loanImage}
                            />
                        </div>
                    </div>

                </div>

                {/* 3. CALCULATOR STRIP */}
                <div className={styles.toolsStrip}>
                    <div className={styles.toolItem}>
                        <Calculator size={20} className={styles.toolIcon} />
                        <div><h4>Mortgage Calculator</h4><Link href="/payments">Estimate monthly payments &rarr;</Link></div>
                    </div>
                    <div className={styles.toolDivider}></div>
                    <div className={styles.toolItem}>
                        <Percent size={20} className={styles.toolIcon} />
                        <div><h4>Check Your Rate</h4><Link href="/rates">See personalized offers &rarr;</Link></div>
                    </div>
                    <div className={styles.toolDivider}></div>
                    <div className={styles.toolItem}>
                        <Briefcase size={20} className={styles.toolIcon} />
                        <div><h4>Business Lines</h4><Link href="/borrow">Explore capital options &rarr;</Link></div>
                    </div>
                </div>

            </div>
        </section>
    );
}