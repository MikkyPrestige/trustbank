import Link from "next/link";
import Image from "next/image";
import { Mail, Clock, Hash, Video, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import styles from "./Footer.module.css";

interface FooterLinkItem {
    id: string;
    label: string;
    href: string;
    column: string;
}

interface FooterProps {
    settings: any;
    links: FooterLinkItem[];
}

export default function Footer({ settings, links = [] }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const siteName = settings.site_name || "TrustBank";
    const content = settings.content || {};

    // Filter dynamic links into their columns
    const col1Links = links.filter(l => l.column === 'col1');
    const col2Links = links.filter(l => l.column === 'col2');
    const legalLinks = links.filter(l => l.column === 'legal');

    return (
        <footer className={styles.footer}>

            {/* 1. CONTACT STRIP */}
            <div className={styles.contactStrip}>
                <div className={styles.container}>
                    <div className={styles.contactGrid}>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Hash size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>{content.footer_lbl_support}</span>
                                <span className={styles.value}>{settings.contact_phone}</span>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Clock size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>{content.footer_lbl_hours}</span>
                                <span className={styles.value}>{content.footer_val_hours}</span>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Mail size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>{content.footer_lbl_email}</span>
                                <span className={styles.value}>{settings.contact_email}</span>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Video size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>{content.footer_lbl_video}</span>
                                <span className={styles.value}>{content.footer_val_video}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT */}
            <div className={styles.mainFooter}>
                <div className={styles.container}>
                    <div className={styles.mainGrid}>

                        {/* COLUMN 1: MISSION */}
                        <div className={styles.missionColumn}>
                            <h2 className={styles.footerHeading}>
                                {content.footer_mission_title}
                            </h2>
                            <p className={styles.missionText}>
                                {content.footer_mission_text}
                            </p>
                            <div className={styles.socialRow}>
                                {content.social_facebook && <Link href={content.social_facebook} className={styles.socialIcon}><Facebook size={20} /></Link>}
                                {content.social_twitter && <Link href={content.social_twitter} className={styles.socialIcon}><Twitter size={20} /></Link>}
                                {content.social_linkedin && <Link href={content.social_linkedin} className={styles.socialIcon}><Linkedin size={20} /></Link>}
                                {content.social_instagram && <Link href={content.social_instagram} className={styles.socialIcon}><Instagram size={20} /></Link>}
                            </div>
                        </div>

                        {/* COLUMN 2: DYNAMIC LINKS */}
                        <div className={styles.linkColumn}>
                            <h3>{content.footer_col1_title}</h3>
                            <ul className={styles.linkList}>
                                {col1Links.length > 0 ? col1Links.map(link => (
                                    <li key={link.id}><Link href={link.href}>{link.label}</Link></li>
                                )) : <li style={{ opacity: 0.5 }}>No links added</li>}
                            </ul>
                        </div>

                        {/* COLUMN 3: DYNAMIC LINKS */}
                        <div className={styles.linkColumn}>
                            <h3>{content.footer_col2_title}</h3>
                            <ul className={styles.linkList}>
                                {col2Links.length > 0 ? col2Links.map(link => (
                                    <li key={link.id}><Link href={link.href}>{link.label}</Link></li>
                                )) : <li style={{ opacity: 0.5 }}>No links added</li>}
                            </ul>
                        </div>

                        {/* COLUMN 4: BRAND */}
                        <div className={styles.brandColumn}>
                            <div className={styles.whiteLogoBox}>
                                <Image
                                    src={settings.site_logo || "/logo.png"}
                                    alt={siteName}
                                    width={140}
                                    height={40}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div className={styles.addressBox}>
                                <h4>{content.footer_lbl_headquarters}</h4>
                                {settings.address_main ? (
                                    settings.address_main.split(',').map((line: string, i: number) => (
                                        <p key={i}>{line.trim()}</p>
                                    ))
                                ) : <p>Address not set</p>}
                            </div>
                            <Link href="/locations" className={styles.mapLink}>
                                <MapPin size={16} /> {content.footer_lbl_locate}
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. LEGAL STRIP */}
            <div className={styles.legalStrip}>
                <div className={styles.container}>
                    <div className={styles.legalGrid}>
                        <div className={styles.legalLinks}>
                            {legalLinks.map((link, index) => (
                                <span key={link.id} style={{ display: 'flex', alignItems: 'center' }}>
                                    <Link href={link.href}>{link.label}</Link>
                                    {index < legalLinks.length - 1 && <span className={styles.divider}>|</span>}
                                </span>
                            ))}
                        </div>
                        <div className={styles.legalLogos}>
                            <div className={styles.badgePlaceholder}>{content.footer_badge1}</div>
                            <div className={styles.badgePlaceholder}>{content.footer_badge2}</div>
                            <div className={styles.badgePlaceholder}>{content.footer_badge3}</div>
                        </div>
                        <div className={styles.copyright}>
                            &copy; {currentYear} {siteName}. {content.footer_lbl_copyright}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}