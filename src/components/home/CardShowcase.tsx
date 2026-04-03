import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Zap, Globe } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function CardShowcase() {
    const settings = await getSiteSettings();

    return (
        <section className={styles.cardSection}>
            <div className={styles.container}>
                <div className={styles.cardGrid}>
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
                            {settings.home_card_desc} {settings.site_name}.
                        </p>

                        <div className={styles.cardFeatures}>
                            <div className={styles.featureItem}>
                                <Globe size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>{settings.home_card_feat_1}</strong>
                                    <p>{settings.home_card_feat_1_desc}</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <ShieldCheck size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>{settings.home_card_feat_2}</strong>
                                    <p>{settings.home_card_feat_2_desc}</p>
                                </div>
                            </div>

                            <div className={styles.featureItem}>
                                <Zap size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>{settings.home_card_feat_3}</strong>
                                    <p>{settings.home_card_feat_3_desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <Link href={settings.home_card_btn1_link} className={styles.btnGold}>
                                {settings.home_card_btn1_text}
                            </Link>
                            <Link href={settings.home_card_btn2_link} className={styles.linkWhite}>
                                {settings.home_card_btn2_text} <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className={styles.cardVisual}>
                        <div className={styles.goldGlow}></div>
                        <Image
                            src={settings.home_card_img}
                            alt={`${settings.site_name} ${settings.home_card_alt}`}
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