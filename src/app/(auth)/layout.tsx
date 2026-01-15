/* src/app/(auth)/layout.tsx */
import Image from "next/image";
import Link from "next/link";
import styles from "./authLayout.module.css"; // We will create this CSS

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.authLayout}>

            {/* 1. MINIMAL HEADER (Logo Only) */}
            <header className={styles.minimalHeader}>
                <Link href="/" className={styles.logoLink}>
                    {/* Ensure you have your logo in public folder */}
                    <Image
                        src="/logo.png"
                        alt="TrustBank"
                        width={160}
                        height={40}
                        className={styles.logo}
                    />
                </Link>
            </header>

            {/* 2. MAIN CONTENT (The Login/Register Form) */}
            <main className={styles.mainContent}>
                {children}
            </main>

            {/* 3. MINIMAL FOOTER (Legal Only) */}
            <footer className={styles.minimalFooter}>
                <div className={styles.footerLinks}>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                    <Link href="/help">Help Center</Link>
                </div>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} TrustBank Enterprise. Member FDIC. Equal Housing Lender.
                </p>
                <div className={styles.secureBadge}>
                    🔒 256-Bit SSL Encrypted Connection
                </div>
            </footer>

        </div>
    );
}