import { getSiteSettings } from "@/lib/get-settings";
import styles from "./security.module.css";
import { Lock, Smartphone, ShieldAlert, Eye } from "lucide-react";

export default async function SecurityPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>Security Center</h1>
                <p className={styles.heroDesc}>
                    Your security is our top priority. Learn how {settings.site_name} protects your data and assets.
                </p>
            </section>

            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Lock size={24} /></div>
                        <h3>256-bit Encryption</h3>
                        <p>All data is encrypted at rest and in transit using the same standards as the military.</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Smartphone size={24} /></div>
                        <h3>Biometric Access</h3>
                        <p>Secure your account with Face ID or Touch ID on our mobile app.</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Eye size={24} /></div>
                        <h3>Real-time Monitoring</h3>
                        <p>Our AI systems monitor transactions 24/7 to detect and block suspicious activity instantly.</p>
                    </div>
                </div>

                <div className={styles.fraudSection}>
                    <h2 className={styles.sectionTitle}>How to spot fraud</h2>

                    <div className={`${styles.card} ${styles.fraudCard}`}>
                        <ShieldAlert size={32} className={styles.fraudIcon} />
                        <div>
                            <h3>We will never ask for your password</h3>
                            <p>
                                Phishing scammers often pretend to be bank support. {settings.site_name} employees will{' '}
                                <strong>never</strong> ask for your password, PIN, or 2FA code over the phone or email.
                                If someone asks, hang up and call us.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}