import { getSiteSettings } from "@/lib/content/get-settings";
import styles from "./security.module.css";
import Image from "next/image";
import { Lock, Smartphone, ShieldAlert, Eye, Mail } from "lucide-react";

export default async function SecurityPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className={styles.heroImageWrapper}>
                    <Image
                        src={settings.security_hero_img}
                        alt={settings.security_hero_alt}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                    <div className={styles.heroOverlay} />
                </div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {settings.security_hero_title}
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.security_hero_desc}
                    </p>
                </div>
            </section>

            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Lock size={24} /></div>
                        <h3>{settings.security_feat1_title}</h3>
                        <p>{settings.security_feat1_desc}</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Smartphone size={24} /></div>
                        <h3>{settings.security_feat2_title}</h3>
                        <p>{settings.security_feat2_desc}</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Eye size={24} /></div>
                        <h3>{settings.security_feat3_title}</h3>
                        <p>{settings.security_feat3_desc}</p>
                    </div>
                </div>

                <div className={styles.fraudSection}>
                    <h2 className={styles.sectionTitle}>
                        {settings.security_fraud_title}
                    </h2>
                    <div className={`${styles.card} ${styles.fraudCard}`}>
                        <div className={styles.fraudIconWrapper}>
                            <ShieldAlert size={32} className={styles.fraudIcon} />
                        </div>
                        <div className={styles.fraudContent}>
                            <h3>{settings.security_fraud_card_title}</h3>
                            <p>{settings.security_fraud_card_desc}</p>
                            <p className={styles.fraudAction}>
                                {settings.security_fraud_card_action} <strong>{settings.support_phone}</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.helpSection}>
                    <p>
                        {settings.security_help}
                        <a href={`mailto:${settings.support_email}`} className={styles.link}> {settings.security_help_linkText} <Mail size={14} style={{ display: 'inline', marginLeft: 4 }} /></a>
                    </p>
                </div>
            </div>
        </main>
    );
}