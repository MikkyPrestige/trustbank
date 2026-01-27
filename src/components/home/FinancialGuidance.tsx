import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldAlert, ChevronRight, Home } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function FinancialGuidance() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    return (
        <section className={styles.guideSection}>
            <div className={styles.container}>

                {/* SECTION HEADER */}
                <div className={styles.guideHeader}>
                    <div>
                        <h2 className={styles.sectionTitleDark}>{settings.home_guide_title}</h2>
                        <p className={styles.sectionDescDark}>
                            {settings.home_guide_desc}
                        </p>
                    </div>
                    <Link href="/learn" className={styles.linkUnderline}>
                        View all articles <ArrowRight size={16} />
                    </Link>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className={styles.guideGrid}>

                    {/* CARD 1: HERO (Retirement/Planning) */}
                    <div className={styles.guideCardLarge}>
                        <Image
                            // DYNAMIC
                            src={settings.guide_article_1_img || "/guide-retirement.png"}
                            alt={settings.guide_article_1_alt || ""}
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlay}>
                            <span className={styles.tagBlue}>PLANNING</span>
                            <h3>{settings.guide_article_1_title}</h3>
                            <p>Protect what you&apos;ve built as you look ahead. Strategies for a stronger retirement.</p>
                            <Link href="/retirement" className={styles.btnGlass}>
                                Unlock Options <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 2: SECURITY (Icon only - No image needed) */}
                    <div className={styles.guideCardGold}>
                        <div className={styles.securityContent}>
                            <div className={styles.iconCircleWhite}>
                                <ShieldAlert size={32} className={styles.iconGold} />
                            </div>
                            <h3>{settings.guide_article_2_title}</h3>
                            <p>Spot the latest tactics scammers are using and how to shield yourself.</p>
                            <Link href="/security" className={styles.linkDark}>
                                Get the latest <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 3: HOME OWNERSHIP */}
                    <div className={styles.guideCardSmall}>
                        <Image
                            // DYNAMIC
                            src={settings.guide_article_3_img || "/guide-home.png"}
                            alt={settings.guide_article_3_alt || ""}
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlaySmall}>
                            <div className={styles.iconWrapperSmall}>
                                <Home size={20} color="white" />
                            </div>
                            <h3>{settings.guide_article_3_title}</h3>
                            <Link href="/mortgage" className={styles.linkWhite}>
                                Calculate Rate <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* CARD 4: BUSINESS */}
                    <div className={styles.guideCardWide}>
                        <Image
                            // DYNAMIC
                            src={settings.guide_article_4_img || "/guide-business.png"}
                            alt={settings.guide_article_4_alt || ""}
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlaySide}>
                            <span className={styles.tagWhite}>BUSINESS</span>
                            <h3>{settings.guide_article_4_title}</h3>
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