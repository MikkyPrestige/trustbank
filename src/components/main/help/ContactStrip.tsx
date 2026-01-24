import { Phone, MessageSquare } from 'lucide-react';
import styles from './help.module.css';

export default function ContactStrip() {
    return (
        <div className={styles.contactStrip}>
            <h2>Still need help?</h2>
            <p>Our concierge support team is available 24/7 for Enterprise clients.</p>

            <div className={styles.contactActions}>
                <a href="tel:1-800-TRUST" className={styles.contactBtn}>
                    <Phone size={18} /> Call Support
                </a>

                <a href="#" className={styles.chatBtn}>
                    <MessageSquare size={18} /> Live Chat
                </a>
            </div>
        </div>
    );
}