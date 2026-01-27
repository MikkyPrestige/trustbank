import { Search } from 'lucide-react';
import styles from './help.module.css';

interface HelpHeroProps {
    settings: any;
}

export default function HelpHero({ settings }: HelpHeroProps) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroMesh}></div>
            <h1 className={styles.title}>{settings.help_hero_title}</h1>
            <p className={styles.subtitle}>{settings.help_hero_desc}</p>

            <div className={styles.searchWrapper}>
                <div className={styles.searchInputWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="e.g. 'Routing number' or 'Wire limit'"
                        className={styles.searchInput}
                    />
                </div>
            </div>
        </section>
    );
}