'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './users.module.css';

export default function Pagination({ totalPages }: { totalPages: number }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentPage = Number(searchParams.get('page')) || 1;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className={styles.pagination}>
            <div className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
            </div>
            <div className={styles.pageBtns}>
                <Link
                    href={createPageURL(currentPage - 1)}
                    className={`${styles.pageBtn} ${currentPage <= 1 ? styles.disabled : ''}`}
                    aria-disabled={currentPage <= 1}
                >
                    <ChevronLeft size={16} /> Prev
                </Link>
                <Link
                    href={createPageURL(currentPage + 1)}
                    className={`${styles.pageBtn} ${currentPage >= totalPages ? styles.disabled : ''}`}
                    aria-disabled={currentPage >= totalPages}
                >
                    Next <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}