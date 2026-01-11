import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import WireRow from "./wires/WireRow";

import styles from "./admin.module.css";

export default async function AdminDashboard() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') redirect("/dashboard");

    // 1. Fetch All Users & Accounts
    const users = await db.user.findMany({
        where: { role: 'CLIENT' }, // Only show clients, not other admins
        include: { accounts: true },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch Pending Wires
    const pendingWires = await db.wireTransfer.findMany({
        where: { status: 'PENDING_AUTH' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Calculate Total Bank Reserves (Liquidity)
    const totalReserves = users.reduce((sum, user) => {
        const balance = user.accounts[0]?.availableBalance
            ? Number(user.accounts[0].availableBalance)
            : 0;
        return sum + balance;
    }, 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>System Overview</h1>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Bank Liquidity</span>
                    <span className={styles.statValue}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalReserves)}
                    </span>
                </div>
            </header>

            {/* --- SECTION 1: URGENT WIRES --- */}
            {pendingWires.length > 0 && (
                <div className={styles.section}>
                    <h2 className={styles.subTitle} style={{ color: '#fbbf24' }}>
                        ⚠ Wire Clearing House ({pendingWires.length})
                    </h2>
                    <div className={styles.tableWrapper} style={{ borderColor: '#fbbf24' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Beneficiary</th>
                                    <th>Amount</th>
                                    <th>Status</th>
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
            )}
        </div>
    );
}