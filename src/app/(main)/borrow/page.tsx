import { getSiteSettings } from "@/lib/content/get-settings";
import LoanCalculator from '@/components/main/borrow/LoanCalculator';
import { CreditCard, Home, Car, GraduationCap, ArrowRight, ShieldCheck, Zap, Percent, Banknote } from 'lucide-react';
import Image from 'next/image';
import styles from './borrow.module.css';

export default async function BorrowPage() {
    const settings = await getSiteSettings();

    // 1. ANCHOR SECTIONS
    const ANCHORS = [
        {
            id: 'cc',
            title: settings.borrow_cc_title,
            desc: settings.borrow_cc_desc,
            btn: settings.borrow_cc_btn,
            img: settings.borrow_cc_img,
            alt: settings.borrow_cc_img_alt,
            link: settings.borrow_cc_link
        },
        {
            id: 'pl',
            title: settings.borrow_pl_title,
            desc: settings.borrow_pl_desc,
            btn: settings.borrow_pl_btn,
            img: settings.borrow_pl_img,
            alt: settings.borrow_pl_img_alt,
            link: settings.borrow_pl_link
        },
        {
            id: 'mt',
            title: settings.borrow_mt_title,
            desc: settings.borrow_mt_desc,
            btn: settings.borrow_mt_btn,
            img: settings.borrow_mt_img,
            alt: settings.borrow_mt_img_alt,
            link: settings.borrow_mt_link
        },
        {
            id: 'al',
            title: settings.borrow_al_title,
            desc: settings.borrow_al_desc,
            btn: settings.borrow_al_btn,
            img: settings.borrow_al_img,
            alt: settings.borrow_al_img_alt,
            link: settings.borrow_al_link
        },
        {
            id: 'sl',
            title: settings.borrow_sl_title,
            desc: settings.borrow_sl_desc,
            btn: settings.borrow_sl_btn,
            img: settings.borrow_sl_img,
            alt: settings.borrow_sl_img_alt,
            link: settings.borrow_sl_link
        },
        {
            id: 'he',
            title: settings.borrow_he_title,
            desc: settings.borrow_he_desc,
            btn: settings.borrow_he_btn,
            img: settings.borrow_he_img,
            alt: settings.borrow_he_alt,
            link: settings.borrow_he_link
        },
    ];

    // 2. RATE GRID
    const RATE_PRODUCTS = [
        {
            title: settings.borrow_prod1_title, // Personal Loan
            desc: settings.borrow_prod1_desc,
            icon: <Banknote size={32} className={styles.iconGreen} />,
            rate: `From ${settings.rate_personal_apr}% APR`,
            link: settings.borrow_prod1_link
        },
        {
            title: settings.borrow_prod2_title, // Mortgage
            desc: settings.borrow_prod2_desc,
            icon: <Home size={32} className={styles.iconBlue} />,
            rate: settings.rate_mortgage_label,
            link: settings.borrow_prod2_link
        },
        {
            title: settings.borrow_prod3_title, // Auto
            desc: settings.borrow_prod3_desc,
            icon: <Car size={32} className={styles.iconOrange} />,
            rate: `From ${settings.rate_auto_apr}% APR`,
            link: settings.borrow_prod3_link
        },
        {
            title: settings.borrow_prod4_title, // Student
            desc: settings.borrow_prod4_desc,
            icon: <GraduationCap size={32} className={styles.iconPurple} />,
            rate: settings.rate_student_label,
            link: settings.borrow_prod4_link
        },
        {
            title: settings.borrow_prod5_title, // Credit Card
            desc: settings.borrow_prod5_desc,
            icon: <CreditCard size={32} className={styles.iconRed} />,
            rate: `${settings.rate_credit_intro_apr} Intro APR`,
            link: settings.borrow_prod5_link
        },
        {
            title: settings.borrow_prod6_title, // Home Equity
            desc: settings.borrow_prod6_desc,
            icon: <Percent size={32} className={styles.iconGold} />,
            rate: settings.rate_home_equity_label,
            link: settings.borrow_prod6_link
        }
    ];

    return (
        <main className={styles.main}>
            {/* 1. HERO SECTION */}
            <section className={styles.heroBackground}>
                <Image
                    src={settings.borrow_hero_img}
                    alt={settings.borrow_hero_alt}
                    fill
                    className={styles.heroBgImage}
                    priority
                />
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContentCentered}>
                    <h1 className={styles.heroTitle}>
                        {settings.borrow_hero_title} <br />
                        <span className={styles.highlight}>{settings.borrow_hero_highlight}</span>
                    </h1>
                    <p className={styles.heroDesc}>
                        {settings.borrow_hero_desc}
                    </p>

                    <div className={styles.heroStatsRow}>
                        <div className={styles.statPill}>
                            <strong>{settings.borrow_stat_funded}</strong> {settings.borrow_stat_funded_text}
                        </div>
                        <div className={styles.statPill}>
                            <strong>{settings.borrow_stat_speed}</strong> {settings.borrow_stat_speed_text}
                        </div>
                        <div className={styles.statPill}>
                            <strong>{settings.borrow_stat_approval}</strong> {settings.borrow_stat_approval_text}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CALCULATOR SECTION */}
            <section className={styles.calcSection}>
                <div className={styles.container}>
                    <LoanCalculator defaultRate={Number(settings.rate_personal_apr)} settings={settings} />
                </div>
            </section>

            {/* 3. ANCHOR SECTIONS */}
            {ANCHORS.map((p, i) => (
                <section key={p.id} id={p.id} className={`${styles.productSection} ${i % 2 !== 0 ? styles.bgAlt : ''}`}>
                    <div className={styles.container}>
                        <div className={`${styles.productGrid} ${i % 2 !== 0 ? styles.reverseGrid : ''}`}>
                            <div className={styles.productContent}>
                                <h2 className={styles.productTitle}>{p.title}</h2>
                                <p className={styles.productDesc}>{p.desc}</p>
                                <a href={p.link} className={styles.productBtn}>
                                    {p.btn} <ArrowRight size={18} />
                                </a>
                            </div>
                            <div className={styles.productImageWrapper}>
                                <Image
                                    src={p.img}
                                    alt={p.alt || p.title}
                                    fill
                                    className={styles.productImage}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* 4. RATE GRID  */}
            <section className={styles.productsSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>{settings.borrow_grid_title}</h2>
                        <p>{settings.borrow_grid_desc}</p>
                    </div>
                    <div className={styles.rateGrid}>
                        {RATE_PRODUCTS.map((product, i) => (
                            <div key={i} className={styles.productCard}>
                                <div className={styles.cardHeader}>
                                    {product.icon}
                                    <span className={styles.rateBadge}>{product.rate}</span>
                                </div>
                                <h3>{product.title}</h3>
                                <p>{product.desc}</p>
                                <a href={product.link} className={styles.cardLink}>
                                    {settings.borrow_prod_btn_text} <ArrowRight size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. TRUST STRIP */}
            <section className={styles.trustStrip}>
                <div className={styles.container}>
                    <div className={styles.trustGrid}>
                        <div className={styles.trustItem}>
                            <ShieldCheck size={40} className={styles.iconBlue} />
                            <div>
                                <h4>{settings.borrow_trust1_title}</h4>
                                <p>{settings.borrow_trust1_desc}</p>
                            </div>
                        </div>
                        <div className={styles.trustItem}>
                            <Zap size={40} className={styles.iconYellow} />
                            <div>
                                <h4>{settings.borrow_trust2_title}</h4>
                                <p>{settings.borrow_trust2_desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}