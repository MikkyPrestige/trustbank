import { auth } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/get-settings"; // 👈 Import CMS
import Link from "next/link";
import Image from "next/image"; // 👈 Import Image
import styles from "./admin.module.css";
import {
    LayoutDashboard,
    Users,
    FileCheck,
    Globe,
    Banknote,
    Activity,
    ShieldAlert,
    LogOut,
    IdCard,
    MessageSquareText,
    Settings // 👈 Import Settings Icon
} from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 🔒 Gatekeeper
    await requireAdmin();
    const session = await auth();
    const role = session?.user?.role;

    // 1. Fetch Dynamic Settings
    const settings = await getSiteSettings();

    return (
        <div className={styles.layoutContainer}>
            <nav className={styles.nav}>

                {/* 2. DYNAMIC BRANDING */}
                <div className={styles.brand}>
                    <Image
                        src={settings.site_logo || "/logo.png"}
                        alt={settings.site_name || "TrustBank"}
                        width={120}
                        height={32}
                        className={styles.brandLogo}
                    />
                    <span className={styles.brandBadge}>ADMIN</span>
                </div>

                <div className={styles.navLinks}>
                    {/* 1. OVERVIEW */}
                    <Link href="/admin" className={styles.navLink}>
                        <LayoutDashboard size={18} /> Overview
                    </Link>

                    <div className={styles.separator}></div>

                    {/* 2. PEOPLE MANAGEMENT */}
                    {role === 'SUPER_ADMIN' && (
                        <Link href="/admin/staff" className={styles.navLink}>
                            <IdCard size={18} /> Staff
                        </Link>
                    )}

                    <Link href="/admin/users" className={styles.navLink}>
                        <Users size={18} /> Users
                    </Link>

                    <Link href="/admin/verifications" className={styles.navLink}>
                        <FileCheck size={18} /> KYC
                    </Link>

                    <div className={styles.separator}></div>

                    {/* 3. FINANCIAL QUEUES */}
                    <Link href="/admin/wires" className={styles.navLink}>
                        <Globe size={18} /> Wires
                    </Link>

                    <Link href="/admin/loans" className={styles.navLink}>
                        <Banknote size={18} /> Loans
                    </Link>

                    <div className={styles.separator}></div>

                    {/* 4. SYSTEM TOOLS */}
                    <Link href="/admin/support" className={styles.navLink}>
                        <MessageSquareText size={18} /> Tickets
                    </Link>

                    <Link href="/admin/generator" className={styles.navLink}>
                        <Activity size={18} /> TXNs
                    </Link>

                    {/* 👇 NEW LINK: Site Settings (CMS) */}
                    <Link href="/admin/settings" className={styles.navLink}>
                        <Settings size={18} /> Site Settings
                    </Link>

                    {role === 'SUPER_ADMIN' && (
                        <Link href="/admin/logs" className={styles.navLink}>
                            <ShieldAlert size={18} /> Audit
                        </Link>
                    )}
                </div>

                <div className={styles.navExit}>
                    <Link href="/dashboard" className={styles.exitLink}>
                        <LogOut size={16} /> Exit Console
                    </Link>
                </div>
            </nav>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}