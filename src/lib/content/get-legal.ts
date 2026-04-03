import { db } from "@/lib/db";
import { cache } from "react";
import {
    DEFAULT_PRIVACY,
    DEFAULT_TERMS,
    DEFAULT_ACCESSIBILITY
} from "@/lib/content/legal-defaults";

export type LegalContentResult = {
    content: string;
    lastUpdated: Date;
    backText: string;
    footerText: string;
    linkText: string;
    linkUrl: string;
    updatedLabel: string;
};

export const getLegalContent = cache(async (type: 'privacy' | 'terms' | 'accessibility'): Promise<LegalContentResult> => {

    const defaultLayout = {
        backText: "Back to Home",
        footerText: "This document is legally binding. If you have questions, please contact our",
        linkText: "compliance team",
        linkUrl: "/help",
        updatedLabel: "Last Updated:"
    };

    try {
        const settings = await db.siteSettings.findFirst({
            include: { content: true }
        });

        // 3. Merge DB settings with defaults
        const layoutConfig = {
            backText: settings?.content?.legal_back_text || defaultLayout.backText,
            footerText: settings?.content?.legal_footer_text || defaultLayout.footerText,
            linkText: settings?.content?.legal_contact_text || defaultLayout.linkText,
            linkUrl: settings?.content?.legal_contact_url || defaultLayout.linkUrl,
            updatedLabel: settings?.content?.legal_updated_label || defaultLayout.updatedLabel,
        };

        if (!settings || !settings.content) {
            return {
                content: getDefaultContent(type),
                lastUpdated: new Date(),
                ...layoutConfig
            };
        }

        let content = "";
        switch (type) {
            case 'privacy':
                content = settings.content.legal_privacy_policy;
                break;
            case 'terms':
                content = settings.content.legal_terms_service;
                break;
            case 'accessibility':
                content = settings.content.legal_accessibility_statement;
                break;
        }

        const isPlaceholder =
            content === "<p>Privacy Policy content...</p>" ||
            content === "<p>Terms of Service content...</p>" ||
            content === "<p>Accessibility content...</p>";

        // Fallback
        if (!content || content.length < 50 || isPlaceholder) {
            content = getDefaultContent(type);
        }

        return {
            content,
            lastUpdated: settings.updatedAt,
            ...layoutConfig
        };

    } catch (error) {
        console.error("Failed to fetch legal content:", error);

        return {
            content: getDefaultContent(type),
            lastUpdated: new Date(),
            ...defaultLayout
        };
    }
});

function getDefaultContent(type: string) {
    if (type === 'privacy') return DEFAULT_PRIVACY;
    if (type === 'terms') return DEFAULT_TERMS;
    return DEFAULT_ACCESSIBILITY;
}