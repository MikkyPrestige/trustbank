'use client';

import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import styles from './users.module.css';

export default function UserSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Standard debounce logic without external libraries
    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);

        // Always reset to page 1 when searching
        params.set('page', '1');

        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }

        // Update URL without reloading the page
        replace(`${pathname}?${params.toString()}`);
    };

    // Helper to debounce the input
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const debouncedSearch = debounce(handleSearch, 300);

    return (
        <div className={styles.searchForm}>
            <Search size={16} className={styles.searchIcon} />
            <input
                placeholder="Search name or email..."
                onChange={(e) => debouncedSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
                className={styles.searchInput}
            />
        </div>
    );
}