import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldAlert, TrendingUp, Home, Briefcase, ChevronRight } from "lucide-react";
import styles from "./home.module.css";

export default function FinancialGuidance() {
    return (
        <section className={styles.guideSection}>
            <div className={styles.container}>

                {/* SECTION HEADER */}
                <div className={styles.guideHeader}>
                    <div>
                        <h2 className={styles.sectionTitleDark}>Financial Guidance & Support</h2>
                        <p className={styles.sectionDescDark}>
                            Expert insights and tools to help you achieve your goals, from buying a home to securing your retirement.
                        </p>
                    </div>
                    <Link href="/learn" className={styles.linkUnderline}>
                        View all articles <ArrowRight size={16} />
                    </Link>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className={styles.guideGrid}>

                    {/* CARD 1: HERO (Retirement/Planning) - Large Vertical */}
                    <div className={styles.guideCardLarge}>
                        <Image
                            src="/guide-retirement.png"
                            alt="Retirement Planning"
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlay}>
                            <span className={styles.tagBlue}>PLANNING</span>
                            <h3>Secure your next chapter</h3>
                            <p>Protect what you&apos;ve built as you look ahead. Strategies for a stronger retirement.</p>
                            <Link href="/retirement" className={styles.btnGlass}>
                                Unlock Options <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 2: SECURITY (The "Yellow Shield" Idea) */}
                    <div className={styles.guideCardGold}>
                        <div className={styles.securityContent}>
                            <div className={styles.iconCircleWhite}>
                                <ShieldAlert size={32} className={styles.iconGold} />
                            </div>
                            <h3>Fraud & Scam Alert</h3>
                            <p>Spot the latest tactics scammers are using and how to shield yourself.</p>
                            <Link href="/security" className={styles.linkDark}>
                                Get the latest <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 3: HOME OWNERSHIP */}
                    <div className={styles.guideCardSmall}>
                        <Image
                            src="/guide-home.png"
                            alt="Buying a Home"
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlaySmall}>
                            <div className={styles.iconWrapperSmall}>
                                <Home size={20} color="white" />
                            </div>
                            <h3>Buying a Home?</h3>
                            <Link href="/mortgage" className={styles.linkWhite}>
                                Calculate Rate <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 4: BUSINESS (Wide) */}
                    <div className={styles.guideCardWide}>
                        <Image
                            src="/guide-business.png"
                            alt="Business Banking"
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlaySide}>
                            <span className={styles.tagWhite}>BUSINESS</span>
                            <h3>How Rising Rates Impact Business</h3>
                            <Link href="/business" className={styles.btnGlassSmall}>
                                Read Article
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}