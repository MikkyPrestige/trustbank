import { getSiteSettings } from "@/lib/get-settings"; // 👈 Import Fetcher
import Image from "next/image";
import styles from "./payments.module.css";
import TransferEstimator from "@/components/main/payments/TransferEstimator";
import { Zap, Smartphone, CreditCard, Mail, Building, ArrowRight, RefreshCw } from "lucide-react";

export default async function PaymentsPage() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/payments-hero.png"
                    alt="Digital Payments"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.neonBadge}><Zap size={14} /> Instant Settlement</div>
                    <h1 className={styles.heroTitle}>
                        {settings.payments_hero_title} <br />
                        <span className={styles.highlight}>{settings.payments_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.payments_hero_desc}
                    </p>
                </div>

                {/* Overlapping Interactive Component */}
                <div className={styles.heroWidget}>
                    {/* 2. Pass CMS data to Client Component */}
                    <TransferEstimator
                        title={settings.payments_widget_title}
                        desc={settings.payments_widget_desc}
                        feeLabel={settings.payments_widget_fee_label}
                        feeValue={settings.payments_widget_fee_value}
                    />
                </div>
            </section>

            {/* 2. PAYMENT METHODS GRID */}
            <section className={styles.methodsSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.payments_methods_title}</h2>
                        <p>{settings.payments_methods_desc}</p>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.iconBox}><Smartphone size={32} /></div>
                            <h3>P2P Transfer</h3>
                            <p>Send cash instantly to friends using just their email or phone number. Works with Zelle®.</p>
                            <a href="#" className={styles.link}>Send Money <ArrowRight size={16} /></a>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.iconBox}><RefreshCw size={32} /></div>
                            <h3>Bill Pay & AutoPay</h3>
                            <p>Never miss a due date. Schedule recurring payments for utilities, rent, and subscriptions.</p>
                            <a href="#" className={styles.link}>Setup AutoPay <ArrowRight size={16} /></a>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.iconBox}><CreditCard size={32} /></div>
                            <h3>Loan Center</h3>
                            <p>Manage your {settings.site_name} Auto, Home, or Personal loans. Make one-time principal payments easily.</p>
                            <a href="#" className={styles.link}>Manage Loans <ArrowRight size={16} /></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TRADITIONAL PAYMENTS */}
            <section className={styles.utilityStrip}>
                <div className={styles.container}>
                    <div className={styles.utilityRow}>
                        <div className={styles.utilityItem}>
                            <Mail size={24} className={styles.utilIcon} />
                            <div>
                                <h4>Pay by Mail</h4>
                                <p>Get mailing addresses for checks</p>
                            </div>
                        </div>
                        <div className={styles.utilityItem}>
                            <Building size={24} className={styles.utilIcon} />
                            <div>
                                <h4>Pay at Branch</h4>
                                <p>Find a location near you</p>
                            </div>
                        </div>
                        <div className={styles.utilityItem}>
                            <CreditCard size={24} className={styles.utilIcon} />
                            <div>
                                <h4>Wire Transfer</h4>
                                <p>Domestic & Swift instructions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}