import { getSiteSettings } from "@/lib/content/get-settings";
import ForgotPasswordCard from "@/components/auth/forgotPassword/ForgotPasswordCard";

export const metadata = {
    title: "Account Recovery | Secure",
};

export default async function ForgotPasswordPage() {
    const settings = await getSiteSettings();

    return (
        <ForgotPasswordCard
            siteName={settings.site_name}
            contactEmail={settings.contact_email}
            contactPhone={settings.contact_phone}
        />
    );
}