import Link from "next/link";
import Image from "next/image";
import { Car, Home, Briefcase, GraduationCap, Calculator, ArrowRight, ChevronRight, Percent } from "lucide-react";
import styles from "./home.module.css";

export default function LoanSection() {
    return (
        <section className={styles.loanSection}>
            <div className={styles.container}>

                {/* 1. HEADER & CATEGORIES */}
                <div className={styles.loanHeader}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.sectionTitleDark}>Borrow with Confidence</h2>
                        <p className={styles.sectionDescDark}>
                            Whether you’re buying a home, a new car, or consolidating debt,
                            we have the transparent terms you need.
                        </p>
                    </div>

                    {/* Icon Navigation (Visual Only) */}
                    <div className={styles.loanIcons}>
                        <div className={styles.loanIconItem}>
                            <Home size={24} />
                            <span>Home</span>
                        </div>
                        <div className={styles.loanIconItem}>
                            <Car size={24} />
                            <span>Auto</span>
                        </div>
                        <div className={styles.loanIconItem}>
                            <GraduationCap size={24} />
                            <span>Student</span>
                        </div>
                        <div className={styles.loanIconItem}>
                            <Briefcase size={24} />
                            <span>Business</span>
                        </div>
                    </div>
                </div>

                {/* 2. SPLIT FEATURE CARDS */}
                <div className={styles.loanGrid}>

                    {/* CARD 1: MORTGAGE (The "Blue" Card) */}
                    <div className={styles.loanCardBlue}>
                        <div className={styles.loanTextContent}>
                            <div className={styles.iconBoxWhite}>
                                <Home size={24} className={styles.iconBlue} />
                            </div>
                            <h3>A home of your own</h3>
                            <p>
                                Low down payment options on fixed-rate mortgages.
                                Lock in your rate today and close in as little as 21 days.
                            </p>

                            <div className={styles.loanStatRow}>
                                <div>
                                    <span className={styles.statLabel}>30-Year Fixed</span>
                                    <span className={styles.statValue}>6.12% <small>APR</small></span>
                                </div>
                                <div className={styles.verticalDivider}></div>
                                <div>
                                    <span className={styles.statLabel}>Closing Costs</span>
                                    <span className={styles.statValue}>$0 <small>Origination</small></span>
                                </div>
                            </div>

                            <div className={styles.loanActions}>
                                <Link href="/mortgage" className={styles.btnWhite}>
                                    Get Pre-Approved
                                </Link>
                                <Link href="/mortgage/calculator" className={styles.linkLight}>
                                    Calculate Payment <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className={styles.loanImageWrapper}>
                            <Image
                                src="/loan-home.png"
                                alt="Happy couple front of house"
                                fill
                                className={styles.loanImage}
                            />
                        </div>
                    </div>

                    {/* CARD 2: AUTO/PERSONAL (The "Grey" Card) */}
                    <div className={styles.loanCardGrey}>
                        <div className={styles.loanTextContent}>
                            <div className={styles.iconBoxBlue}>
                                <Car size={24} className={styles.iconWhite} />
                            </div>
                            <h3>On the road faster</h3>
                            <p>
                                Finance a new car or refinance your current one.
                                Rates as low as <strong>5.89% APR</strong> for well-qualified buyers.
                            </p>

                            <ul className={styles.loanChecklist}>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> Decisions in minutes</li>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> No pre-payment penalties</li>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> Rate discounts for members</li>
                            </ul>

                            <div className={styles.loanActions}>
                                <Link href="/auto-loans" className={styles.btnBlueOutline}>
                                    View Auto Rates
                                </Link>
                                <Link href="/auto-loans/calculator" className={styles.linkDark}>
                                    Estimate Payment <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className={styles.loanImageWrapper}>
                            <Image
                                src="/loan-car.png"
                                alt="Woman driving new car"
                                fill
                                className={styles.loanImage}
                            />
                        </div>
                    </div>

                </div>

                {/* 3. CALCULATOR STRIP (Bottom) */}
                <div className={styles.toolsStrip}>
                    <div className={styles.toolItem}>
                        <Calculator size={20} className={styles.toolIcon} />
                        <div>
                            <h4>Mortgage Calculator</h4>
                            <Link href="/calculators/mortgage">Estimate monthly payments &rarr;</Link>
                        </div>
                    </div>
                    <div className={styles.toolDivider}></div>
                    <div className={styles.toolItem}>
                        <Percent size={20} className={styles.toolIcon} />
                        <div>
                            <h4>Check Your Rate</h4>
                            <Link href="/rates">See personalized offers &rarr;</Link>
                        </div>
                    </div>
                    <div className={styles.toolDivider}></div>
                    <div className={styles.toolItem}>
                        <Briefcase size={20} className={styles.toolIcon} />
                        <div>
                            <h4>Business Lines</h4>
                            <Link href="/business/loans">Explore capital options &rarr;</Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}