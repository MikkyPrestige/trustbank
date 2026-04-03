import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldAlert, ChevronRight } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function FinancialGuidance() {
    const settings = await getSiteSettings();

    return (
        <section className={styles.guideSection}>
            <div className={styles.container}>
                <div className={styles.guideHeader}>
                    <div>
                        <h2 className={styles.sectionTitleDark}>{settings.home_guide_title}</h2>
                        <p className={styles.sectionDescDark}>
                            {settings.home_guide_desc}
                        </p>
                    </div>
                    <Link href={settings.home_guide_link_text} className={styles.linkUnderline}>
                        {settings.home_guide_link_text} <ArrowRight size={16} />
                    </Link>
                </div>

                <div className={styles.guideGrid}>
                    <div className={styles.guideCardLarge}>
                        <Image
                            src={settings.guide_article_1_img}
                            alt={settings.guide_article_1_alt}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlay}>
                            <span className={styles.tagBlue}>{settings.guide_article_1_head}</span>
                            <h3>{settings.guide_article_1_title}</h3>
                            <p>{settings.guide_article_1_subtitle}</p>
                            <Link href={settings.guide_article_1_link} className={styles.btnGlass}>
                                {settings.guide_article_1_link_text} <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.guideCardGold}>
                        <div className={styles.securityContent}>
                            <div className={styles.iconCircleWhite}>
                                <ShieldAlert size={32} className={styles.iconGold} />
                            </div>
                            <span className={styles.tagRed}>{settings.guide_article_2_head}</span>
                            <h3>{settings.guide_article_2_title}</h3>
                            <p>{settings.guide_article_2_subtitle}</p>
                            <Link href={settings.guide_article_2_link} className={styles.btnGlassSmall}>
                                {settings.guide_article_2_link_text} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.guideCardSmall}>
                        <Image
                            src={settings.guide_article_3_img}
                            alt={settings.guide_article_3_alt}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlaySmall}>
                            <span className={styles.tagGreen}>{settings.guide_article_3_head}</span>
                            <h3>{settings.guide_article_3_title}</h3>
                            <p>{settings.guide_article_3_subtitle}</p>
                            <Link href={settings.guide_article_3_link} className={styles.btnGlassSmall}>
                                {settings.guide_article_3_link_text} <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.guideCardWide}>
                        <Image
                            src={settings.guide_article_4_img}
                            alt={settings.guide_article_4_alt}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            fill
                            className={styles.cardBgImage}
                        />
                        <div className={styles.cardOverlaySide}>
                            <span className={styles.tagWhite}>{settings.guide_article_4_head}</span>
                            <h3>{settings.guide_article_4_title}</h3>
                            <p>{settings.guide_article_4_subtitle}</p>
                            <Link href={settings.guide_article_4_link} className={styles.btnGlassSmall}>
                                {settings.guide_article_4_link_text} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}