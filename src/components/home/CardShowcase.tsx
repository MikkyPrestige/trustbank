import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Zap, Globe } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/get-settings"; // 👈 Import Fetcher

export default async function CardShowcase() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    return (
        <section className={styles.cardSection}>
            <div className={styles.container}>
                <div className={styles.cardGrid}>

                    {/* Left: Content */}
                    <div className={styles.cardContent}>
                        <div className={styles.tagline}>
                            <div className={styles.taglineLine}></div>
                            <span>{settings.home_card_series}</span>
                        </div>

                        <h2 className={styles.cardTitle}>
                            {settings.home_card_title} <br />
                            <span className={styles.goldText}>{settings.home_card_highlight}</span>
                        </h2>

                        <p className={styles.cardDesc}>
                            {settings.home_card_desc}
                        </p>

                        <div className={styles.cardFeatures}>
                            <div className={styles.featureItem}>
                                <Globe size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>{settings.home_card_feat_1}</strong>
                                    <p>Spend globally like a local. 0% fees on international transactions.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <ShieldCheck size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>{settings.home_card_feat_2}</strong>
                                    <p>Your purchases are insured up to $10,000 against damage or theft.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <Zap size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>{settings.home_card_feat_3}</strong>
                                    <p>Earn 3x points on travel and dining. Redeem instantly in the app.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <Link href="/register" className={styles.btnGold}>
                                Apply Now
                            </Link>
                            <Link href="/cards" className={styles.linkWhite}>
                                Compare Cards <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Right: The Floating Card Visual */}
                    <div className={styles.cardVisual}>
                        <div className={styles.goldGlow}></div>

                        <Image
                            src="/card-front.png"
                            alt={`${settings.site_name} Onyx Card`}
                            width={600}
                            height={400}
                            className={styles.realCard}
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}