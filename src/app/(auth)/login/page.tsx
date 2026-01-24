import { getSiteSettings } from "@/lib/get-settings";
import LoginForm from "@/components/auth/login/LoginForm";

export default async function LoginPage() {
    const settings = await getSiteSettings();

    return <LoginForm siteName={settings.site_name} />
}