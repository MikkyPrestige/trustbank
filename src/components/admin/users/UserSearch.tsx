'use client';

import { Search } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import styles from './users.module.css';

export default function UserSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // 1. Create the search handler
    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);

        // Reset to page 1 on new search
        params.set('page', '1');

        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    // 2. Debounce Logic (Memoized so it doesn't reset on re-renders)
    const debouncedSearch = useMemo(() => {
        let timeout: NodeJS.Timeout;

        return (term: string) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => handleSearch(term), 300);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]); // Re-create only if path params change

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