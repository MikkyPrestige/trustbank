import Link from "next/link";
import Image from "next/image";
import { Mail, Clock, Hash, Video, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import styles from "./Footer.module.css";

interface FooterProps {
    settings: {
        site_name?: string;
        site_logo?: string;
        contact_email?: string;
        contact_phone?: string;
        address_main?: string;
    }
}

export default function Footer({ settings }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const siteName = settings.site_name || "TrustBank";

    return (
        <footer className={styles.footer}>

            <div className={styles.contactStrip}>
                <div className={styles.container}>
                    <div className={styles.contactGrid}>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Hash size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>24/7 SUPPORT</span>
                                <span className={styles.value}>{settings.contact_phone || "1-800-TRUST-BK"}</span>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Clock size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>Branch Hours</span>
                                <span className={styles.value}>Mon - Fri: 9am - 5pm</span>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Mail size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>Email Support</span>
                                <span className={styles.value}>{settings.contact_email || "support@trustbank.com"}</span>
                            </div>
                        </div>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Video size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>Video Connect</span>
                                <span className={styles.value}>Chat Virtually (24/7)</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT (Royal Blue) */}
            <div className={styles.mainFooter}>
                <div className={styles.container}>
                    <div className={styles.mainGrid}>

                        {/* COLUMN 1: MISSION */}
                        <div className={styles.missionColumn}>
                            <h2 className={styles.footerHeading}>Building Strength Together</h2>
                            <p className={styles.missionText}>
                                {siteName} is a not-for-profit financial institution built on the unshakeable
                                promise to serve those who work every day to build a better future for us all.
                                For over 80 years, we’ve delivered expert guidance and innovative tools to
                                help strengthen and grow businesses, families, and our local communities.
                            </p>
                            <div className={styles.socialRow}>
                                <Link href="#" className={styles.socialIcon}><Facebook size={20} /></Link>
                                <Link href="#" className={styles.socialIcon}><Twitter size={20} /></Link>
                                <Link href="#" className={styles.socialIcon}><Linkedin size={20} /></Link>
                                <Link href="#" className={styles.socialIcon}><Instagram size={20} /></Link>
                            </div>
                        </div>

                        {/* COLUMN 2: MEMBER SERVICES */}
                        <div className={styles.linkColumn}>
                            <h3>Member Services</h3>
                            <ul className={styles.linkList}>
                                <li><Link href="/payments">Loan Payments</Link></li>
                                <li><Link href="/rates">Current Rates</Link></li>
                                <li><Link href="/insure">Trust Insurance</Link></li>
                                <li><Link href="/crypto">Crypto Assets</Link></li>
                                <li><Link href="/locations">Find a Branch</Link></li>
                            </ul>
                        </div>

                        {/* COLUMN 3: QUICK LINKS */}
                        <div className={styles.linkColumn}>
                            <h3>Quick Links</h3>
                            <ul className={styles.linkList}>
                                <li><Link href="#">Who We Are</Link></li>
                                <li><Link href="/careers">Careers</Link></li>
                                <li><Link href="/learn">Community</Link></li>
                                <li><Link href="/news">News & Events</Link></li>
                                <li><Link href="/help">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* COLUMN 4: LOCATION & BRAND */}
                        <div className={styles.brandColumn}>
                            <div className={styles.whiteLogoBox}>
                                {/* DYNAMIC LOGO */}
                                <Image
                                    src={settings.site_logo || "/logo.png"}
                                    alt={siteName}
                                    width={140}
                                    height={40}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div className={styles.addressBox}>
                                <h4>Headquarters</h4>
                                {/* DYNAMIC ADDRESS (Split by comma for new lines) */}
                                {settings.address_main ? (
                                    settings.address_main.split(',').map((line, i) => (
                                        <p key={i}>{line.trim()}</p>
                                    ))
                                ) : (
                                    <>
                                        <p>2375 E Camelback Rd</p>
                                        <p>#155, Phoenix, AZ 85016</p>
                                        <p>United States</p>
                                    </>
                                )}
                            </div>
                            <Link href="/locations" className={styles.mapLink}>
                                <MapPin size={16} /> Find a Branch
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. REGULATORY STRIP (White) */}
            <div className={styles.legalStrip}>
                <div className={styles.container}>
                    <div className={styles.legalGrid}>

                        <div className={styles.legalLinks}>
                            <Link href="/privacy">Privacy Policy</Link>
                            <span className={styles.divider}>|</span>
                            <Link href="/terms">Terms of Use</Link>
                            <span className={styles.divider}>|</span>
                            <Link href="/sitemap">Sitemap</Link>
                            <span className={styles.divider}>|</span>
                            <Link href="/accessibility">Accessibility</Link>
                        </div>

                        <div className={styles.legalLogos}>
                            <div className={styles.badgePlaceholder}>BBB A+</div>
                            <div className={styles.badgePlaceholder}>Equal Housing</div>
                            <div className={styles.badgePlaceholder}>NCUA / FDIC</div>
                        </div>

                        <div className={styles.copyright}>
                            &copy; {currentYear} {siteName}. All rights reserved.
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}