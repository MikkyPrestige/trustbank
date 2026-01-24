import { getSiteSettings } from "@/lib/get-settings";
import styles from "./press.module.css";
import { ArrowRight, Download } from "lucide-react";

export default async function PressPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>Press & Newsroom</h1>
                <p className={styles.heroDesc}>
                    Latest updates, product launches, and company announcements from {settings.site_name}.
                </p>
            </section>

            <div className={styles.container}>
                <div className={styles.pressWrapper}>

                    {/* ITEM 1 */}
                    <div className={styles.pressItem}>
                        <div>
                            <span className={styles.pressDate}>October 24, 2024</span>
                            <h3>{settings.site_name} Surpasses 2 Million Active Users</h3>
                            <p>Milestone achievement marks rapid growth in the EMEA region.</p>
                        </div>
                        <a href="#" className={styles.pressLink}>Read <ArrowRight size={16} /></a>
                    </div>

                    {/* ITEM 2 */}
                    <div className={styles.pressItem}>
                        <div>
                            <span className={styles.pressDate}>September 10, 2024</span>
                            <h3>Launching &quot;{settings.site_name} Wealth&quot;: A New Era</h3>
                            <p>Introducing commission-free crypto and stock trading for all users.</p>
                        </div>
                        <a href="#" className={styles.pressLink}>Read <ArrowRight size={16} /></a>
                    </div>

                    {/* ITEM 3 */}
                    <div className={styles.pressItem}>
                        <div>
                            <span className={styles.pressDate}>August 15, 2024</span>
                            <h3>{settings.site_name} Partners with Visa for Global Payments</h3>
                            <p>Strategic partnership expands cross-border payment capabilities.</p>
                        </div>
                        <a href="#" className={styles.pressLink}>Read <ArrowRight size={16} /></a>
                    </div>

                    {/* MEDIA KIT CARD */}
                    <div className={styles.card}>
                        <div>
                            <h3>Media Kit</h3>
                            <p>Download official logos, executive headshots, and brand guidelines.</p>
                        </div>
                        <button className={styles.downloadBtn}>
                            <Download size={18} /> Download Kit
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}