'use client';

import { Printer, Share2 } from "lucide-react";

// We accept the styles object as a prop so we can keep using your CSS module
export default function ReceiptActions({ styles }: { styles: any }) {

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