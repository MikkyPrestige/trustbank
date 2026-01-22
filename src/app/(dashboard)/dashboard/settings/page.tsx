import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsTabs from "@/components/dashboard/settings/SettingsTabs";
import styles from "../../../../components/dashboard/settings/settings.module.css";

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email! }
    });

    if (!user) return null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Account Settings</h1>
                <p className={styles.subtitle}>Manage your profile details and security preferences.</p>
            </header>

            <SettingsTabs user={user} />
        </div>
    );
}