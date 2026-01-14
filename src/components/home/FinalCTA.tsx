import Link from "next/link";
import Image from "next/image";
import { Apple, Play, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import styles from "@/app/home.module.css";

export default function FinalCTA() {
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
                            <h2>Stop just banking. <br />Start building.</h2>
                            <p>
                                Join over 2 million members who have upgraded their financial life with TrustBank.
                                Open an account in minutes and experience the difference.
                            </p>

                            <div className={styles.ctaBenefitsList}>
                                <div className={styles.benefitItem}><CheckCircle2 size={20} className={styles.checkIcon} /> No hidden fees</div>
                                <div className={styles.benefitItem}><CheckCircle2 size={20} className={styles.checkIcon} /> FDIC Insured up to $250k</div>
                                <div className={styles.benefitItem}><CheckCircle2 size={20} className={styles.checkIcon} /> Get paid 2 days early</div>
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
                                src="/cta-visual.png"
                                alt="TrustBank App and Card"
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