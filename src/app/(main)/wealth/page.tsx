import { getSiteSettings } from "@/lib/get-settings";
import Image from "next/image";
import styles from "./wealth.module.css";
import WealthSimulator from "@/components/main/wealth/WealthSimulator";
import { Gem, Briefcase, FileText, ArrowRight, UserCheck, Phone } from "lucide-react";

export default async function WealthPage() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>

            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src="/wealth-hero.png"
                    alt="Retirement Freedom"
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.goldBadge}>Private Client Group</div>
                    <h1 className={styles.heroTitle}>
                        {settings.wealth_hero_title} <br />
                        <span className={styles.highlight}>{settings.wealth_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.wealth_hero_desc}
                    </p>
                </div>
            </section>

            {/* 2. SIMULATOR SECTION */}
            <section className={styles.simSection}>
                <div className={styles.container}>
                    <WealthSimulator />
                </div>
            </section>

            {/* 3. SERVICES GRID */}
            <section className={styles.servicesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Wealth Management Solutions</h2>
                        <p>Tailored strategies for high-net-worth individuals and families.</p>
                    </div>

                    <div className={styles.grid}>
                        {/* Service 1 */}
                        <div className={styles.card}>
                            <div className={styles.cardIcon}><Briefcase size={32} /></div>
                            <h3>Investment Advisory</h3>
                            <p>
                                Active portfolio management tailored to your timeline. Access exclusive
                                equities, private credit, and alternative investments.
                            </p>
                            <a href="#" className={styles.link}>Meet an Advisor <ArrowRight size={16} /></a>
                        </div>

                        {/* Service 2 */}
                        <div className={styles.card}>
                            <div className={styles.cardIcon}><FileText size={32} /></div>
                            <h3>Estate & Trust</h3>
                            <p>
                                Ensure your wealth is transferred efficiently. Our fiduciaries help
                                structure trusts to minimize tax liability and protect heirs.
                            </p>
                            <a href="#" className={styles.link}>Estate Planning <ArrowRight size={16} /></a>
                        </div>

                        {/* Service 3 */}
                        <div className={styles.card}>
                            <div className={styles.cardIcon}><Gem size={32} /></div>
                            <h3>Retirement Planning</h3>
                            <p>
                                Whether you are accumulating or distributing, we build IRA, 401(k),
                                and pension strategies that outlast market volatility.
                            </p>
                            <a href="#" className={styles.link}>Rollover Options <ArrowRight size={16} /></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. THE "FIDUCIARY" PROMISE */}
            <section className={styles.advisorSection}>
                <div className={styles.container}>
                    <div className={styles.advisorBox}>
                        <div className={styles.advisorContent}>
                            <h2>{settings.wealth_advisor_title}</h2>
                            <p>
                                {settings.wealth_advisor_desc}
                            </p>
                            <div className={styles.checkList}>
                                <span><UserCheck size={18} /> Dedicated Wealth Manager</span>
                                <span><FileText size={18} /> Quarterly Strategy Reviews</span>
                                <span><Phone size={18} /> 24/7 Private Line</span>
                            </div>
                            <button className={styles.goldBtn}>Schedule a Consultation</button>
                        </div>
                        {/* Abstract Gold Graphic */}
                        <div className={styles.advisorVisual}>
                            <div className={styles.goldCircle}></div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}