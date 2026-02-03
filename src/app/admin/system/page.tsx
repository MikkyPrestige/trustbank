import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { Server } from "lucide-react";
import styles from "../../../components/admin/system/system.module.css";
import SystemRulesForm from "@/components/admin/system/SystemRulesForm";

export default async function SystemRulesPage() {
    await requireAdmin();

    // 1. Fetch Standard System Rules
    const currentSettings = await db.systemSettings.findMany();

    // 2. Fetch Main Site Settings
    const siteSettings = await db.siteSettings.findFirst();

    // 3. Format Data
    const values = currentSettings.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {} as Record<string, string>);

    if (siteSettings) {
        values['auth_login_limit'] = (siteSettings.auth_login_limit ?? 5).toString();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <Server size={28} className={styles.icon} />
                    System Configuration
                </h1>
                <p className={styles.subtitle}>
                    Critical banking rules, security thresholds, and feature flags.
                    <br />
                    <span className={styles.warning}>
                        Changes here affect the live banking core immediately.
                    </span>
                </p>
            </div>

            <SystemRulesForm initialValues={values} />
        </div>
    );
}