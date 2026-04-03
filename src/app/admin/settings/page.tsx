import { requireAdmin } from "@/lib/auth/admin-auth";
import { getSiteSettings } from "@/lib/content/get-settings";
import { db } from "@/lib/db";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export default async function AdminSettingsPage() {
    await requireAdmin();

    const [settings, managedAssets, currencies, footerLinks] = await Promise.all([
        getSiteSettings(),
        db.managedAsset.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.currency.findMany({orderBy: { code: 'asc' }}),
        db.footerLink.findMany({orderBy: { order: 'asc' }})
    ]);

    return (
        <SettingsForm
            settings={settings}
            currencies={currencies}
            initialManagedAssets={managedAssets}
            footerLinks={footerLinks}
        />
    );
}