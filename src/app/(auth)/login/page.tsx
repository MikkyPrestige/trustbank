import { getSiteSettings } from "@/lib/content/get-settings";
import { getBooleanSetting } from "@/lib/security";
import LoginForm from "@/components/auth/login/LoginForm";

export default async function LoginPage() {
    const settings = await getSiteSettings();
    const isRegisterEnabled = await getBooleanSetting('feature_register_enabled', true);

    return <LoginForm siteName={settings.site_name} allowRegister={isRegisterEnabled} />
}