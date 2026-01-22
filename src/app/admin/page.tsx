import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WireRow from "@/components/admin/wires/WireRow";
import NotificationBell from "@/components/admin/notification/NotificationBell";
import RevenueCard from "@/components/admin/stats/RevenueCard";
import LiquidityCard from "@/components/admin/stats/LiquidityCard";
import WiresCard from "@/components/admin/stats/WiresCard";
import KycCard from "@/components/admin/stats/KycCard";
import { TransactionDirection, TransactionStatus } from "@prisma/client";
import styles from "./admin.module.css";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default async function AdminDashboard() {
    const session = await auth();
    const currentUserRole = session?.user?.role;

    if (!['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(currentUserRole || '')) {
        redirect("/dashboard");
    }

    const scopeFilter = currentUserRole === 'SUPER_ADMIN' ? {} : { role: 'CLIENT' };
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
        users,
        pendingWires,
        pendingKyc,
        liquidityData,
        todayCredits,
        todayDebits
    ] = await Promise.all([
        db.user.findMany({
            where: { ...(scopeFilter as any), status: { not: 'ARCHIVED' } },
            include: { accounts: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        // 👇 Fetch ONLY wires waiting for Final Approval
        db.wireTransfer.findMany({
            where: {
                status: { in: ['PENDING_AUTH', 'ON_HOLD'] }
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        }),
        db.user.count({ where: { kycStatus: 'PENDING' } }),
        db.account.aggregate({
            where: currentUserRole === 'SUPER_ADMIN' ? {} : { user: { role: 'CLIENT' } },
            _sum: { availableBalance: true }
        }),
        // Inflow
        db.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: { direction: TransactionDirection.CREDIT, createdAt: { gte: startOfDay } }
        }),
        // Outflow
        db.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: { direction: TransactionDirection.DEBIT, createdAt: { gte: startOfDay } }
        })
    ]);

    const totalReserves = Number(liquidityData._sum.availableBalance || 0);
    const liquidityTrend = Number(todayCredits._sum.amount || 0) - Number(todayDebits._sum.amount || 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div>
                        <h1>System Overview</h1>
                        <p className={styles.headerSubtitle}>
                            Logged in as <span className={styles.roleBadge}>{currentUserRole}</span>
                        </p>
                    </div>
                    <NotificationBell />
                </div>

                <div className={styles.statsGrid}>
                    <RevenueCard />
                    <LiquidityCard amount={totalReserves} trend={liquidityTrend} />
                    <WiresCard count={pendingWires.length} />
                    <KycCard count={pendingKyc} />
                </div>
            </header>

            {/* --- SECTION 1: URGENT WIRES  --- */}
            <div className={styles.section}>
                {pendingWires.length > 0 ? (
                    <>
                        <h2 className={`${styles.subTitle} ${styles.urgentTitle}`}>
                            <AlertTriangle size={18} /> Wire Action Required
                        </h2>
                        <div className={styles.tableWrapper} style={{ borderColor: 'var(--warning)' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>User</th>
                                        <th>Beneficiary Bank</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Admin Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingWires.map(wire => (
                                        <WireRow key={wire.id} wire={wire} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <ShieldCheck size={32} style={{ opacity: 0.5, marginBottom: '1rem', color: 'var(--success)' }} />
                        <p>No pending approvals. All wires processed.</p>
                    </div>
                )}
            </div>

            {/* --- SECTION 2: RECENT SIGNUPS --- */}
            <div className={styles.section}>
                <h2 className={styles.subTitle}>Recent Signups</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>KYC</th>
                                <th>Total Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const totalBal = u.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <span style={{ fontWeight: 600 }}>{u.fullName}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={styles.userEmail}>{u.email}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${u.status === 'ACTIVE' ? styles.active : styles.inactive}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>{u.kycStatus === 'VERIFIED' ? '✅' : u.kycStatus === 'PENDING' ? '⏳' : '❌'}</td>
                                        <td>
                                            <div className={styles.balancePrimary}>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBal)}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}