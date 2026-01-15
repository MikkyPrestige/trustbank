import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { db } from '@/lib/db';
import { checkAdminAction } from '@/lib/admin-auth';
import {
    LayoutDashboard, CreditCard, ArrowRightLeft, Globe, History, Settings,
    Clock, Banknote, Bitcoin, FileText, Users, ShieldCheck, LogOut, IdCard,
    Lock // 👈 Added Lock Icon
} from 'lucide-react';
import styles from './sidebar.module.css';

export default async function Sidebar() {
    const session = await auth();
    if (!session?.user?.email) return null;

    // 1. Fetch User Data (Added 'status' to selection)
    const [user, pendingCount] = await Promise.all([
        db.user.findUnique({
            where: { email: session.user.email },
            select: { fullName: true, role: true, kycStatus: true, status: true } // 👈 FETCH STATUS
        }),
        db.wireTransfer.count({
            where: { userId: session.user.id, status: 'PENDING_AUTH' }
        })
    ]);

    if (!user) return null;

    const { authorized: isAdmin } = await checkAdminAction();
    const kycActionRequired = !user.kycStatus || user.kycStatus === 'NOT_SUBMITTED' || user.kycStatus === 'FAILED';
    const isFrozen = user.status === 'FROZEN'; // 👈 Check Status

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <h2>TrustBank</h2>
                </Link>
            </div>

            <nav className={styles.nav}>
                <div className={styles.sectionLabel}>Personal Banking</div>
                <ul className={styles.ul}>
                    {/* 1. OVERVIEW (Most Frequent) */}
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem href="/dashboard/transactions" icon={<History size={20} />} label="Transactions" />
                    <li className={styles.divider}></li>
                    {/* 2. MONEY MOVEMENT (Primary Actions) */}
                    <NavItem href="/dashboard/transfer" icon={<ArrowRightLeft size={20} />} label="Local Transfer" />
                    <NavItem href="/dashboard/wire" icon={<Globe size={20} />} label="International Wire" />
                    {/* Group Pending Wires with Wire Transfer for context */}
                    <li>
                        <Link href="/dashboard/wire/status" className={`${styles.link} ${styles.pendingLink}`}>
                            <Clock size={20} />
                            <span>Pending Wires</span>
                            {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
                        </Link>
                    </li>
                    <NavItem href="/dashboard/beneficiaries" icon={<Users size={18} />} label="Beneficiaries" />
                    <li className={styles.divider}></li>
                    {/* 3. ASSETS & PRODUCTS (Secondary Actions) */}
                    <NavItem href="/dashboard/cards" icon={<CreditCard size={20} />} label="My Cards" />
                    <NavItem href="/dashboard/crypto" icon={<Bitcoin size={20} />} label="Crypto Vault" />
                    <NavItem href="/dashboard/loans" icon={<Banknote size={20} />} label="Loans" />
                </ul>

                {isAdmin && (
                    <div className={styles.adminSection}>
                        <div className={styles.sectionLabelAdmin}>Admin Management</div>
                        <ul className={styles.menuList}>
                            <li>
                                <Link href="/admin"><ShieldCheck size={20} color="#fbbf24" /><span>Admin Overview</span></Link>
                            </li>
                            <li>
                                <Link href="/admin/users"><Users size={20} color="#fbbf24" /><span>Client Management</span></Link>
                            </li>
                            <li>
                                <Link href="/admin/wires"><FileText size={20} color="#fbbf24" /><span>Wire Approvals</span></Link>
                            </li>
                            {user.role === 'SUPER_ADMIN' && (
                                <li>
                                    <Link href="/admin/staff"><IdCard size={20} color="#fbbf24" /><span>Staff Management</span></Link>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </nav>

            <div className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link href="/dashboard/settings" className={styles.settingsLink}>
                        <Settings size={18} /><span>Settings</span>
                    </Link>
                    <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                        <button type="submit" className={styles.logoutBtn}>
                            <LogOut size={18} /><span>Sign Out</span>
                        </button>
                    </form>
                </div>

                <div>
                    <Link href="/dashboard/verify" className={styles.settingsLink}>
                        <IdCard size={18} /><span>Kyc</span>
                    </Link>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.userHeader}>
                        <p className={styles.userName}>{user.fullName}</p>

                        {/* 👇 STATUS BADGES */}
                        {isFrozen ? (
                            <span className={styles.badgeError} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Lock size={10} /> Frozen
                            </span>
                        ) : user.kycStatus === 'VERIFIED' ? (
                            <span className={styles.badgeSuccess}>Verified ✅</span>
                        ) : user.kycStatus === 'PENDING' ? (
                            <span className={styles.badgeWarning}>Pending Review ⏳</span>
                        ) : (
                            <span className={styles.badgeError}>Unverified ❌</span>
                        )}
                    </div>

                    <span className={styles.userRole}>{user.role.replace('_', ' ')}</span>

                    {kycActionRequired && !isFrozen && (
                        <Link href="/dashboard/verify" style={{ textDecoration: 'none' }}>
                            <div className={styles.kycWarning}>Action Required →</div>
                        </Link>
                    )}
                </div>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <li>
            <Link href={href} className={styles.link}>
                {icon}<span>{label}</span>
            </Link>
        </li>
    );
}