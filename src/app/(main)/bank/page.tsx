import Image from "next/image";
import styles from "./bank.module.css";
import DebitCard3D from "@/components/bank/DebitCard3D";
import { Zap, Smartphone, Globe, Check, X, ArrowRight } from "lucide-react";

export default function BankPage() {
    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/bank-hero.png"
                    alt="Paying with TrustBank Card"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Banking at the <br />
                        <span className={styles.highlight}>speed of life.</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        Get paid up to 2 days early, enjoy fee-free overdrafts, and manage your money
                        with a card that demands attention.
                    </p>
                    <div className={styles.heroActions}>
                        <button className={styles.primaryBtn}>Open Account</button>
                        <button className={styles.secondaryBtn}>View Features</button>
                    </div>
                </div>
            </section>

            {/* 2. CARD SHOWCASE SECTION */}
            <section className={styles.cardSection}>
                <div className={styles.container}>
                    <div className={styles.cardGrid}>
                        <div className={styles.cardText}>
                            <div className={styles.badge}>Titanium Design</div>
                            <h2>The card that turns heads.</h2>
                            <p>
                                Milled from a single sheet of aerospace-grade metal.
                                No plastic, no numbers on the front, just pure security and style.
                            </p>
                            <ul className={styles.featureList}>
                                <li><Check size={20} className={styles.check} /> Contactless & Chip Enabled</li>
                                <li><Check size={20} className={styles.check} /> Instant Lock/Unlock in App</li>
                                <li><Check size={20} className={styles.check} /> Zero Foreign Transaction Fees</li>
                            </ul>
                        </div>
                        <div className={styles.cardVisual}>
                            <DebitCard3D />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. FEATURES GRID */}
            <section className={styles.featureSection}>
                <div className={styles.container}>
                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <div className={styles.iconBox}><Zap size={28} /></div>
                            <h3>Early Payday</h3>
                            <p>Direct deposits land in your account up to 2 days faster than traditional banks.</p>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.iconBox}><Smartphone size={28} /></div>
                            <h3>Instant Alerts</h3>
                            <p>Real-time notifications for every transaction. You will always know where your money goes.</p>
                        </div>
                        <div className={styles.featureItem}>
                            <div className={styles.iconBox}><Globe size={28} /></div>
                            <h3>Fee-Free Travel</h3>
                            <p>Spend globally with the real exchange rate and zero hidden fees at 55,000+ ATMs.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. COMPARISON TABLE */}
            <section className={styles.compareSection}>
                <div className={styles.container}>
                    <div className={styles.compareHeader}>
                        <h2>Stop paying to hold your own money.</h2>
                        <p>We believe banking should be free, simple, and transparent.</p>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.compareTable}>
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th className={styles.thTrust}>TrustBank</th>
                                    <th>Traditional Banks</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Monthly Maintenance Fee</td>
                                    <td className={styles.tdTrust}>$0</td>
                                    <td>$12 - $25</td>
                                </tr>
                                <tr>
                                    <td>Overdraft Fees</td>
                                    <td className={styles.tdTrust}>$0</td>
                                    <td>$35 per item</td>
                                </tr>
                                <tr>
                                    <td>Foreign Transaction Fees</td>
                                    <td className={styles.tdTrust}>0%</td>
                                    <td>3%</td>
                                </tr>
                                <tr>
                                    <td>Minimum Balance</td>
                                    <td className={styles.tdTrust}>$0</td>
                                    <td>$1,500</td>
                                </tr>
                                <tr>
                                    <td>Early Direct Deposit</td>
                                    <td className={styles.tdTrust}><Check size={20} /></td>
                                    <td><X size={20} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

        </main>
    );
}