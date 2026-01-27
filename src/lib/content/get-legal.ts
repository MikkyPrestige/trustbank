import { db } from "@/lib/db";
import { cache } from "react";
import {
    DEFAULT_PRIVACY,
    DEFAULT_TERMS,
    DEFAULT_ACCESSIBILITY
} from "@/lib/content/legal-defaults";

export const getLegalContent = cache(async (type: 'privacy' | 'terms' | 'accessibility') => {
    try {
        const settings = await db.siteSettings.findFirst();

        // 1. If DB is completely empty, return defaults immediately
        if (!settings) {
            return {
                content: getDefaultContent(type),
                lastUpdated: new Date()
            };
        }

        // 2. Select the correct column based on type
        let content = "";
        switch (type) {
            case 'privacy':
                content = settings.legal_privacy_policy;
                break;
            case 'terms':
                content = settings.legal_terms_service;
                break;
            case 'accessibility':
                content = settings.legal_accessibility_statement;
                break;
        }

        // 3. If the specific column is empty/short, fallback to default
        if (!content || content.length < 10) {
            content = getDefaultContent(type);
        }

        return {
            content,
            lastUpdated: settings.updatedAt
        };

    } catch (error) {
        console.error("Failed to fetch legal content:", error);
        return {
            content: getDefaultContent(type),
            lastUpdated: new Date()
        };
    }
});

// Helper to grab the right constant
function getDefaultContent(type: string) {
    if (type === 'privacy') return DEFAULT_PRIVACY;
    if (type === 'terms') return DEFAULT_TERMS;
    return DEFAULT_ACCESSIBILITY;
}