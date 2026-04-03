import { db } from "@/lib/db";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { redirect, notFound } from "next/navigation";
import AdminChat from "@/components/admin/support/AdminChat";
import styles from "../../../../components/admin/support/support.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TicketDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const { authorized } = await checkAdminAction();
    if (!authorized) redirect("/dashboard");

    const ticket = await db.ticket.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            },
            user: {
                select: { fullName: true, email: true }
            }
        }
    });

    if (!ticket) return notFound();

    return (
        <div className={styles.container}>
            <div className={styles.headerActions}>
                <Link href="/admin/support" className={styles.backBtn}>
                    <ArrowLeft size={16} /> Back to Tickets
                </Link>
            </div>

            <div className={styles.ticketHeader}>
                <h1 className={styles.title}>{ticket.subject}</h1>
                <p className={styles.subtitle}>
                    Talking to: <strong>{ticket.user.fullName}</strong> ({ticket.user.email})
                </p>
            </div>

            <AdminChat
                ticketId={ticket.id}
                messages={ticket.messages}
                status={ticket.status}
            />
        </div>
    );
}