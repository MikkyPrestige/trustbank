import Link from 'next/link';
import { Network } from 'lucide-react';
import { MEGA_MENUS } from '@/lib/utils/constants';
import styles from './sitemap.module.css';

export default function SitemapPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconBox}>
                    <Network size={32} />
                </div>
                <div>
                    <h1 className={styles.title}>Site Map</h1>
                    <p className={styles.subtitle}>Overview of available pages and services.</p>
                </div>
            </div>

            <div className={styles.grid}>

                {/* 1. MAIN SECTIONS (From Mega Menu) */}
                {Object.values(MEGA_MENUS).map((section) => (
                    <div key={section.title} className={styles.card}>
                        <h2 className={styles.sectionTitle}>{section.title}</h2>
                        <ul className={styles.linkList}>
                            {section.links.flat().map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* 2. GENERAL / UTILITY */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>GENERAL & ACCOUNT</h2>
                    <ul className={styles.linkList}>
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/login">Login</Link></li>
                        <li><Link href="/register">Open Account</Link></li>
                        <li><Link href="/contact">Contact Us</Link></li>
                        <li><Link href="/locations">Locations & ATMs</Link></li>
                        <li><Link href="/careers">Careers</Link></li>
                    </ul>
                </div>

                {/* 3. LEGAL & SUPPORT */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>LEGAL & SUPPORT</h2>
                    <ul className={styles.linkList}>
                        <li><Link href="/help">Help Center</Link></li>
                        <li><Link href="/privacy">Privacy Policy</Link></li>
                        <li><Link href="/terms">Terms of Use</Link></li>
                        <li><Link href="/accessibility">Accessibility</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}