import { auth } from "@/auth";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { getSiteSettings } from "@/lib/content/get-settings";
import AdminNav from "./AdminNav";
import styles from "./admin.module.css";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    const session = await auth();
    const role = session?.user?.role;

    const [settings, ticketUnreadCount] = await Promise.all([
        getSiteSettings(),
        session?.user?.id
            ? db.notification.count({
                where: { userId: session.user.id, isRead: false, link: { startsWith: '/admin/support' } }
            })
            : Promise.resolve(0)
    ]);

    return (
        <div className={styles.layoutContainer}>
            <AdminNav
                role={role}
                logoUrl={settings.site_logo}
                siteName={settings.site_name}
                ticketUnreadCount={ticketUnreadCount}
            />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
