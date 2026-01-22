import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import TicketChat from "@/components/dashboard/support/TicketChat";
import styles from "../../../../../components/dashboard/support/support.module.css";
import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";

export default async function TicketDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { id } = await params;

    // Fetch ticket with messages
    const ticket = await db.ticket.findUnique({
        where: { id, userId: session.user.id },
        include: {
            messages: { orderBy: { createdAt: 'asc' } }
        }
    });

    if (!ticket) return notFound();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/dashboard/support" className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h1 className={styles.title}>{ticket.subject}</h1>
                            <span className={styles.statusBadge} style={{
                                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'
                            }}>
                                {ticket.status}
                            </span>
                        </div>
                        <p className={styles.subtitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Hash size={14} /> Ticket ID: {ticket.id}
                        </p>
                    </div>
                </div>
            </header>

            <div className={styles.chatWrapper}>
                <TicketChat ticket={ticket} />
            </div>
        </div>
    );
}