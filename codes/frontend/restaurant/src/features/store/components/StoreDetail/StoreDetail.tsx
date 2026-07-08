import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/api-client';
import { OwnerTopNav } from '../../../dashboard/components/OwnerDashboard/OwnerTopNav';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import styles from './StoreDetail.module.css';

interface StoreDetail {
    storeName: string;
    storeAddress: string;
    logoUrl: string;
    phone: string;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
}

export const StoreDetail = () => {
    const [data, setData] = useState<StoreDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiClient<StoreDetail>('/owner/store/detail');
                if (!res || typeof res === 'string') {
                    setData({
                        storeName: 'My Restaurant',
                        storeAddress: '',
                        logoUrl: '',
                        phone: '',
                        openTime: '09:00:00',
                        closeTime: '17:00:00',
                        isOpen: false
                    });
                } else {
                    setData(res);
                }
                setError(null);
            } catch (err) {
                console.error("Failed to load store detail:", err);
                setError("Failed to load store detail. Please try again later.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleToggleStatus = async () => {
        if (!data) return;
        setIsToggling(true);
        try {
            const res = await apiClient<StoreDetail>('/owner/store/status', {
                method: 'PUT',
                data: { isOpen: !data.isOpen }
            });
            setData(prev => prev ? { ...prev, isOpen: res.isOpen } : null);
        } catch (err) {
            console.error("Failed to toggle status:", err);
            alert("Failed to change store status.");
        } finally {
            setIsToggling(false);
        }
    };

    if (loading) {
        return <div className={styles.loadingContainer}>Loading store details...</div>;
    }

    if (error || !data) {
        return (
            <div className={styles.pageContainer}>
                <OwnerTopNav />
                <div className={styles.contentWrapper}>
                    <div style={{ color: '#dc2626', fontWeight: 600 }}>
                        {error ?? 'Could not load store details.'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <div className={styles.titleRow}>
                        <div>
                            <h1 className={styles.pageTitle}>Store Status</h1>
                            <p className={styles.pageSubtitle}>Manage your operating hours and store information</p>
                        </div>
                    </div>
                </header>

                <div className={`${styles.statusCard} ${data.isOpen ? styles.statusCardOpen : styles.statusCardClosed}`}>
                    <div className={styles.statusInfo}>
                        <h2 className={styles.statusTitle}>Current Status</h2>
                        <p className={styles.statusDesc}>
                            {data.isOpen ? 'Your store is currently open and accepting orders.' : 'Your store is currently closed.'}
                        </p>
                    </div>
                    <div className={styles.toggleContainer}>
                        <span className={`${styles.statusBadge} ${data.isOpen ? styles.badgeOpen : styles.badgeClosed}`}>
                            {data.isOpen ? 'Open' : 'Closed'}
                        </span>
                        <button
                            className={`${styles.toggleButton} ${data.isOpen ? styles.toggleOpen : ''}`}
                            onClick={handleToggleStatus}
                            disabled={isToggling}
                            title={data.isOpen ? 'Close Store' : 'Open Store'}
                        >
                            {data.isOpen ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
