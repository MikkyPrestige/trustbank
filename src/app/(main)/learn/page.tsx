import Image from "next/image";
import styles from "./learn.module.css";
import WellnessPulse from "@/components/main/learn/WellnessPulse";
import { BookOpen, Lightbulb, TrendingUp, PlayCircle, ArrowRight } from "lucide-react";

export default function LearnPage() {
    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/learn-hero.png"
                    alt="Planning Finances"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.amberBadge}>Trust Education</div>
                    <h1 className={styles.heroTitle}>
                        Financial clarity <br />
                        <span className={styles.highlight}>starts here.</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Expert insights, market analysis, and actionable guides designed
                        to help you make smarter decisions with your money.
                    </p>
                </div>

                <div className={styles.heroWidget}>
                    <WellnessPulse />
                </div>
            </section>

            {/* 2. FEATURED GUIDES (Magazine Style) */}
            <section className={styles.contentSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Latest Insights</h2>
                        <p>Curated knowledge for every stage of your financial journey.</p>
                    </div>

                    <div className={styles.grid}>

                        <div className={styles.cardLarge}>
                            <div className={styles.cardImageWrapper}>
                                <div className={styles.tag}>INVESTING</div>
                                <Image
                                    src="/learn-invest.png"
                                    alt="Rising Rates"
                                    fill
                                    className={styles.articleImg}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h3>The Impact of Rising Rates on Your Portfolio</h3>
                                <p>Understanding how the Federal Reserve&apos;s latest moves affect bonds, stocks, and savings yields in 2026.</p>
                                <a href="#" className={styles.readLink}>Read Analysis <ArrowRight size={16} /></a>
                            </div>
                        </div>

                        {/* Article 2 */}
                        <div className={styles.card}>
                            <div className={styles.cardImageWrapper}>
                                <div className={styles.tag}>BASICS</div>
                                <Image
                                    src="/learn-tax.png"
                                    alt="Tax Tips"
                                    fill
                                    className={styles.articleImg}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h3>5 Tax Moves to Make Before April</h3>
                                <p>Don&apos;t leave money on the table. Here is your checklist for the upcoming tax season.</p>
                                <a href="#" className={styles.readLink}>Get Checklist <ArrowRight size={16} /></a>
                            </div>
                        </div>

                        {/* Article 3 */}
                        <div className={styles.card}>
                            <div className={styles.cardImageWrapper}>
                                <div className={styles.tag}>BUSINESS</div>
                                <Image
                                    src="/learn-business.png"
                                    alt="Side Hustle"
                                    fill
                                    className={styles.articleImg}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h3>Scaling Your Side Hustle</h3>
                                <p>When is the right time to open a business account? We break down the timeline.</p>
                                <a href="#" className={styles.readLink}>Learn More <ArrowRight size={16} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CATEGORY STRIP */}
            <section className={styles.categoryStrip}>
                <div className={styles.container}>
                    <div className={styles.categoryItem}>
                        <BookOpen size={32} className={styles.catIcon} />
                        <h3>Finance 101</h3>
                        <p>Budgeting & Credit</p>
                    </div>
                    <div className={styles.categoryItem}>
                        <TrendingUp size={32} className={styles.catIcon} />
                        <h3>Market News</h3>
                        <p>Daily Updates</p>
                    </div>
                    <div className={styles.categoryItem}>
                        <Lightbulb size={32} className={styles.catIcon} />
                        <h3>Life Hacks</h3>
                        <p>Saving Tips</p>
                    </div>
                    <div className={styles.categoryItem}>
                        <PlayCircle size={32} className={styles.catIcon} />
                        <h3>Webinars</h3>
                        <p>Watch On-Demand</p>
                    </div>
                </div>
            </section>

        </main>
    );
}