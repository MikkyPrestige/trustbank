'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminSetServiceRestriction } from '@/actions/admin/restrictions';
import styles from './users.module.css';
import { Bitcoin, Receipt, Landmark, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ServiceState {
    key: 'CRYPTO' | 'BILLS' | 'LOANS';
    label: string;
    icon: React.ReactNode;
    restricted: boolean;
    reason: string | null;
}

interface ServiceAccessPanelProps {
    userId: string;
    cryptoRestricted: boolean;
    cryptoRestrictedReason: string | null;
    billsRestricted: boolean;
    billsRestrictedReason: string | null;
    loansRestricted: boolean;
    loansRestrictedReason: string | null;
}

export default function ServiceAccessPanel({
    userId,
    cryptoRestricted,
    cryptoRestrictedReason,
    billsRestricted,
    billsRestrictedReason,
    loansRestricted,
    loansRestrictedReason,
}: ServiceAccessPanelProps) {
    const router = useRouter();
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [modalService, setModalService] = useState<ServiceState | null>(null);
    const [reason, setReason] = useState('');
    const [notifyViaTicket, setNotifyViaTicket] = useState(false);

    const services: ServiceState[] = [
        { key: 'CRYPTO', label: 'Crypto Trading', icon: <Bitcoin size={16} />, restricted: cryptoRestricted, reason: cryptoRestrictedReason },
        { key: 'BILLS', label: 'Bill Payments', icon: <Receipt size={16} />, restricted: billsRestricted, reason: billsRestrictedReason },
        { key: 'LOANS', label: 'Loans', icon: <Landmark size={16} />, restricted: loansRestricted, reason: loansRestrictedReason },
    ];

    const submit = async (service: ServiceState['key'], restricted: boolean, reasonText: string, notify: boolean) => {
        setLoadingKey(service);
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("service", service);
        formData.append("restricted", String(restricted));
        if (reasonText) formData.append("reason", reasonText);
        if (notify) formData.append("notifyViaTicket", "on");

        try {
            const res = await adminSetServiceRestriction(formData);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Connection failed");
        } finally {
            setLoadingKey(null);
        }
    };

    const handleToggle = (service: ServiceState) => {
        if (service.restricted) {
            if (!confirm(`Restore ${service.label} access for this user?`)) return;
            submit(service.key, false, '', false);
        } else {
            setModalService(service);
            setReason('');
            setNotifyViaTicket(false);
        }
    };

    const closeModal = () => setModalService(null);

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalService) return;
        submit(modalService.key, true, reason, notifyViaTicket);
        closeModal();
    };

    return (
        <div className={styles.section}>
            <h3 className={styles.secTitle}>Service Access</h3>
            <div className={styles.serviceList}>
                {services.map((service) => (
                    <div key={service.key} className={styles.serviceRow}>
                        <div className={styles.serviceInfo}>
                            <div className={styles.flexCenterGap}>
                                {service.icon}
                                <span>{service.label}</span>
                            </div>
                            {service.restricted && service.reason && (
                                <p className={styles.serviceReason}>{service.reason}</p>
                            )}
                        </div>

                        <div className={styles.flexCenterGap}>
                            <span className={`${styles.badge} ${service.restricted ? styles.badgeRed : styles.badgeGreen}`}>
                                {service.restricted ? 'Restricted' : 'Allowed'}
                            </span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={!service.restricted}
                                    disabled={loadingKey === service.key}
                                    onChange={() => handleToggle(service)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {modalService && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Restrict {modalService.label}</h3>
                            <button onClick={closeModal} className={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className={styles.form}>
                            <textarea
                                className={styles.modalTextarea}
                                placeholder="Reason (optional, shown to the user)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                                autoFocus
                            />

                            <label className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    checked={notifyViaTicket}
                                    onChange={(e) => setNotifyViaTicket(e.target.checked)}
                                />
                                Also notify via support ticket
                            </label>

                            <button disabled={loadingKey === modalService.key} className={styles.saveBtn}>
                                {loadingKey === modalService.key ? <Loader2 className={styles.spin} size={18} /> : 'Restrict Access'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
