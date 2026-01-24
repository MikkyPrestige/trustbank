import { requireAdmin } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/get-settings";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export default async function AdminSettingsPage() {
    await requireAdmin();
    const settings = await getSiteSettings();

    return <SettingsForm settings={settings} />;
}