import { Search } from 'lucide-react';
import styles from './help.module.css';

export default function HelpHero() {
    return (
        <section className={styles.hero}>
            <div className={styles.heroMesh}></div>
            <h1 className={styles.title}>How can we help you?</h1>
            <p className={styles.subtitle}>Search for topics, features, or troubleshooting guides.</p>

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