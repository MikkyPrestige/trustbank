import { getSiteSettings } from "@/lib/content/get-settings";
import { getPressReleases } from "@/lib/content/get-press";
import styles from "./press.module.css";
import Image from "next/image";
import { ArrowRight, Download, Mail, Calendar } from "lucide-react";
import Link from "next/link";

export default async function PressPage() {
    const [settings, releases] = await Promise.all([
        getSiteSettings(),
        getPressReleases()
    ]);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date));
    };

    return (
        <main className={styles.main}>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroImageWrapper}>
                    <Image
                        src={settings.press_hero_img || "/press-hero.png"}
                        alt={settings.press_hero_img_alt || "Press Newsroom"}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                    <div className={styles.heroOverlay} />
                </div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{settings.press_hero_title}</h1>
                    <p className={styles.heroDesc}>{settings.press_hero_desc}</p>

                    <div className={styles.heroContact}>
                        <Mail size={16} /> Press Contact:
                        <a href={`mailto:${settings.press_contact_email}`} className={styles.contactLink}>
                            {settings.press_contact_email}
                        </a>
                    </div>
                </div>
            </section>

            <div className={styles.container}>
                <div className={styles.contentGrid}>
                    {/* LEFT: NEWS LIST */}
                    <div className={styles.newsColumn}>
                        <h2 className={styles.sectionTitle}>{settings.press_release_title}</h2>
                        <div className={styles.pressList}>
                            {releases.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{settings.press_empty_state}</p>
                                </div>
                            ) : (
                                releases.map((item) => (
                                    <div key={item.id} className={styles.pressItem}>
                                        <div className={styles.metaRow}>
                                            <span className={styles.categoryBadge}>{item.category}</span>
                                            <span className={styles.date}>
                                                <Calendar size={12} /> {formatDate(item.date)}
                                            </span>
                                        </div>

                                        <h3>{item.title}</h3>
                                        <p className={styles.summary}>{item.summary}</p>

                                        <Link href={item.link || "#"} className={styles.readLink}>
                                            {settings.press_read_more_text} <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: SIDEBAR */}
                    <aside className={styles.sidebar}>
                        <div className={styles.mediaCard}>
                            <h3>{settings.press_kit_title}</h3>
                            <p>{settings.press_kit_desc}</p>
                            <div className={styles.kitPreview}>
                                <div className={styles.fileIcon}>{settings.press_file_icon}</div>
                                <div className={styles.fileInfo}>
                                    <span>{settings.press_file_name}</span>
                                    <span className={styles.fileSize}>{settings.press_file_size}</span>
                                </div>
                            </div>

                            <a href={settings.press_kit_link} className={styles.downloadBtn}>
                                <Download size={18} /> {settings.press_download_btn_text}
                            </a>
                        </div>

                        <div className={styles.infoCard}>
                            <h4>{settings.press_about_title}</h4>
                            <p className={styles.tinyText}>
                                {settings.press_about_desc}
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
        </main>
    );
}