import { getSiteSettings } from "@/lib/content/get-settings";
import LegalPageLayout from "@/components/main/legal/LegalPageLayout";
import { notFound } from "next/navigation";

export default async function DynamicLegalPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const settings = await getSiteSettings();
    const currentPath = `/${slug}`;

    // 1. Determine which "type"
    let type: 'privacy' | 'terms' | 'accessibility' | null = null;

    if (settings.legal_privacy_slug === currentPath) type = 'privacy';
    else if (settings.legal_terms_slug === currentPath) type = 'terms';
    else if (settings.legal_accessibility_slug === currentPath) type = 'accessibility';

    if (!type) notFound();

    // 2. Extract specific content based on identified type
    const pageData = {
        privacy: {
            title: settings.legal_nav_privacy_label,
            content: settings.legal_privacy_policy,
            updated: settings.legal_privacy_updated
        },
        terms: {
            title: settings.legal_nav_terms_label,
            content: settings.legal_terms_service,
            updated: settings.legal_terms_updated
        },
        accessibility: {
            title: settings.legal_nav_accessibility_label,
            content: settings.legal_accessibility_statement,
            updated: settings.legal_accessibility_updated
        }
    }[type];

    return (
        <LegalPageLayout
            type={type}
            title={pageData.title}
            content={pageData.content}
            lastUpdated={pageData.updated}
            backText={settings.legal_back_text}
            backUrl={settings.legal_back_url}
            updatedLabel={settings.legal_updated_label}
            footerText={settings.legal_footer_text}
            linkText={settings.legal_contact_text}
            linkUrl={settings.legal_contact_url}
            navConfig={{
                privacy: {
                    label: settings.legal_nav_privacy_label,
                    href: settings.legal_privacy_slug,
                    id: settings.legal_nav_privacy_id
                },
                terms: {
                    label: settings.legal_nav_terms_label,
                    href: settings.legal_terms_slug,
                    id: settings.legal_nav_terms_id
                },
                accessibility: {
                    label: settings.legal_nav_accessibility_label,
                    href: settings.legal_accessibility_slug,
                    id: settings.legal_nav_accessibility_id
                }
            }}
        />
    );
}

// Ensure Next.js knows which slugs to pre-render at build time
export async function generateStaticParams() {
    const settings = await getSiteSettings();
    const paths = [
        settings.legal_privacy_slug,
        settings.legal_terms_slug,
        settings.legal_accessibility_slug,
    ].filter(Boolean);

    return paths.map((path) => ({
        slug: path.replace(/^\//, ''),
    }));
}