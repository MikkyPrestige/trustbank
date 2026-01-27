import { getSiteSettings } from "@/lib/content/get-settings";
import styles from "./about.module.css";
import Image from "next/image";
import { Users, Globe, ShieldCheck } from "lucide-react";

export default async function AboutPage() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION  */}
            <section className={styles.heroBackground}>
                <Image
                    src={settings.about_hero_img || "/about-hero.png"}
                    alt={settings.about_hero_alt || "TrustBank Team"}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{settings.about_hero_title}</h1>
                    <p className={styles.heroDesc}>
                        {settings.about_hero_desc}
                    </p>
                </div>
            </section>

            {/* 2. STATS STRIP */}
            <section className={styles.statsStrip}>
                <div className={styles.container} style={{ padding: 0 }}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>{settings.about_stat_users}</span>
                            <span className={styles.statLabel}>Active Users</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>{settings.about_stat_assets}</span>
                            <span className={styles.statLabel}>Assets Protected</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>{settings.about_stat_countries}</span>
                            <span className={styles.statLabel}>Countries</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>{settings.about_stat_support}</span>
                            <span className={styles.statLabel}>Human Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. MISSION CARDS */}
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Our Mission</h2>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><ShieldCheck size={32} /></div>
                        <h3>{settings.about_mission1_title}</h3>
                        <p>{settings.about_mission1_desc}</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Globe size={32} /></div>
                        <h3>{settings.about_mission2_title}</h3>
                        <p>{settings.about_mission2_desc}</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Users size={32} /></div>
                        <h3>{settings.about_mission3_title}</h3>
                        <p>{settings.about_mission3_desc}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}