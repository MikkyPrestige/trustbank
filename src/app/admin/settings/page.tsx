import { requireAdmin } from "@/lib/auth/admin-auth";
import { getSiteSettings } from "@/lib/content/get-settings";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export default async function AdminSettingsPage() {
    await requireAdmin();
    const settings = await getSiteSettings();

    return <SettingsForm settings={settings} />;
}