import styles from './StaffDetail.module.css';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../lib/api-client';
import keycloak from '../../../../lib/keycloak';
import { OwnerTopNav } from '../../../dashboard/components/OwnerDashboard/OwnerTopNav';
import {
    ArrowLeft, Mail, Phone, MapPin, DollarSign,
    CalendarDays, Fingerprint, User, ClipboardList
} from 'lucide-react';

interface OwnerStaffDetail {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    leaveDayAmount: number;
    salary: number;
    address: string | null;
}

export const StaffDetail = () => {
    const navigate = useNavigate();
    const { id: paramId } = useParams<{id: string}>();
    const resolvedId = paramId || keycloak.tokenParsed?.sub;
    const [data, setData] = useState<OwnerStaffDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!resolvedId) return;

        apiClient<OwnerStaffDetail>(`/owner/staff/${resolvedId}`)
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Staff detail loading failed:", err);
                setError("Failed to load staff detail.");
                setLoading(false);
            });
    }, [resolvedId]);

    if (!resolvedId) {
        return <div className={styles.loadingContainer}>Error: No Staff ID provided.</div>;
    }

    if (loading) {
        return <div className={styles.loadingContainer}>Loading staff details…</div>;
    }

    if (error) {
        return (
            <div className={styles.loadingContainer} style={{ color: '#dc2626' }}>
                {error}
            </div>
        );
    }

    if (!data) {
        return <div className={styles.loadingContainer}>No data found.</div>;
    }

    const initials = data.fullName
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />

            {/* Navy Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button onClick={() => navigate('/staff')} className={styles.backBtn}>
                        <ArrowLeft size={14} />
                        Back to Staff
                    </button>

                    <div className={styles.profileHeader}>
                        <div className={styles.avatarLarge}>
                            {initials}
                        </div>
                        <div className={styles.profileInfo}>
                            <span className={styles.headerLabel}>Staff Member</span>
                            <h1 className={styles.profileName}>{data.fullName}</h1>
                            <p className={styles.profileEmail}>{data.email}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className={styles.mainContent}>

                {/* Quick Info Cards */}
                <div className={styles.cardsGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.cardIcon} style={{ backgroundColor: '#22c55e' }}>
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className={styles.cardLabel}>Salary</p>
                            <p className={styles.cardValue}>฿{data.salary.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.cardIcon} style={{ backgroundColor: '#f59e0b' }}>
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <p className={styles.cardLabel}>Leave Days</p>
                            <p className={styles.cardValue}>{data.leaveDayAmount} days</p>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.cardIcon} style={{ backgroundColor: '#8b5cf6' }}>
                            <Fingerprint size={20} />
                        </div>
                        <div>
                            <p className={styles.cardLabel}>Employee ID</p>
                            <p className={styles.cardValueSmall}>{data.id.slice(0, 8)}…</p>
                        </div>
                    </div>
                </div>

                {/* Detail Panel */}
                <div className={styles.detailPanel}>
                    <div className={styles.panelHeader}>
                        <ClipboardList size={16} />
                        Full Details
                    </div>
                    <div className={styles.panelBody}>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Full Name</span>
                            <span className={styles.fieldValue}>
                                <User size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#94a3b8' }} />
                                {data.fullName}
                            </span>
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Email</span>
                            <a href={`mailto:${data.email}`} className={styles.fieldValueLink}>
                                <Mail size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                {data.email}
                            </a>
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Phone</span>
                            {data.phone ? (
                                <a href={`tel:${data.phone}`} className={styles.fieldValueLink}>
                                    <Phone size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                    {data.phone}
                                </a>
                            ) : (
                                <span className={styles.fieldValueMuted}>Not provided</span>
                            )}
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Address</span>
                            {data.address ? (
                                <span className={styles.fieldValue}>
                                    <MapPin size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#94a3b8' }} />
                                    {data.address}
                                </span>
                            ) : (
                                <span className={styles.fieldValueMuted}>Not provided</span>
                            )}
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Salary</span>
                            <span className={styles.fieldValue}>
                                <DollarSign size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#94a3b8' }} />
                                ฿{data.salary.toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Leave Day Allowance</span>
                            <span className={styles.fieldValue}>
                                <CalendarDays size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#94a3b8' }} />
                                {data.leaveDayAmount} days
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}