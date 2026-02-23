import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content/get-settings";
import styles from "./authLayout.module.css";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();
    return (
        <div className={styles.authLayout}>
            {/* 1. MINIMAL HEADER  */}
            <header className={styles.minimalHeader}>
                <Link href="/" className={styles.logoLink}>
                    <Image
                        src={settings.site_logo}
                        alt={settings.site_logo_alt}
                        width={160}
                        height={40}
                    />
                </Link>
            </header>

            {/* 2. MAIN CONTENT  */}
            <main className={styles.mainContent}>
                {children}
            </main>

            {/* 3. MINIMAL FOOTER */}
            <footer className={styles.minimalFooter}>
                <div className={styles.footerLinks}>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                    <Link href="/help">Help Center</Link>
                </div>
                <p className={styles.copyright}>
                    &copy; {new Date().getFullYear()} {settings.site_name} Enterprise. Member FDIC. Equal Housing Lender.
                </p>
                <div className={styles.secureBadge}>
                    🔒 256-Bit SSL Encrypted Connection
                </div>
            </footer>

        </div>
    );
}