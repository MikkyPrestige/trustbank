import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, User, Search } from "lucide-react";
import styles from "./users.module.css";

export default async function AdminUsersPage() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') redirect("/dashboard");

    const users = await db.user.findMany({
        where: { role: 'CLIENT' },
        include: { accounts: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Client Database</h1>
                <Link href="/admin/users/create" className={styles.addBtn}>
                    <Plus size={18} /> New User
                </Link>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Status</th>
                            <th>Accounts Balance</th>
                            <th>Date Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const totalBal = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);
                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.uName}>{user.fullName}</div>
                                        <div className={styles.uEmail}>{user.email}</div>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[user.status]}`}>{user.status}</span>
                                    </td>
                                    <td className={styles.money}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBal)}
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/admin/users/${user.id}`} className={styles.viewBtn}>
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}