import Link from "next/link";
import Image from "next/image";
import { Apple, Play, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function FinalCTA() {
    const settings = await getSiteSettings();

    return (
        <section className={styles.ctaSection}>
            <div className={styles.container}>

                <div className={styles.ctaCardWrapper}>
                    <div className={styles.ctaMeshGradient}></div>

                    <div className={styles.ctaGrid}>
                        <div className={styles.ctaContentLeft}>
                            <div className={styles.ctaBadge}>
                                <Shield size={16} /> {settings.home_cta_badge}
                            </div>
                            <h2>{settings.home_cta_title}</h2>
                            <p>
                                {settings.home_cta_desc}
                            </p>

                            <div className={styles.ctaBenefitsList}>
                                <div className={styles.benefitItem}>
                                    <CheckCircle2 size={20} className={styles.checkIcon} />
                                    {settings.home_cta_benefit_1}
                                </div>
                                <div className={styles.benefitItem}>
                                    <CheckCircle2 size={20} className={styles.checkIcon} />
                                    {settings.home_cta_benefit_2}
                                </div>
                                <div className={styles.benefitItem}>
                                    <CheckCircle2 size={20} className={styles.checkIcon} />
                                    {settings.home_cta_benefit_3}
                                </div>
                            </div>

                            <div className={styles.ctaButtonRow}>
                                <a href={settings.home_cta_apple_link} target="_blank" rel="noopener noreferrer" className={styles.appStoreBtn}>
                                    <Apple size={24} fill="currentColor" />
                                    <div className={styles.btnText}>
                                        <small>{settings.home_cta_apple_small}</small>
                                        <span>{settings.home_cta_apple_large}</span>
                                    </div>
                                </a>

                                <a href={settings.home_cta_google_link} target="_blank" rel="noopener noreferrer" className={styles.googlePlayBtn}>
                                    <Play size={24} fill="currentColor" />
                                    <div className={styles.btnText}>
                                        <small>{settings.home_cta_google_small}</small>
                                        <span>{settings.home_cta_google_large}</span>
                                    </div>
                                </a>
                            </div>

                            <Link href={settings.home_cta_web_link} className={styles.ctaWebLink}>
                                {settings.home_cta_web_text} <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className={styles.ctaVisualRight}>
                            <Image
                                src={settings.home_cta_img}
                                alt={`${settings.site_name} ${settings.home_cta_alt}`}
                                width={500}
                                height={500}
                                className={styles.ctaImage}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}