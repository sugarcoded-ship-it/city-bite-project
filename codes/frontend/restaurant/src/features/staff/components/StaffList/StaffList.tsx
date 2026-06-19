import styles from './StaffList.module.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../lib/api-client';

// Define the data structure
interface Staffs {
    id: string;
    username: string;
    fullName: string;
    isActive: boolean;
}

export const StaffList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Staffs[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient<Staffs[]>(`/owner/staff`)
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Dashboard loading failed:", err);
                setError("Failed to load staff list.");
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!data || data.length === 0) return <div>No data found.</div>;

    // Toggle status handler
    const handleToggleStatus = (id: string) => {
        setData((currentList) => {
                if (!currentList) return null;

                return currentList.map((staff) =>
                    staff.id === id ? {...staff, isActive: !staff.isActive} : staff
                );
            }
        );
    };

    // Detail view handler
    const handleViewDetail = (id: string) => {
        navigate(`/staff-detail/${id}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Staff Management</h1>
                <p className={styles.subtitle}>Manage employee access and view details.</p>
            </div>

            <div className={styles.listWrapper}>
                <div className={styles.listHeader}>
                    <div className={styles.colUser}>User</div>
                    <div className={styles.colStatus}>Status</div>
                    <div className={styles.colActions}>Actions</div>
                </div>

                <ul className={styles.list}>
                    {data.map((staff) => (
                        <li key={staff.id} className={styles.listItem}>

                            {/* User Info Column */}
                            <div className={styles.colUser}>
                                <div className={styles.avatarPlaceholder}>
                                    {staff.fullName.charAt(0)}
                                </div>
                                <div className={styles.userInfo}>
                                    <span className={styles.fullName}>{staff.fullName}</span>
                                    <span className={styles.username}>@{staff.username}</span>
                                </div>
                            </div>

                            {/* Status Column */}
                            <div className={styles.colStatus}>
                <span className={`${styles.badge} ${staff.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {staff.isActive ? 'Active' : 'Deactivated'}
                </span>
                            </div>

                            {/* Actions Column */}
                            <div className={styles.colActions}>
                                <button
                                    onClick={() => handleViewDetail(staff.id)}
                                    className={styles.btnDetail}
                                >
                                    Detail
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(staff.id)}
                                    className={`${styles.btnToggle} ${staff.isActive ? styles.btnDeactivate : styles.btnActivate}`}
                                >
                                    {staff.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>

                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}