import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Clock, Hash, Video, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>

            {/* 1. TOP CONTACT STRIP (Teal Bar) */}
            <div className={styles.contactStrip}>
                <div className={styles.container}>
                    <div className={styles.contactGrid}>

                        <div className={styles.contactItem}>
                            <div className={styles.iconCircle}><Hash size={20} /></div>
                            <div className={styles.contactText}>
                                <span className={styles.label}>24/7 SUPPORT</span>
                                <span className={styles.value}>1-800-TRUST-BK</span>
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
                                <span className={styles.value}>support@trustbank.com</span>
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
                                TrustBank is a not-for-profit financial institution built on the unshakeable
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
                                <li><Link href="/services">Referral Service</Link></li>
                                <li><Link href="/security">Trust Security™</Link></li>
                                <li><Link href="/rates">Current Rates</Link></li>
                                <li><Link href="/forms">Forms & Applications</Link></li>
                            </ul>
                        </div>

                        {/* COLUMN 3: QUICK LINKS */}
                        <div className={styles.linkColumn}>
                            <h3>Quick Links</h3>
                            <ul className={styles.linkList}>
                                <li><Link href="/about">Who We Are</Link></li>
                                <li><Link href="/careers">Careers</Link></li>
                                <li><Link href="/community">Giving Back</Link></li>
                                <li><Link href="/news">News & Events</Link></li>
                                <li><Link href="/contact">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* COLUMN 4: LOCATION & BRAND */}
                        <div className={styles.brandColumn}>
                            <div className={styles.whiteLogoBox}>
                                {/* Use your logo image here */}
                                <span className={styles.tempLogoText}>TRUSTBANK</span>
                            </div>
                            <div className={styles.addressBox}>
                                <h4>Headquarters</h4>
                                <p>2375 E Camelback Rd</p>
                                <p>#155, Phoenix, AZ 85016</p>
                                <p>United States</p>
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
                            {/* Replace with real images from public folder if you have them */}
                            <div className={styles.badgePlaceholder}>BBB A+</div>
                            <div className={styles.badgePlaceholder}>Equal Housing</div>
                            <div className={styles.badgePlaceholder}>NCUA / FDIC</div>
                        </div>

                        <div className={styles.copyright}>
                            © {currentYear} TrustBank. All rights reserved.
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}