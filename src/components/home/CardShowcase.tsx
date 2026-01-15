import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShieldCheck, Zap, Globe } from "lucide-react";
import styles from "./home.module.css";

export default function CardShowcase() {
    return (
        <section className={styles.cardSection}>
            <div className={styles.container}>
                <div className={styles.cardGrid}>

                    {/* Left: Content */}
                    <div className={styles.cardContent}>
                        <div className={styles.tagline}>
                            <div className={styles.taglineLine}></div>
                            <span>THE ONYX SERIES</span>
                        </div>

                        <h2 className={styles.cardTitle}>
                            One Card. <br />
                            <span className={styles.goldText}>Infinite Possibilities.</span>
                        </h2>

                        <p className={styles.cardDesc}>
                            Experience the power of the TrustBank Onyx Visa®. Crafted from solid metal
                            and engineered for those who demand more from their money.
                        </p>

                        <div className={styles.cardFeatures}>
                            <div className={styles.featureItem}>
                                <Globe size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>No Foreign Fees</strong>
                                    <p>Spend globally like a local. 0% fees on international transactions.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <ShieldCheck size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>Purchase Protection</strong>
                                    <p>Your purchases are insured up to $10,000 against damage or theft.</p>
                                </div>
                            </div>
                            <div className={styles.featureItem}>
                                <Zap size={24} className={styles.goldIcon} />
                                <div>
                                    <strong>Instant Rewards</strong>
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

                        {/* ⚠️ Ensure this is the TRANSPARENT PNG you generated in Canva */}
                        <Image
                            src="/card-front.png"
                            alt="TrustBank Onyx Card"
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