/* eslint-disable @next/next/no-img-element */

'use client';

import styles from './users.module.css';
import { User } from 'lucide-react';

export default function UserAvatar({ src, name }: { src?: string | null, name: string }) {
    // 1. If image exists, show it
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={styles.avatarImg}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
                }}
            />
        );
    }

    // 2. Fallback: Generate Initials
    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className={styles.avatarPlaceholder}>
            {initials || <User size={16} />}
        </div>
    );
}