import { getSiteSettings } from "@/lib/content/get-settings";
import Image from "next/image";
import styles from "./learn.module.css";
import WellnessPulse from "@/components/main/learn/WellnessPulse";
import { BookOpen, Lightbulb, TrendingUp, PlayCircle, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Financial Learning Center | TrustBank",
    description: "Expert guides, market insights, and tools to help you make smarter money moves.",
};

export default async function LearnPage() {
    const settings = await getSiteSettings();

    const ARTICLES = [
        {
            tag: settings.learn_art1_tag,
            title: settings.learn_art1_title,
            desc: settings.learn_art1_desc,
            img: settings.learn_art1_img,
            alt: settings.learn_art1_alt,
            link: settings.learn_art1_link,
            linkText: settings.learn_art1_linkText,
            isLarge: true
        },
        {
            tag: settings.learn_art2_tag,
            title: settings.learn_art2_title,
            desc: settings.learn_art2_desc,
            img: settings.learn_art2_img,
            alt: settings.learn_art2_alt,
            link: settings.learn_art2_link,
            linkText: settings.learn_art2_linkText,
            isLarge: false
        },
        {
            tag: settings.learn_art3_tag,
            title: settings.learn_art3_title,
            desc: settings.learn_art3_desc,
            img: settings.learn_art3_img,
            alt: settings.learn_art3_alt,
            link: settings.learn_art3_link,
            linkText: settings.learn_art3_linkText,
            isLarge: false
        }
    ];

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src={settings.learn_hero_img}
                    alt={settings.learn_hero_alt}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <div className={styles.amberBadge}>{settings.learn_hero_badge}</div>
                        <h1 className={styles.heroTitle}>
                            {settings.learn_hero_title} <br />
                            <span className={styles.highlight}>{settings.learn_hero_highlight}</span>
                        </h1>
                        <p className={styles.heroDesc}>
                            {settings.learn_hero_desc}
                        </p>
                    </div>

                    <div className={styles.heroWidget}>
                        <WellnessPulse settings={settings} />
                    </div>
                </div>
            </section>

            {/* 2. FEATURED GUIDES */}
            <section className={styles.contentSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.learn_insights_title}</h2>
                        <p>{settings.learn_insights_desc}</p>
                    </div>

                    <div className={styles.grid}>
                        {ARTICLES.map((art, i) => (
                            <div key={i} className={art.isLarge ? styles.cardLarge : styles.card}>
                                <div className={styles.cardImageWrapper}>
                                    <div className={styles.tag}>{art.tag}</div>
                                    <Image
                                        src={art.img}
                                        alt={art.alt}
                                        fill
                                        className={styles.articleImg}
                                    />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>{art.title}</h3>
                                    <p>{art.desc}</p>
                                    <a href={art.link} className={styles.readLink}>
                                        {art.linkText} <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. CATEGORY STRIP */}
            <section className={styles.categoryStrip}>
                <div className={styles.container}>
                    {/* Item 1 */}
                    <div className={styles.categoryItem}>
                        <BookOpen size={32} className={styles.catIcon} />
                        <h3>{settings.learn_cat1_title}</h3>
                        <p>{settings.learn_cat1_desc}</p>
                    </div>
                    {/* Item 2 */}
                    <div className={styles.categoryItem}>
                        <TrendingUp size={32} className={styles.catIcon} />
                        <h3>{settings.learn_cat2_title}</h3>
                        <p>{settings.learn_cat2_desc}</p>
                    </div>
                    {/* Item 3 */}
                    <div className={styles.categoryItem}>
                        <Lightbulb size={32} className={styles.catIcon} />
                        <h3>{settings.learn_cat3_title}</h3>
                        <p>{settings.learn_cat3_desc}</p>
                    </div>
                    {/* Item 4 */}
                    <div className={styles.categoryItem}>
                        <PlayCircle size={32} className={styles.catIcon} />
                        <h3>{settings.learn_cat4_title}</h3>
                        <p>{settings.learn_cat4_desc}</p>
                    </div>
                </div>
            </section>

        </main>
    );
}