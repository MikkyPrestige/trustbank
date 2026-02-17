'use client';

import { useState, useRef } from 'react';
import {
    DEFAULT_PRIVACY,
    DEFAULT_TERMS,
    DEFAULT_ACCESSIBILITY
} from "@/lib/content/legal-defaults";
import { Eye, Code2, RefreshCcw, Info } from 'lucide-react';
import styles from "../settings.module.css";

export function LegalTab({ settings }: { settings: any }) {
    const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});

    const [liveContent, setLiveContent] = useState<Record<string, string>>({
        privacy: settings.legal_privacy_policy,
        terms: settings.legal_terms_service,
        accessibility: settings.legal_accessibility_statement
    });

    // Refs for manual DOM manipulation
    const privacyRef = useRef<HTMLTextAreaElement>(null);
    const termsRef = useRef<HTMLTextAreaElement>(null);
    const accessRef = useRef<HTMLTextAreaElement>(null);

    const getInitialContent = (dbValue: string, placeholder: string, fullDefault: string) => {
        if (!dbValue || dbValue === placeholder) return fullDefault;
        return dbValue;
    };

    const handleRevert = (id: string, ref: React.RefObject<HTMLTextAreaElement | null>, defaultValue: string) => {
        if (confirm("Reset to system default?")) {
            if (ref.current) {
                ref.current.value = defaultValue;
                setLiveContent(prev => ({ ...prev, [id]: defaultValue }));
            }
        }
    };

    const togglePreview = (id: string, ref: React.RefObject<HTMLTextAreaElement | null>) => {
        if (!previewMode[id] && ref.current) {
            setLiveContent(prev => ({ ...prev, [id]: ref.current?.value || "" }));
        }
        setPreviewMode(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className={styles.grid}>
            <div className={`${styles.fullWidth} ${styles.infoBanner}`}>
                <Info size={20} />
                <p><strong>HTML Editor:</strong> Use <code>&lt;h2&gt;</code> for sections and <code>&lt;p&gt;</code> for text.</p>
            </div>

            {/* --- PRIVACY POLICY SECTION --- */}
            <div className={styles.legalSectionWrapper}>
                <div className={styles.legalHeader}>
                    <div className={styles.legalTitleGroup}>
                        <label className={styles.label}>Privacy Policy</label>
                        <button type="button" className={styles.revertBtn} onClick={() => handleRevert('privacy', privacyRef, DEFAULT_PRIVACY)}>
                            <RefreshCcw size={12} /> Reset
                        </button>
                    </div>
                    <button type="button" className={styles.previewToggle} onClick={() => togglePreview('privacy', privacyRef)}>
                        {previewMode['privacy'] ? <><Code2 size={14} /> Edit Code</> : <><Eye size={14} /> Preview</>}
                    </button>
                </div>
                <div className={styles.editorContainer}>
                    {previewMode['privacy'] ? (
                        <div className={styles.legalPreviewArea} dangerouslySetInnerHTML={{ __html: liveContent.privacy }} />
                    ) : (
                        <textarea
                            ref={privacyRef}
                            name="legal_privacy_policy"
                            defaultValue={getInitialContent(settings.legal_privacy_policy, "<p>Privacy Policy content...</p>", DEFAULT_PRIVACY)}
                            className={`${styles.textarea} ${styles.legalEditor}`}
                        />
                    )}
                </div>
            </div>

            {/* --- TERMS OF SERVICE SECTION --- */}
            <div className={styles.legalSectionWrapper}>
                <div className={styles.legalHeader}>
                    <div className={styles.legalTitleGroup}>
                        <label className={styles.label}>Terms of Service</label>
                        <button type="button" className={styles.revertBtn} onClick={() => handleRevert('terms', termsRef, DEFAULT_TERMS)}>
                            <RefreshCcw size={12} /> Reset
                        </button>
                    </div>
                    <button type="button" className={styles.previewToggle} onClick={() => togglePreview('terms', termsRef)}>
                        {previewMode['terms'] ? <><Code2 size={14} /> Edit Code</> : <><Eye size={14} /> Preview</>}
                    </button>
                </div>
                <div className={styles.editorContainer}>
                    {previewMode['terms'] ? (
                        <div className={styles.legalPreviewArea} dangerouslySetInnerHTML={{ __html: liveContent.terms }} />
                    ) : (
                        <textarea
                            ref={termsRef}
                            name="legal_terms_service"
                            defaultValue={getInitialContent(settings.legal_terms_service, "<p>Terms of Service content...</p>", DEFAULT_TERMS)}
                            className={`${styles.textarea} ${styles.legalEditor}`}
                        />
                    )}
                </div>
            </div>

            {/* --- ACCESSIBILITY SECTION --- */}
            <div className={styles.legalSectionWrapper}>
                <div className={styles.legalHeader}>
                    <div className={styles.legalTitleGroup}>
                        <label className={styles.label}>Accessibility Statement</label>
                        <button
                            type="button"
                            className={styles.revertBtn}
                            onClick={() => handleRevert('accessibility', accessRef, DEFAULT_ACCESSIBILITY)}
                        >
                            <RefreshCcw size={12} /> Reset
                        </button>
                    </div>
                    <button
                        type="button"
                        className={styles.previewToggle}
                        onClick={() => togglePreview('accessibility', accessRef)}
                    >
                        {previewMode['accessibility'] ? <><Code2 size={14} /> Edit Code</> : <><Eye size={14} /> Preview</>}
                    </button>
                </div>
                <div className={styles.editorContainer}>
                    {previewMode['accessibility'] ? (
                        <div
                            className={styles.legalPreviewArea}
                            dangerouslySetInnerHTML={{ __html: liveContent.accessibility }}
                        />
                    ) : (
                        <textarea
                            ref={accessRef}
                            name="legal_accessibility_statement"
                            defaultValue={getInitialContent(
                                settings.legal_accessibility_statement,
                                "<p>Accessibility content...</p>",
                                DEFAULT_ACCESSIBILITY
                            )}
                            className={`${styles.textarea} ${styles.legalEditor}`}
                        />
                    )}
                </div>
            </div>

            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Navigation Mapping</h3>
            </div>

            <div className={styles.fullWidth}><strong className={styles.sectionSubtitle}>Privacy</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="legal_nav_privacy_label" defaultValue={settings.legal_nav_privacy_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Slug</label>
                    <input name="legal_privacy_slug" defaultValue={settings.legal_privacy_slug} placeholder="/path" className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>ID</label>
                    <input name="legal_nav_privacy_id" defaultValue={settings.legal_nav_privacy_id} className={styles.input} />
                </div>
            </div>
            <div className={styles.fullWidth}><strong className={styles.sectionSubtitle}>Terms</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="legal_nav_terms_label" defaultValue={settings.legal_nav_terms_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Slug</label>
                    <input name="legal_terms_slug" defaultValue={settings.legal_terms_slug} placeholder="/path" className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>ID</label>
                    <input name="legal_nav_terms_id" defaultValue={settings.legal_nav_terms_id} className={styles.input} />
                </div>
            </div>

            <div className={styles.fullWidth}><strong className={styles.sectionSubtitle}>Accessibility</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="legal_nav_accessibility_label" defaultValue={settings.legal_nav_accessibility_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Slug</label>
                    <input name="legal_accessibility_slug" defaultValue={settings.legal_accessibility_slug} placeholder="/path" className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>ID</label>
                    <input name="legal_nav_accessibility_id" defaultValue={settings.legal_nav_accessibility_id} className={styles.input} />
                </div>
            </div>

            <div className={styles.fullWidth}>
                <div className={styles.sectionHeaderLine}>
                    <h3 className={styles.sectionTitle}>Shared Layout Settings</h3>
                    <p className={styles.sectionSubtitle}>These labels apply to all three legal pages.</p>
                </div>
            </div>
            {/* --- SHARED SETTINGS --- */}
            <div className={styles.group}>
                <label className={styles.label}>&quot;Last Updated&quot; Label</label>
                <input
                    name="legal_updated_label"
                    defaultValue={settings.legal_updated_label}
                    className={styles.input}
                />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Back Button Text</label>
                    <input
                        name="legal_back_text"
                        defaultValue={settings.legal_back_text}
                        className={styles.input}
                    />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Back Button URL</label>
                    <input name="legal_back_url" defaultValue={settings.legal_back_url}
                        className={styles.input}
                        placeholder="/"
                    />
                </div>
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Footer Disclaimer Text</label>
                <textarea
                    name="legal_footer_text"
                    defaultValue={settings.legal_footer_text}
                    className={styles.textarea}
                />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Footer Link Text</label>
                <input
                    name="legal_contact_text"
                    defaultValue={settings.legal_contact_text}
                    className={styles.input}
                />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Footer Link URL</label>
                <input
                    name="legal_contact_url"
                    defaultValue={settings.legal_contact_url}
                    className={styles.input}
                />
            </div>
        </div>
    );
}