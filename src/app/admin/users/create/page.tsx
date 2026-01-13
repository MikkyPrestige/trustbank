import Link from 'next/link';
import styles from './create-user.module.css';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/admin-auth';
import CreateUserForm from './CreateUserForm';

export default async function CreateUserPage() {
    await requireAdmin();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/users" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Users
                </Link>
                <h1 className={styles.title}>Create New Client</h1>
                <p className={styles.subtitle}>Onboard a new user. Default password will be set.</p>
            </div>

            <CreateUserForm />
        </div>
    );
}