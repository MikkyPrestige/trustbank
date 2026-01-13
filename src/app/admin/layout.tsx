import { auth } from "@/auth";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
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
    IdCard
} from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    const session = await auth();
    const role = session?.user?.role;

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <nav className={styles.nav}>
                <div className={styles.brand}>
                    TrustBank <span style={{ color: '#ef4444', fontSize: '0.8em', marginLeft: '6px' }}>ADMIN</span>
                </div>

                <div className={styles.navLinks}>
                    {/* 1. OVERVIEW */}
                    <Link href="/admin" className={styles.navLink} title="Dashboard">
                        <LayoutDashboard size={18} />
                        <span className={styles.linkText}>Overview</span>
                    </Link>

                    <div className={styles.separator}></div>

                    {/* 2. PEOPLE MANAGEMENT */}
                    {role === 'SUPER_ADMIN' && (
                        <Link href="/admin/staff" className={styles.navLink} style={{ color: '#fbbf24' }} title="Manage Staff">
                            <IdCard size={18} />
                            <span className={styles.linkText}>Staff</span>
                        </Link>
                    )}

                    <Link href="/admin/users" className={styles.navLink} title="Manage Clients">
                        <Users size={18} />
                        <span className={styles.linkText}>Users</span>
                    </Link>

                    <Link href="/admin/verifications" className={styles.navLink} title="KYC Requests">
                        <FileCheck size={18} />
                        <span className={styles.linkText}>KYC</span>
                    </Link>

                    <div className={styles.separator}></div>

                    {/* 3. FINANCIAL QUEUES */}
                    <Link href="/admin/wires" className={styles.navLink} title="Wire Queue">
                        <Globe size={18} />
                        <span className={styles.linkText}>Wires</span>
                    </Link>

                    <Link href="/admin/loans" className={styles.navLink} title="Loan Queue">
                        <Banknote size={18} />
                        <span className={styles.linkText}>Loans</span>
                    </Link>

                    <div className={styles.separator}></div>

                    {/* 4. SYSTEM TOOLS */}
                    <Link href="/admin/generator" className={styles.navLink} title="Transaction Generator">
                        <Activity size={18} />
                        <span className={styles.linkText}>TXNs</span>
                    </Link>

                    <Link href="/admin/logs" className={styles.navLink} title="Audit Logs">
                        <ShieldAlert size={18} />
                        <span className={styles.linkText}>Audit</span>
                    </Link>
                </div>

                <div className={styles.navExit}>
                    <Link href="/dashboard" className={styles.exitLink}>
                        <LogOut size={16} />
                        <span>Exit Console</span>
                    </Link>
                </div>
            </nav>

            <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}