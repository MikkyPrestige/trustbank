import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TicketList from "@/components/dashboard/support/TicketList";
import CreateTicketModal from "@/components/dashboard/support/CreateTicketModal";
import styles from "../../../../components/dashboard/support/support.module.css"
import { LifeBuoy } from "lucide-react";

export default async function SupportPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const tickets = await db.ticket.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>
                        <LifeBuoy size={30} />
                    </div>
                    <div>
                        <h1 className={styles.title}>Help Center</h1>
                        <p className={styles.subtitle}>Track your support requests and get help.</p>
                    </div>
                </div>
                <CreateTicketModal />
            </header>

            <div className={styles.content}>
                <TicketList tickets={tickets} />
            </div>
        </div>
    );
}