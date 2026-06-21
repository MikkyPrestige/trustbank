'use client';

import styles from "./receipt.module.css";
import { Printer, Share2, ImageDown } from "lucide-react";

export default function ReceiptActions() {

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Transaction Receipt',
                    text: 'Check out this transaction receipt.',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            alert("Sharing is not supported on this device/browser.");
        }
    };

    const handleSaveImage = async () => {
        const el = document.getElementById('receipt-card');
        if (!el) return;

        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    return (
        <div className={styles.footer}>
            <button className={styles.actionBtn} onClick={handlePrint}>
                <Printer size={18} /> Print
            </button>

            <button className={styles.actionBtn} onClick={handleSaveImage}>
                <ImageDown size={18} /> Save as Image
            </button>

            <button className={styles.actionBtn} onClick={handleShare}>
                <Share2 size={18} /> Share
            </button>
        </div>
    );
}