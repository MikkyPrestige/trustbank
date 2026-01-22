import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WireRow from "./wires/WireRow";
import styles from "./admin.module.css";
import { Users, FileText, Activity, ShieldCheck } from "lucide-react";

export default async function AdminDashboard() {
    const session = await auth();
    const currentUserRole = session?.user?.role;

    // 0. Security Gate
    if (currentUserRole !== 'ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
        redirect("/dashboard");
    }

    // 1. Define Filter Logic
    // SUPER_ADMIN -> Sees Everyone (Empty filter)
    // ADMIN       -> Sees Only CLIENTS
    const scopeFilter = currentUserRole === 'SUPER_ADMIN'
        ? {}
        : { role: 'CLIENT' };

    // 2. Fetch Data (Parallel for speed)
    const [users, pendingWires, pendingKyc, totalUsers, liquidityData] = await Promise.all([
        // A. Recent Users (Filtered)
        db.user.findMany({
            where: scopeFilter as any, // Cast to avoid strict typing issues with empty objects
            include: { accounts: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),

        // B. Pending Wires (Global queue, usually admins manage all wires)
        db.wireTransfer.findMany({
            where: { status: 'PENDING_AUTH' },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        }),

        // C. Pending KYC Count
        db.user.count({
            where: { kycStatus: 'PENDING' }
        }),

        // D. Total User Count (Filtered)
        db.user.count({ where: scopeFilter as any }),

        // E. Total Liquidity
        // Filter: Admins shouldn't see Super Admin balances if they are hidden
        db.account.aggregate({
            where: currentUserRole === 'SUPER_ADMIN'
                ? {}
                : { user: { role: 'CLIENT' } },
            _sum: { availableBalance: true }
        })
    ]);

    const totalReserves = Number(liquidityData._sum.availableBalance || 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>System Overview</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                        Viewing as <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{currentUserRole}</span>
                    </p>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}><Activity size={14} /> Total Liquidity</span>
                        <span className={styles.statValue} style={{ color: '#22c55e' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalReserves)}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}><FileText size={14} /> Pending Wires</span>
                        <span className={styles.statValue} style={{ color: pendingWires.length > 0 ? '#fbbf24' : '#fff' }}>
                            {pendingWires.length}
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}><Users size={14} /> {currentUserRole === 'SUPER_ADMIN' ? 'Total Users' : 'Total Clients'}</span>
                        <span className={styles.statValue}>{totalUsers}</span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>
                            <ShieldCheck size={14} /> Pending KYC
                        </span>
                        <span className={styles.statValue} style={{ color: pendingKyc > 0 ? '#fbbf24' : '#fff' }}>
                            {pendingKyc}
                        </span>
                    </div>
                </div>
            </header>

            {/* --- SECTION 1: URGENT WIRES --- */}
            {pendingWires.length > 0 ? (
                <div className={styles.section}>
                    <h2 className={styles.subTitle} style={{ color: '#fbbf24' }}>
                        ⚠ Wire Action Required
                    </h2>
                    <div className={styles.tableWrapper} style={{ border: '1px solid #fbbf24' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Bank / Beneficiary</th>
                                    <th>Amount</th>
                                    <th>Stage</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingWires.map(wire => (
                                    <WireRow key={wire.id} wire={wire} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className={styles.section} style={{ padding: '2rem', background: '#111', borderRadius: '12px', textAlign: 'center', color: '#666' }}>
                    <p>No pending wire transfers. Great job!</p>
                </div>
            )}

            {/* --- SECTION 2: RECENT SIGNUPS --- */}
            <div className={styles.section}>
                <h2 className={styles.subTitle}>Recent Signups</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>KYC</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                // 1. Calculate the SUM of all their accounts
                                const totalUserBalance = u.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

                                // 2. Count how many accounts they have (Optional, for context)
                                const accountCount = u.accounts.length;

                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{u.fullName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Created: {new Date(u.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: u.status === 'ACTIVE' ? '#064e3b' : '#7f1d1d',
                                                color: u.status === 'ACTIVE' ? '#34d399' : '#f87171',
                                                fontSize: '0.75rem'
                                            }}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>
                                            {u.kycStatus === 'VERIFIED' ? '✅' : u.kycStatus === 'PENDING' ? '⏳' : '❌'}
                                        </td>
                                        <td>
                                            {/* PRIMARY: Show Total Sum */}
                                            <div style={{ fontWeight: 'bold', color: '#fff' }}>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalUserBalance)}
                                            </div>

                                            {/* SECONDARY: Tiny text showing count (e.g. "Across 2 accounts") */}
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                {accountCount} {accountCount === 1 ? 'Account' : 'Accounts'}
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