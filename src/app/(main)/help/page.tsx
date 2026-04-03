import { getSiteSettings } from "@/lib/content/get-settings";
import { getFaqs } from '@/lib/content/get-faqs';
import HelpHero from '@/components/main/help/HelpHero';
import QuickActions from '@/components/main/help/QuickActions';
import FaqList from '@/components/main/help/FaqList';
import ContactStrip from '@/components/main/help/ContactStrip';
import styles from '../../../components/main/help/help.module.css';

export default async function HelpPage() {
    const [settings, faqs] = await Promise.all([
        getSiteSettings(),
        getFaqs()
    ]);

    return (
        <main className={styles.main}>
            <HelpHero settings={settings} />
            <div className={styles.container}>
                <QuickActions settings={settings} />
                <FaqList faqs={faqs} settings={settings} />
                <ContactStrip settings={settings} />
            </div>
        </main>
    );
}