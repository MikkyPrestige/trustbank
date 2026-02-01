import { Phone, MessageSquare } from 'lucide-react';
import styles from './help.module.css';

interface ContactStripProps {
    settings: any;
}

export default function ContactStrip({ settings }: ContactStripProps) {
    return (
        <div className={styles.contactStrip}>
            <h2>{settings.help_cta_title}</h2>
            <p>{settings.help_cta_desc}</p>

            <div className={styles.contactActions}>
                <a href={`tel:${settings.support_phone}`} className={styles.contactBtn}>
                    <Phone size={18} /> Call Support
                </a>

                <a href="/help" className={styles.chatBtn}>
                    <MessageSquare size={18} /> Live Chat
                </a>
            </div>
        </div>
    );
}