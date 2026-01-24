import { getLegalContent } from "@/lib/get-legal";
import LegalPageLayout from "@/components/main/legal/LegalPageLayout";

export default async function TermsPage() {
    const data = await getLegalContent('terms');

    return (
        <LegalPageLayout
            title="Terms of Use"
            type="terms"
            content={data.content}
            lastUpdated={data.lastUpdated}
        />
    );
}