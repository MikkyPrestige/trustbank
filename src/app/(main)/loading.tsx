import styles from './loading.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            {/* Header Skeleton */}
            <div className={`${styles.shimmer} ${styles.header}`} />

            {/* Main Account Card Skeleton */}
            <div className={`${styles.shimmer} ${styles.card}`} />

            {/* Transaction List Skeletons */}
            <div className={`${styles.shimmer} ${styles.row}`} />
            <div className={`${styles.shimmer} ${styles.row}`} />
            <div className={`${styles.shimmer} ${styles.row}`} />
        </div>
    );
}