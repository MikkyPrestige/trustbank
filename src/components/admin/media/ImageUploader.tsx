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
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // upload logic for both Click and Drop
    const processUpload = async (file: File) => {
        if (!file) return;
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processUpload(file);
    };

    // --- Drag and Drop Handlers ---
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            processUpload(file);
        } else {
            alert("Please drop a valid image file");
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

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
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`${styles.uploadBox} ${isDragging ? styles.dragging : ""}`}
                >
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                                <Loader2 className={styles.spin} color="var(--primary)" />
                            <span className={styles.uploadText}>Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <UploadCloud className={styles.uploadIcon} />
                            <span className={styles.uploadText}>
                                {isDragging ? "Drop to upload" : "Click or drag image here"}
                            </span>
                        </>
                    )}
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className={styles.hiddenInput}
            />
        </div>
    );
}