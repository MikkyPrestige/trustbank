import { getSiteSettings } from "@/lib/get-settings";
import styles from "./contact.module.css";
import { Phone, Mail, MessageCircle } from "lucide-react";

export default async function ContactPage() {
    const settings = await getSiteSettings();

    const supportEmail = `support@${settings.site_name.toLowerCase().replace(/\s+/g, '')}.com`;

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>Contact {settings.site_name}</h1>
                <p className={styles.heroDesc}>
                    Have a question? We are here to help 24/7.
                </p>
            </section>

            <div className={styles.container}>
                <div className={styles.grid}>

                    {/* EMERGENCY CARD */}
                    <div className={`${styles.card} ${styles.emergencyCard}`}>
                        <div className={`${styles.iconBox} ${styles.emergencyIconBox}`}>
                            <Phone size={24} />
                        </div>
                        <h3 className={styles.emergencyTitle}>Lost or Stolen Card?</h3>
                        <p>Call our emergency hotline immediately to freeze your account.</p>
                        <p className={styles.emergencyPhone}>+1 (800) 555-9111</p>
                    </div>

                    {/* GENERAL SUPPORT */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><MessageCircle size={24} /></div>
                        <h3>Existing Customers</h3>
                        <p>The fastest way to get help is via the secure messenger in your dashboard.</p>
                        <a href="/dashboard" className={styles.actionLink}>
                            Log in to Chat &rarr;
                        </a>
                    </div>

                    {/* EMAIL */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Mail size={24} /></div>
                        <h3>General Inquiries</h3>
                        <p>For partnership opportunities or media inquiries.</p>
                        <p className={styles.emailWrapper}>
                            <a href={`mailto:${supportEmail}`} className={styles.emailLink}>
                                {supportEmail}
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}