'use client';

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadMediaAction } from "@/actions/admin/upload-media";
import { UploadCloud, X, Loader2 } from "lucide-react";
import styles from "./uploader.module.css";

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUploader({ value, onChange, label = "Upload Image" }: ImageUploaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Server Action
            const res = await uploadMediaAction(formData);

            if (res.error) {
                alert(res.error);
            } else if (res.url) {
                onChange(res.url);
            }
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

            {/* 1. PREVIEW MODE */}
            {value ? (
                <div className={styles.previewBox}>
                    <Image
                        src={value}
                        alt="Uploaded logo"
                        fill
                        className={styles.previewImg}
                    />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className={styles.removeBtn}
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                // 2. UPLOAD MODE
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.uploadBox}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" color="var(--primary)" />
                    ) : (
                        <>
                            <UploadCloud className={styles.uploadIcon} />
                            <span className={styles.uploadText}>Click to upload</span>
                        </>
                    )}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/png, image/jpeg, image/webp"
                className={styles.hiddenInput}
            />
        </div>
    );
}