import { getSiteSettings } from "@/lib/content/get-settings";
import Image from "next/image";
import styles from "./wealth.module.css";
import WealthSimulator from "@/components/main/wealth/WealthSimulator";
import { Gem, Briefcase, FileText, ArrowRight, UserCheck, Phone } from "lucide-react";

export default async function WealthPage() {
    const settings = await getSiteSettings();

    const SERVICES = [
        {
            title: settings.wealth_service1_title, // Investment Advisory
            desc: settings.wealth_service1_desc,
            icon: <Briefcase size={32} />,
            link: settings.wealth_service1_btn,
            href: settings.wealth_service1_id
        },
        {
            title: settings.wealth_service2_title, // Estate & Trust
            desc: settings.wealth_service2_desc,
            icon: <FileText size={32} />,
            link: settings.wealth_service2_btn,
            href: settings.wealth_service2_id
        },
        {
            title: settings.wealth_service3_title, // Retirement
            desc: settings.wealth_service3_desc,
            icon: <Gem size={32} />,
            link: settings.wealth_service3_btn,
            href: settings.wealth_service3_id
        }
    ];

    return (
        <main className={styles.main}>
            <section className={styles.heroBackground}>
                <Image
                    src={settings.wealth_hero_img}
                    alt={settings.wealth_hero_alt}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <div className={styles.goldBadge}>{settings.wealth_hero_badge}</div>
                    <h1 className={styles.heroTitle}>
                        {settings.wealth_hero_title} <br />
                        <span className={styles.highlight}>{settings.wealth_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.wealth_hero_desc}
                    </p>
                </div>
            </section>

            <section className={styles.simSection}>
                <div className={styles.container}>
                    <WealthSimulator settings={settings} />
                </div>
            </section>

            <section className={styles.servicesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.wealth_grid_title}</h2>
                        <p>{settings.wealth_grid_desc}</p>
                    </div>
                    <div className={styles.grid}>
                        {SERVICES.map((service, i) => (
                            <div key={i} className={styles.card}>
                                <div className={styles.cardIcon}>{service.icon}</div>
                                <h3>{service.title}</h3>
                                <p>{service.desc}</p>
                                <a href={service.href} className={styles.link}>
                                    {service.link} <ArrowRight size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="advisor" className={styles.advisorSection}>
                <div className={styles.container}>
                    <div className={styles.advisorBox}>
                        <div className={styles.advisorContent}>
                            <h2>{settings.wealth_advisor_title}</h2>
                            <p>{settings.wealth_advisor_desc}</p>

                            <div className={styles.checkList}>
                                <span><UserCheck size={18} /> {settings.wealth_adv_item1}</span>
                                <span><FileText size={18} /> {settings.wealth_adv_item2}</span>
                                <span><Phone size={18} /> {settings.wealth_adv_item3}</span>
                            </div>

                            <button className={styles.goldBtn}>{settings.wealth_adv_btn}</button>
                        </div>
                        <div className={styles.advisorVisual}>
                            <div className={styles.goldCircle}></div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pcg" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.productGrid}>
                        <div className={styles.productImageWrapper}>
                            <Image src={settings.wealth_pcg_img} alt={settings.wealth_pcg_img_alt} fill className={styles.productImage} />
                        </div>
                        <div className={styles.productContent}>
                            <h2 className={styles.productTitle}>{settings.wealth_pcg_title}</h2>
                            <p className={styles.productDesc}>{settings.wealth_pcg_desc}</p>
                            <a href={settings.wealth_pcg_anchor} className={styles.link}>
                                <button className={styles.productBtn}>{settings.wealth_pcg_btn} <ArrowRight size={18} /></button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="retirement" className={`${styles.productSection} ${styles.bgAlt}`}>
                <div className={styles.container}>
                    <div className={`${styles.productGrid} ${styles.reverseGrid}`}>
                        <div className={styles.productContent}>
                            <h2 className={styles.productTitle}>{settings.wealth_ret_title}</h2>
                            <p className={styles.productDesc}>{settings.wealth_ret_desc}</p>
                            <a href={settings.wealth_ret_anchor} className={styles.link}>
                                <button className={styles.productBtn}>{settings.wealth_ret_btn} <ArrowRight size={18} /></button>
                            </a>
                        </div>
                        <div className={styles.productImageWrapper}>
                            <Image src={settings.wealth_ret_img} alt={settings.wealth_ret_img_alt} fill className={styles.productImage} />
                        </div>
                    </div>
                </div>
            </section>

            <section id="estate" className={styles.productSection}>
                <div className={styles.container}>
                    <div className={styles.productGrid}>
                        <div className={styles.productImageWrapper}>
                            <Image src={settings.wealth_est_img} alt={settings.wealth_est_img_alt} fill className={styles.productImage} />
                        </div>
                        <div className={styles.productContent}>
                            <h2 className={styles.productTitle}>{settings.wealth_est_title}</h2>
                            <p className={styles.productDesc}>{settings.wealth_est_desc}</p>
                            <a href={settings.wealth_est_anchor} className={styles.link}>
                                <button className={styles.productBtn}>{settings.wealth_est_btn} <ArrowRight size={18} /></button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}