'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import styles from './users.module.css';

export default function UserFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilter = (status: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Reset page

        if (status && status !== 'ALL') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            className={styles.filterSelect}
            onChange={(e) => handleFilter(e.target.value)}
            defaultValue={searchParams.get('status') || 'ALL'}
        >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending KYC</option>
            <option value="FROZEN">Frozen</option>
            <option value="SUSPENDED">Suspended</option>
        </select>
    );
}