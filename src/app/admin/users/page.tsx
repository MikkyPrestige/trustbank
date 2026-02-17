import { db } from "@/lib/db";
import Link from "next/link";
import { History, UserPlus, Archive, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { auth } from "@/auth";
import UserSearch from "@/components/admin/users/UserSearch";
import UserFilters from "@/components/admin/users/UserFilters";
import Pagination from "@/components/admin/users/Pagination";
import UserAvatar from "@/components/admin/users/UserAvatar";
import QuickActions from "@/components/admin/users/QuickActions";
import ArchiveActions from "@/components/admin/users/ArchiveActions";
import { Prisma } from "@prisma/client";
import styles from "../../../components/admin/users/users.module.css"

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ query?: string; page?: string; status?: string }>
}) {
    await requireAdmin();
    const session = await auth();
    const currentUserRole = session?.user?.role;
    const canAccessBin = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN';
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

    const { query, page, status } = await searchParams;
    const currentPage = Number(page) || 1;
    const itemsPerPage = 10;
    const skip = (currentPage - 1) * itemsPerPage;

    const isArchivedView = status === 'ARCHIVED';

    let roleScope: Prisma.UserWhereInput = {};
    if (isSuperAdmin) {
        roleScope = {};
    } else if (currentUserRole === 'ADMIN') {
        roleScope = { role: { in: ['CLIENT', 'SUPPORT'] } };
    } else {
        roleScope = { role: 'CLIENT' };
    }

    const whereClause: Prisma.UserWhereInput = {
        ...roleScope,
        status: isArchivedView
            ? 'ARCHIVED'
            : (status ? { equals: status as any, not: 'ARCHIVED' } : { not: 'ARCHIVED' }),
        ...(query && {
            OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ]
        })
    };

    // 1. Fetch Users AND Exchange Rates in parallel
    const [users, totalCount, exchangeRates] = await Promise.all([
        db.user.findMany({
            where: whereClause,
            include: { accounts: true },
            orderBy: { createdAt: 'desc' },
            take: itemsPerPage,
            skip: skip,
        }),
        db.user.count({ where: whereClause }),
        db.exchangeRate.findMany() // Fetch rates for conversion
    ]);

    // 2. Create Rate Map for fast lookup
    const rateMap = new Map<string, number>();
    exchangeRates.forEach(r => rateMap.set(r.currency, Number(r.rate)));

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleRow}>
                        {isArchivedView && (
                            <Link href="/admin/users" className={styles.backBtn} title="Back to Active Users">
                                <ArrowLeft size={20} />
                            </Link>
                        )}
                        <h1 className={styles.title}>
                            {isArchivedView ? 'Archived Users' : 'User Database'}
                        </h1>
                    </div>
                    <p className={styles.subtitle}>
                        {totalCount} users found • Viewing as <span className={styles.roleTag}>{currentUserRole}</span>
                    </p>
                </div>

                <div className={styles.actions}>
                    {!isArchivedView && (
                        <>
                            <UserSearch />
                            <UserFilters />
                        </>
                    )}

                    {canAccessBin && !isArchivedView && (
                        <Link
                            href="/admin/users?status=ARCHIVED"
                            className={styles.secondaryBtn}
                            title="View Deleted Users"
                        >
                            <Archive size={16} /> Bin
                        </Link>
                    )}

                    {!isArchivedView && (
                        <Link href="/admin/users/create" className={styles.addBtn}>
                            <UserPlus size={18} /> New User
                        </Link>
                    )}
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Profile</th>
                            <th>Role</th>
                            <th>KYC</th>
                            <th>Status</th>
                            <th>Balance</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className={styles.emptyState}>
                                        <p>
                                            {isArchivedView
                                                ? "No archived users found."
                                                : "No users found matching your criteria."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map(user => {
                                // 3. Calculate Balances
                                const totalBalUSD = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

                                // Determine currency & rate
                                const currency = user.currency || "USD";
                                const rate = currency === "USD" ? 1 : (rateMap.get(currency) || 1);
                                const convertedBal = totalBalUSD * rate;

                                return (
                                    <tr key={user.id} className={isArchivedView ? styles.archivedRow : ''}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                                {user.kycStatus.replace(/_/g, ' ')}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={styles.statusWrapper}>
                                                <span className={`${styles.statusDot} ${styles[user.status]}`}></span>
                                                {user.status.replace(/_/g, ' ')}
                                            </div>
                                        </td>

                                        {/* 4. Display Converted Balance */}
                                        <td className={styles.money}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                <span>
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(convertedBal)}
                                                </span>
                                                {currency !== 'USD' && (
                                                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                        ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalUSD)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className={styles.dateText}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.actionGroup}>
                                                {isArchivedView ? (
                                                    <ArchiveActions userId={user.id} />
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {totalCount > 0 && <Pagination totalPages={totalPages} />}
        </div>
    );
}