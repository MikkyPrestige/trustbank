import { Suspense } from "react";
import { getSiteSettings } from "@/lib/content/get-settings";
import RegisterForm from "@/components/auth/register/RegisterForm";

export default async function RegisterPage() {
    const settings = await getSiteSettings();

    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <RegisterForm siteName={settings.site_name} />
        </Suspense>
    );
}