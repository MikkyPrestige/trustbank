import { getSiteSettings } from "@/lib/get-settings";
import styles from "./about.module.css";
import { Users, Globe, ShieldCheck } from "lucide-react";

export default async function AboutPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>We are {settings.site_name}</h1>
                <p className={styles.heroDesc}>
                    Building the financial infrastructure for the next generation.
                    Transparent, secure, and built entirely around you.
                </p>
            </section>

            {/* STATS */}
            <section className={styles.statsStrip}>
                <div className={styles.container} style={{ padding: 0 }}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>2M+</span>
                            <span className={styles.statLabel}>Active Users</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>$12B</span>
                            <span className={styles.statLabel}>Assets Protected</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>40+</span>
                            <span className={styles.statLabel}>Countries</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNum}>24/7</span>
                            <span className={styles.statLabel}>Human Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* MISSION */}
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Our Mission</h2>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><ShieldCheck size={32} /></div>
                        <h3>Uncompromising Security</h3>
                        <p>We use military-grade encryption and real-time fraud detection to keep your money safe.</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Globe size={32} /></div>
                        <h3>Border-less Banking</h3>
                        <p>Money shouldn&apos;t have borders. Move funds globally instantly with zero hidden fees.</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Users size={32} /></div>
                        <h3>People First</h3>
                        <p>We are a bank built by people, for people. We treat every customer like a partner.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}