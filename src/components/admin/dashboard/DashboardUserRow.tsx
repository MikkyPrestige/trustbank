"use client";

import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface Props {
    user: User & { accounts: any[] };
    styles: any;
    exchangeRate?: number;
}

export default function DashboardUserRow({ user, styles, exchangeRate = 1 }: Props) {
    const router = useRouter();

    const totalBalUSD = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

    // @ts-ignore
    const currency = user.currency || "USD";
    const convertedBal = totalBalUSD * exchangeRate;

    return (
        <tr
            key={user.id}
            onClick={() => router.push(`/admin/users/${user.id}`)}
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

            <td style={{ textAlign: 'center' }}>
                {user.kycStatus === 'VERIFIED' ? (
                    <div title="Verified">
                        <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                    </div>
                ) : user.kycStatus === 'PENDING' ? (
                    <div title="Pending Review">
                            <Clock size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                ) : (
                    <div title="Not Submitted / Failed">
                        <XCircle size={18} style={{ color: 'var(--danger)', opacity: 0.5 }} />
                    </div>
                )}
            </td>

            <td>
                <div className={styles.balancePrimary} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                    <span>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(convertedBal)}
                    </span>

                    {currency !== 'USD' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalUSD)}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
}