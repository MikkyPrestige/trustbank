import { getLegalContent } from "@/lib/get-legal";
import LegalPageLayout from "@/components/main/legal/LegalPageLayout";

export default async function PrivacyPage() {
    const data = await getLegalContent('privacy');

    return (
        <LegalPageLayout
            title="Privacy Policy"
            type="privacy"
            content={data.content}
            lastUpdated={data.lastUpdated}
        />
    );
}