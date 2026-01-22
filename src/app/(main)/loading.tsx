import styles from './loading.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            {/* Header Skeleton (Title + Name) */}
            <div className={styles.headerGroup}>
                <div className={`${styles.shimmer} ${styles.title}`} />
                <div className={`${styles.shimmer} ${styles.subtitle}`} />
            </div>

            {/* Main Account Card Skeleton */}
            <div className={`${styles.shimmer} ${styles.card}`} />

            {/* Quick Actions Row */}
            <div className={styles.actionsRow}>
                <div className={`${styles.shimmer} ${styles.circle}`} />
                <div className={`${styles.shimmer} ${styles.circle}`} />
                <div className={`${styles.shimmer} ${styles.circle}`} />
                <div className={`${styles.shimmer} ${styles.circle}`} />
            </div>

            {/* Transaction List Header */}
            <div className={`${styles.shimmer} ${styles.sectionTitle}`} />

            {/* Transaction Rows */}
            <div className={`${styles.shimmer} ${styles.row}`} />
            <div className={`${styles.shimmer} ${styles.row}`} />
            <div className={`${styles.shimmer} ${styles.row}`} />
        </div>
    );
}