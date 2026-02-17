import { Phone, MessageSquare } from 'lucide-react';
import styles from './help.module.css';

interface ContactStripProps {
    settings: any;
}

export default function ContactStrip({ settings }: ContactStripProps) {
    return (
        <div className={styles.contactStrip}>
            <h2>{settings.help_contact_title}</h2>
            <p>{settings.help_contact_desc}</p>

            <div className={styles.contactActions}>
                <a href={`tel:${settings.support_phone}`} className={styles.contactBtn}>
                    <Phone size={18} /> {settings.help_contact_btn1_text}
                </a>

                <a href={settings.help_contact_btn2_link} className={styles.chatBtn}>
                    <MessageSquare size={18} /> {settings.help_contact_btn2_text}
                </a>
            </div>
        </div>
    );
}