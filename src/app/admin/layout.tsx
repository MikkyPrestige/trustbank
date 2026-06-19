import { auth } from "@/auth";
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
    const settings = await getSiteSettings();

    return (
        <div className={styles.layoutContainer}>
            <AdminNav
                role={role}
                logoUrl={settings.site_logo}
                siteName={settings.site_name}
            />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
