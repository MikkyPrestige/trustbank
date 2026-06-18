'use client';

import { useTransition } from 'react';
import { Calendar, Users, Save, Loader2 } from 'lucide-react';
import { adminEditUser } from '@/actions/admin/users';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import styles from './users.module.css';

interface Props {
    userId: string;
    currentDob: string | null;
    currentGender: string | null;
}

export default function AdminEditUserForm({ userId, currentDob, currentGender }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const res = await adminEditUser(userId, formData);
            if (res?.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res?.message || "Update failed");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.profileGridDense}>
                <div className={styles.field}>
                    <label><Calendar size={16} className={styles.labelIcon} /> Date of Birth</label>
                    <input
                        name="dateOfBirth"
                        type="date"
                        defaultValue={currentDob || ''}
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label><Users size={16} className={styles.labelIcon} /> Gender</label>
                    <select name="gender" defaultValue={currentGender || ''} className={styles.input}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <button type="submit" disabled={isPending} className={styles.saveEditBtn}>
                    {isPending ? <Loader2 size={15} className={styles.spin} /> : <Save size={15} />}
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
