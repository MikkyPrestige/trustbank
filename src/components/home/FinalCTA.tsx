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
                    {/* Background Gradient Mesh */}
                    <div className={styles.ctaMeshGradient}></div>

                    <div className={styles.ctaGrid}>
                        {/* LEFT SIDE: TEXT & ACTIONS */}
                        <div className={styles.ctaContentLeft}>
                            <div className={styles.ctaBadge}>
                                <Shield size={16} /> Secure & Insured
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
                                <button className={styles.appStoreBtn}>
                                    <Apple size={24} fill="currentColor" />
                                    <div className={styles.btnText}>
                                        <small>Download on the</small>
                                        <span>App Store</span>
                                    </div>
                                </button>

                                <button className={styles.googlePlayBtn}>
                                    <Play size={24} fill="currentColor" />
                                    <div className={styles.btnText}>
                                        <small>Get it on</small>
                                        <span>Google Play</span>
                                    </div>
                                </button>
                            </div>

                            <Link href="/register" className={styles.ctaWebLink}>
                                Or create an account on the web <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* RIGHT SIDE: THE VISUAL */}
                        <div className={styles.ctaVisualRight}>
                            <Image
                                src={settings.home_cta_img || "/cta-visual.png"}
                                alt={settings.home_cta_alt || `${settings.site_name} Mobile App`}
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