import Link from "next/link";
import Image from "next/image";
import { Car, Home, Briefcase, GraduationCap, Calculator, ChevronRight, Percent } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function LoanSection() {
    const settings = await getSiteSettings();

    return (
        <section className={styles.loanSection}>
            <div className={styles.container}>

                {/* 1. HEADER & CATEGORIES */}
                <div className={styles.loanHeader}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.sectionTitleDark}>{settings.home_loan_title}</h2>
                        <p className={styles.sectionDescDark}>
                            {settings.home_loan_desc}
                        </p>
                    </div>
                    <div className={styles.loanIcons}>
                        <div className={styles.loanIconItem}><Home size={24} /><span>{settings.home_loan_cat1_label}</span></div>
                        <div className={styles.loanIconItem}><Car size={24} /><span>{settings.home_loan_cat2_label}</span></div>
                        <div className={styles.loanIconItem}><GraduationCap size={24} /><span>{settings.home_loan_cat3_label}</span></div>
                        <div className={styles.loanIconItem}><Briefcase size={24} /><span>{settings.home_loan_cat4_label}</span></div>
                    </div>
                </div>

                {/* 2. SPLIT FEATURE CARDS */}
                <div className={styles.loanGrid}>
                    {/* CARD 1: MORTGAGE*/}
                    <div className={styles.loanCardBlue}>
                        <div className={styles.loanTextContent}>
                            <div className={styles.iconBoxWhite}>
                                <Home size={24} className={styles.iconBlue} />
                            </div>
                            <h3>{settings.home_loan_card1_title}</h3>
                            <p>{settings.home_loan_card1_desc}</p>

                            <div className={styles.loanStatRow}>
                                <div>
                                    <span className={styles.statLabel}>{settings.home_loan_card1_stat1_label}</span>
                                    <span className={styles.statValue}>
                                        {settings.rate_mortgage_30yr}{settings.home_loan_percent_symbol} <small>{settings.home_loan_apr_text}</small>
                                    </span>
                                </div>
                                <div className={styles.verticalDivider}></div>
                                <div>
                                    <span className={styles.statLabel}>{settings.home_loan_card1_stat2_label}</span>
                                    <span className={styles.statValue}>{settings.home_loan_card1_stat2_value}</span>
                                </div>
                            </div>

                            <div className={styles.loanActions}>
                                <Link href={settings.home_loan_card1_btn1_link} className={styles.btnWhite}>
                                    {settings.home_loan_card1_btn1_text}
                                </Link>
                                <Link href={settings.home_loan_card1_btn2_link} className={styles.linkLight}>
                                    {settings.home_loan_card1_btn2_text} <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className={styles.loanImageWrapper}>
                            <Image
                                src={settings.home_loan_card1_img}
                                alt={settings.home_loan_card1_alt}
                                fill
                                className={styles.loanImage}
                            />
                        </div>
                    </div>

                    {/* CARD 2: AUTO */}
                    <div className={styles.loanCardGrey}>
                        <div className={styles.loanTextContent}>
                            <div className={styles.iconBoxBlue}>
                                <Car size={24} className={styles.iconWhite} />
                            </div>
                            <h3>{settings.home_loan_card2_title}</h3>
                            <p>{settings.home_loan_card2_desc}</p>
                            <p className={styles.smallNote}>
                                {settings.home_loan_card2_note_text} <strong>{settings.rate_auto_low}{settings.home_loan_percent_symbol} {settings.home_loan_apr_text}</strong>.
                            </p>

                            <ul className={styles.loanChecklist}>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> {settings.home_loan_card2_list1}</li>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> {settings.home_loan_card2_list2}</li>
                                <li><ChevronRight size={16} className={styles.checkBlue} /> {settings.home_loan_card2_list3}</li>
                            </ul>

                            <div className={styles.loanActions}>
                                <Link href={settings.home_loan_card2_btn1_link} className={styles.btnBlueOutline}>
                                    {settings.home_loan_card2_btn1_text}
                                </Link>
                                <Link href={settings.home_loan_card2_btn2_link} className={styles.linkDark}>
                                    {settings.home_loan_card2_btn2_text} <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className={styles.loanImageWrapper}>
                            <Image
                                src={settings.home_loan_card2_img}
                                alt={settings.home_loan_card2_alt}
                                fill
                                className={styles.loanImage}
                            />
                        </div>
                    </div>

                </div>

                {/* 3. CALCULATOR STRIP */}
                <div className={styles.toolsStrip}>
                    {/* Tool 1 */}
                    <div className={styles.toolItem}>
                        <Calculator size={20} className={styles.toolIcon} />
                        <div>
                            <h4>{settings.home_loan_tool1_title}</h4>
                            <Link href={settings.home_loan_tool1_link}>
                                {settings.home_loan_tool1_text} {settings.home_loan_arrow_symbol}
                            </Link>
                        </div>
                    </div>
                    <div className={styles.toolDivider}></div>

                    {/* Tool 2 */}
                    <div className={styles.toolItem}>
                        <Percent size={20} className={styles.toolIcon} />
                        <div>
                            <h4>{settings.home_loan_tool2_title}</h4>
                            <Link href={settings.home_loan_tool2_link}>
                                {settings.home_loan_tool2_text} {settings.home_loan_arrow_symbol}
                            </Link>
                        </div>
                    </div>
                    <div className={styles.toolDivider}></div>

                    {/* Tool 3 */}
                    <div className={styles.toolItem}>
                        <Briefcase size={20} className={styles.toolIcon} />
                        <div>
                            <h4>{settings.home_loan_tool3_title}</h4>
                            <Link href={settings.home_loan_tool3_link}>
                                {settings.home_loan_tool3_text} {settings.home_loan_arrow_symbol}
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}