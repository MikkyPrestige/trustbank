'use client';

import styles from "./receipt.module.css";
import { Printer, Share2 } from "lucide-react";

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

    return (
        <div className={styles.footer}>
            <button className={styles.actionBtn} onClick={handlePrint}>
                <Printer size={18} /> Print
            </button>

            <button className={styles.actionBtn} onClick={handleShare}>
                <Share2 size={18} /> Share
            </button>
        </div>
    );
}