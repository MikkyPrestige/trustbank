"use client";

import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface Props {
    user: User & { accounts: any[] };
    styles: any;
}

export default function DashboardUserRow({ user, styles }: Props) {
    const router = useRouter();

    const totalBal = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

    return (
        <tr
            key={user.id}
            onClick={() => router.push(`/admin/users/${user.id}`)} // 👈 Navigation
            style={{ cursor: 'pointer' }}
        >
            <td>
                <div className={styles.userInfo}>
                    <span style={{ fontWeight: 600 }}>{user.fullName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </td>
            <td className={styles.userEmail}>{user.email}</td>
            <td>
                <span className={`${styles.statusBadge} ${user.status === 'ACTIVE' ? styles.active : styles.inactive}`}>
                    {user.status}
                </span>
            </td>
            <td>{user.kycStatus === 'VERIFIED' ? '✅' : user.kycStatus === 'PENDING' ? '⏳' : '❌'}</td>
            <td>
                <div className={styles.balancePrimary}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBal)}
                </div>
            </td>
        </tr>
    );
}