import { getLegalContent } from "@/lib/content/get-legal";
import LegalPageLayout from "@/components/main/legal/LegalPageLayout";

export default async function AccessibilityPage() {
    const data = await getLegalContent('accessibility');

    return (
        <LegalPageLayout
            title="Accessibility Statement"
            type="privacy"
            content={data.content}
            lastUpdated={data.lastUpdated}
        />
    );
}