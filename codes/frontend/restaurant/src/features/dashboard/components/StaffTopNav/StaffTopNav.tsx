import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LogoutButton } from '../../../auth/components/LogoutButton';
import { hasRole } from '../../../../lib/roles';
import styles from './StaffTopNav.module.css';

interface StaffTopNavProps {
    title: string;
}

export const StaffTopNav = ({ title }: StaffTopNavProps) => {
    const location = useLocation();
    const isOwner = hasRole('OWNER');

    const navItems = [
        { to: '/staff/dashboard', label: 'Dashboard' },
        { to: '/staff/leave-day', label: 'Leave Day' },
        { to: '/staff/stock', label: 'Stock Management' },
    ];

    return (
        <div className={styles.topBar}>
            <div className={styles.titleGroup}>
                {isOwner && (
                    <Link to="/owner/dashboard" className={styles.backBtn} aria-label="Back to Owner Dashboard">
                        <ArrowLeft size={18} />
                        <span>Owner Home</span>
                    </Link>
                )}
                <h1 className={styles.pageTitle}>{title}</h1>
            </div>
            <nav className={styles.actionNav} aria-label="Staff navigation">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    );
                })}
                <div className={styles.divider} aria-hidden="true" />
                <LogoutButton />
            </nav>
        </div>
    );
};