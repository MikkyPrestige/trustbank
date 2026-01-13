import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, History } from "lucide-react";
import styles from "./users.module.css";
import { requireAdmin } from "@/lib/admin-auth";
import { auth } from "@/auth";
import UserSearch from "./UserSearch";
import UserFilters from "./UserFilters";
import Pagination from "./Pagination";
import UserAvatar from "./UserAvatar";
import QuickActions from "./QuickActions";

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ query?: string; page?: string; status?: string }>
}) {
    // 1. Security Check
    await requireAdmin();
    const session = await auth();
    const currentUserRole = session?.user?.role;

    // 2. Parse Search Params
    const { query, page, status } = await searchParams;
    const currentPage = Number(page) || 1;
    const itemsPerPage = 10;
    const skip = (currentPage - 1) * itemsPerPage;

    // 3. Construct Database Query
    const whereClause: any = {
        // Logic: Super Admin sees everyone; Regular Admin sees only CLIENTS
        ...(currentUserRole !== 'SUPER_ADMIN' ? { role: 'CLIENT' } : {}),

        // Filter by Status (if selected)
        ...(status ? { status: status as any } : {}),

        // Search by Name or Email (if typing)
        ...(query && {
            OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ]
        })
    };

    // 4. Fetch Data & Count (Parallel Request)
    const [users, totalCount] = await Promise.all([
        db.user.findMany({
            where: whereClause,
            include: { accounts: true },
            orderBy: { createdAt: 'desc' },
            take: itemsPerPage,
            skip: skip,
        }),
        db.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>User Database</h1>
                    <p className={styles.subtitle}>
                        {totalCount} records found • Viewing as <span className={styles.roleTag}>{currentUserRole}</span>
                    </p>
                </div>

                <div className={styles.actions}>
                    {/* Interactive Client Components */}
                    <UserSearch />
                    <UserFilters />

                    <Link href="/admin/users/create" className={styles.addBtn}>
                        <Plus size={18} /> New User
                    </Link>
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User Profile</th>
                            <th>Role</th>
                            <th>KYC Status</th>
                            <th>Account Status</th>
                            <th>Total Balance</th>
                            <th>Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.empty}>
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => {
                                // Calculate total balance across all accounts
                                const totalBal = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {/* Visual Avatar */}
                                                <UserAvatar src={user.image} name={user.fullName} />

                                                <div>
                                                    <div className={styles.uName}>{user.fullName}</div>
                                                    <div className={styles.uEmail}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`${styles.badge} ${styles[user.role]}`}>
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`${styles.kycBadge} ${styles[user.kycStatus]}`}>
                                                {user.kycStatus.replace('_', ' ')}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`${styles.statusDot} ${styles[user.status]}`}></span>
                                            {user.status.replace('_', ' ')}
                                        </td>

                                        <td className={styles.money}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBal)}
                                        </td>

                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {/* Quick Action Dropdown (Freeze/Suspend) */}
                                                <QuickActions userId={user.id} currentStatus={user.status} />

                                                <Link href={`/admin/users/${user.id}`} className={styles.viewBtn}>
                                                    Manage
                                                </Link>

                                                <Link
                                                    href={`/admin/users/${user.id}/transactions`}
                                                    className={styles.iconBtn}
                                                    title="View History"
                                                >
                                                    <History size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}