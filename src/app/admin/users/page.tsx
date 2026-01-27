import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, History, UserPlus, Archive, ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { auth } from "@/auth";
import UserSearch from "@/components/admin/users/UserSearch";
import UserFilters from "@/components/admin/users/UserFilters";
import Pagination from "@/components/admin/users/Pagination";
import UserAvatar from "@/components/admin/users/UserAvatar";
import QuickActions from "@/components/admin/users/QuickActions";
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

                    {isSuperAdmin && !isArchivedView && (
                        <Link
                            href="/admin/users?status=ARCHIVED"
                            className={styles.secondaryBtn}
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
                                const totalBal = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

                                return (
                                    /* 👇 Updated: Using archivedRow class instead of inline style */
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

                                        <td className={styles.money}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBal)}
                                        </td>

                                        <td className={styles.dateText}>{new Date(user.createdAt).toLocaleDateString()}</td>

                                        <td>
                                            <div className={styles.actionGroup}>
                                                {!isArchivedView && (
                                                    <QuickActions userId={user.id} currentStatus={user.status} />
                                                )}

                                                <Link href={`/admin/users/${user.id}`} className={styles.viewBtn}>
                                                    {isArchivedView ? 'View' : 'Manage'}
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
            </div>

            {totalCount > 0 && <Pagination totalPages={totalPages} />}
        </div>
    );
}



// import { db } from "@/lib/db";
// import Link from "next/link";
// import { Plus, History, UserPlus } from "lucide-react";
// import { requireAdmin } from "@/lib/admin-auth";
// import { auth } from "@/auth";
// import UserSearch from "@/components/admin/users/UserSearch";
// import UserFilters from "@/components/admin/users/UserFilters";
// import Pagination from "@/components/admin/users/Pagination";
// import UserAvatar from "@/components/admin/users/UserAvatar";
// import QuickActions from "@/components/admin/users/QuickActions";
// import { Prisma } from "@prisma/client";
// import styles from "../../../components/admin/users/users.module.css"

// export default async function AdminUsersPage({
//     searchParams
// }: {
//     searchParams: Promise<{ query?: string; page?: string; status?: string }>
// }) {
//     // 1. Security Check
//     await requireAdmin();
//     const session = await auth();
//     const currentUserRole = session?.user?.role;

//     // 2. Parse Search Params
//     const { query, page, status } = await searchParams;
//     const currentPage = Number(page) || 1;
//     const itemsPerPage = 10;
//     const skip = (currentPage - 1) * itemsPerPage;

//     // 1. Define Visibility Logic
//     let roleScope: Prisma.UserWhereInput = {};

//     if (currentUserRole === 'SUPER_ADMIN') {
//         // Super Admin sees EVERYONE
//         roleScope = {};
//     } else if (currentUserRole === 'ADMIN') {
//         // Admin sees CLIENTS and SUPPORT staff
//         roleScope = { role: { in: ['CLIENT', 'SUPPORT'] } };
//     } else {
//         // Support sees ONLY CLIENTS
//         roleScope = { role: 'CLIENT' };
//     }

//     // 3. Construct Database Query
//     const whereClause: Prisma.UserWhereInput = {
//         ...roleScope,

//         // Filter by Status (if selected)
//         ...(status ? { status: status as any } : {}),

//         // Search by Name or Email (if typing)
//         ...(query && {
//             OR: [
//                 { fullName: { contains: query, mode: 'insensitive' } },
//                 { email: { contains: query, mode: 'insensitive' } },
//             ]
//         })
//     };

//     // 4. Fetch Data & Count (Parallel Request)
//     const [users, totalCount] = await Promise.all([
//         db.user.findMany({
//             where: whereClause,
//             include: { accounts: true },
//             orderBy: { createdAt: 'desc' },
//             take: itemsPerPage,
//             skip: skip,
//         }),
//         db.user.count({ where: whereClause })
//     ]);

//     const totalPages = Math.ceil(totalCount / itemsPerPage);

//     return (
//         <div className={styles.container}>
//             <header className={styles.header}>
//                 <div className={styles.headerContent}>
//                     <h1 className={styles.title}>User Database</h1>
//                     <p className={styles.subtitle}>
//                         {totalCount} records found • Viewing as <span className={styles.roleTag}>{currentUserRole}</span>
//                     </p>
//                 </div>

//                 <div className={styles.actions}>
//                     {/* Interactive Client Components */}
//                     <UserSearch />
//                     <UserFilters />

//                     <Link href="/admin/users/create" className={styles.addBtn}>
//                         <UserPlus size={18} /> New User
//                     </Link>
//                 </div>
//             </header>

//             <div className={styles.tableCard}>
//                 <table className={styles.table}>
//                     <thead>
//                         <tr>
//                             <th>User Profile</th>
//                             <th>Role</th>
//                             <th>KYC Status</th>
//                             <th>Account Status</th>
//                             <th>Total Balance</th>
//                             <th>Joined</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {users.length === 0 ? (
//                             <tr>
//                                 <td colSpan={7}>
//                                     <div className={styles.emptyState}>
//                                         <p>No users found matching your criteria.</p>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ) : (
//                             users.map(user => {
//                                 // Calculate total balance across all accounts
//                                 const totalBal = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

//                                 return (
//                                     <tr key={user.id}>
//                                         <td>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                                                 {/* Visual Avatar */}
//                                                 <UserAvatar src={user.image} name={user.fullName} />

//                                                 <div>
//                                                     <div className={styles.uName}>{user.fullName}</div>
//                                                     <div className={styles.uEmail}>{user.email}</div>
//                                                 </div>
//                                             </div>
//                                         </td>

//                                         <td>
//                                             <span className={`${styles.badge} ${styles[user.role]}`}>
//                                                 {user.role}
//                                             </span>
//                                         </td>

//                                         <td>
//                                             <span className={`${styles.kycBadge} ${styles[user.kycStatus]}`}>
//                                                 {user.kycStatus.replace(/_/g, ' ')}
//                                             </span>
//                                         </td>

//                                         <td>
//                                             <div className={styles.statusWrapper}>
//                                                 <span className={`${styles.statusDot} ${styles[user.status]}`}></span>
//                                                 {user.status.replace(/_/g, ' ')}
//                                             </div>
//                                         </td>

//                                         <td className={styles.money}>
//                                             {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBal)}
//                                         </td>

//                                         <td className={styles.dateText}>{new Date(user.createdAt).toLocaleDateString()}</td>

//                                         <td>
//                                             <div className={styles.actionGroup}>
//                                                 {/* Quick Action Dropdown (Freeze/Suspend) */}
//                                                 <QuickActions userId={user.id} currentStatus={user.status} />

//                                                 <Link href={`/admin/users/${user.id}`} className={styles.viewBtn}>
//                                                     Manage
//                                                 </Link>

//                                                 <Link
//                                                     href={`/admin/users/${user.id}/transactions`}
//                                                     className={styles.iconBtn}
//                                                     title="View History"
//                                                 >
//                                                     <History size={16} />
//                                                 </Link>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )
//                             })
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination Controls */}
//             {totalCount > 0 && <Pagination totalPages={totalPages} />}
//         </div>
//     );
// }