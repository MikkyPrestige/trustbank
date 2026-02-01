import { requireAdmin } from "@/lib/auth/admin-auth";
import { getSiteSettings } from "@/lib/content/get-settings";
import { db } from "@/lib/db";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export default async function AdminSettingsPage() {
    await requireAdmin();

    const settings = await getSiteSettings();

    const footerLinks = await db.footerLink.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <SettingsForm
            settings={settings}
            footerLinks={footerLinks}
        />
    );
}