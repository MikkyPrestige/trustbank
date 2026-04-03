import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";
import AdminTicketList from "@/components/admin/support/AdminTicketList";
import styles from "../../../components/admin/support/support.module.css";

export default async function SupportPage() {
    const { authorized } = await checkAdminAction();
    if (!authorized) redirect("/dashboard");

    const tickets = await db.ticket.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            user: {
                select: { fullName: true, email: true }
            }
        }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Support Tickets</h1>
            </header>

            <AdminTicketList tickets={tickets} />
        </div>
    );
}