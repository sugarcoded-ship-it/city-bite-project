import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/api-client';
import { OwnerTopNav } from '../../../dashboard/components/OwnerDashboard/OwnerTopNav';
import { ToggleLeft, ToggleRight, Save, Store, Clock } from 'lucide-react';
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
    const [originalData, setOriginalData] = useState<StoreDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isToggling, setIsToggling] = useState<boolean>(false);
    const [isNewStore, setIsNewStore] = useState<boolean>(false);

    const fetchStoreDetail = async () => {
        try {
            const res = await apiClient<StoreDetail>('/owner/store/detail');
            if (!res || typeof res === 'string') {
                const emptyStore = {
                    storeName: '',
                    storeAddress: '',
                    logoUrl: '',
                    phone: '',
                    openTime: '09:00:00',
                    closeTime: '17:00:00',
                    isOpen: false
                };
                setData(emptyStore);
                setOriginalData(emptyStore);
                setIsNewStore(true);
            } else {
                setData(res);
                setOriginalData(JSON.parse(JSON.stringify(res)));
                setIsNewStore(false);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to load store detail:", err);
            setError("Failed to load store detail. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreDetail();
    }, []);

    const handleToggleStatus = async () => {
        if (!data) return;
        setIsToggling(true);
        try {
            const res = await apiClient<StoreDetail>('/owner/store/status', {
                method: 'PUT',
                data: JSON.stringify({ isOpen: !data.isOpen }),
                headers: { 'Content-Type': 'application/json' }
            });
            setData(prev => prev ? { ...prev, isOpen: res.isOpen } : null);
            setOriginalData(prev => prev ? { ...prev, isOpen: res.isOpen } : null);
        } catch (err) {
            console.error("Failed to toggle status:", err);
            alert("Failed to change store status.");
        } finally {
            setIsToggling(false);
        }
    };

    const handleSave = async () => {
        if (!data) return;
        setIsSaving(true);
        try {
            const res = await apiClient<StoreDetail>('/owner/store/detail', {
                method: isNewStore ? 'POST' : 'PUT',
                data: JSON.stringify({
                    storeName: data.storeName,
                    storeAddress: data.storeAddress,
                    logoUrl: data.logoUrl,
                    phone: data.phone,
                    openTime: data.openTime,
                    closeTime: data.closeTime
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            setData(res);
            setOriginalData(JSON.parse(JSON.stringify(res)));
            setIsNewStore(false);
            alert("Store details updated successfully.");
        } catch (err) {
            console.error("Failed to save store details:", err);
            alert("Failed to save store details.");
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = () => {
        if (!data || !originalData) return false;
        return (
            data.storeName !== originalData.storeName ||
            data.storeAddress !== originalData.storeAddress ||
            data.logoUrl !== originalData.logoUrl ||
            data.phone !== originalData.phone ||
            data.openTime !== originalData.openTime ||
            data.closeTime !== originalData.closeTime
        );
    };

    const handleReset = () => {
        if (originalData) {
            setData(JSON.parse(JSON.stringify(originalData)));
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
                        {isNewStore ? (
                            <span className={styles.statusDesc} style={{ color: '#dc2626' }}>
                                Please save store details first to open your store.
                            </span>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2 className={styles.formTitle}>Store Details</h2>
                        <Store size={24} color="#64748b" />
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>Store Name:</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={data.storeName}
                                onChange={e => setData({ ...data, storeName: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroupFull}>
                            <label className={styles.label}>Address:</label>
                            <textarea
                                className={styles.inputAddress}
                                rows={3}
                                style={{ resize: 'vertical' }}
                                value={data.storeAddress}
                                onChange={e => setData({ ...data, storeAddress: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone Number:</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={data.phone}
                                onChange={e => setData({ ...data, phone: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Logo URL:</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={data.logoUrl}
                                onChange={e => setData({ ...data, logoUrl: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroupFull}>
                            <div className={styles.timeGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={16} /> Opening Time:
                                    </label>
                                    <input
                                        type="time"
                                        className={styles.input}
                                        value={data.openTime.substring(0, 5)}
                                        onChange={e => setData({ ...data, openTime: e.target.value + ':00' })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={16} /> Closing Time:
                                    </label>
                                    <input
                                        type="time"
                                        className={styles.input}
                                        value={data.closeTime.substring(0, 5)}
                                        onChange={e => setData({ ...data, closeTime: e.target.value + ':00' })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.btnCancel}
                            onClick={handleReset}
                            disabled={!hasChanges() || isSaving}
                        >
                            Discard Changes
                        </button>
                        <button
                            className={styles.btnSave}
                            onClick={handleSave}
                            disabled={!hasChanges() || isSaving}
                        >
                            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
