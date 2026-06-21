import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client.ts';
import { OwnerTopNav } from './OwnerTopNav';
import { LogoutButton } from '../../authentication/LogoutButton.tsx';
import styles from './OwnerHome.module.css';
import {
    UtensilsCrossed, Users, CalendarOff, Store,
    BarChart3, User, Crown, TrendingUp, AlertCircle, ChevronRight
} from 'lucide-react';

interface OwnerDashboardData {
    revenueToday: number;
    totalOrdersToday: number;
    completedOrdersToday: number;
    activeStaffCount: number;
    pendingLeaveRequests: number;
    totalMenuItems: number;
    availableMenuItems: number;
    isStoreOpen: boolean;
}

export function OwnerHome() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = searchParams.get('page') || 'dashboard';

    const [data, setData] = useState<OwnerDashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient<OwnerDashboardData>('/owner/')
            .then((res) => {
                if (!res) throw new Error('Dashboard endpoint returned an empty response.');
                setData(res);
                console.log(res);
                setError(null);
            })
            .catch((err) => {
                console.error("Error details:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Could not load your dashboard. Please try again.'
                );
            })
            .finally(() => {
                console.log("=== [FRONTEND CHECK] 4. Request cycle finished ===");
                setLoading(false);
            });
    }, []);

    if (currentPage === 'store-status') {
        // return <StoreStatus />;
    }

    if (loading) {
        return <div className={styles.loadingContainer}>Loading dashboard...</div>;
    }

    if (error || !data) {
        return (
            <div className={styles.loadingContainer} style={{ flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: '#dc2626', fontWeight: 600 }}>
                    {error ?? 'Could not load your dashboard. Please sign in again.'}
                </div>
                <LogoutButton />
            </div>
        );
    }

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = [
        { label: 'Revenue Today', value: `฿${data.revenueToday.toLocaleString()}`, color: '#4ade80', sub: 'Live calculation' },
        { label: 'Orders', value: String(data.totalOrdersToday), color: '#93c5fd', sub: `${data.completedOrdersToday} completed` },
        { label: 'Active Staff', value: String(data.activeStaffCount), color: '#fbbf24', sub: `${data.pendingLeaveRequests} pending` },
        { label: 'Menu Items', value: String(data.totalMenuItems), color: '#d8b4fe', sub: `${data.availableMenuItems} available` },
    ];

    const features = [
        {
            title: 'Menu Configuration',
            desc: 'Add, edit, and manage dishes, prices and categories',
            icon: UtensilsCrossed,
            pageId: 'menu-config',
            accent: '#2D7FF9',
            badge: `${data.totalMenuItems} items`,
        },
        {
            title: 'Analytics',
            desc: 'Revenue charts, top sellers and performance metrics',
            icon: BarChart3,
            pageId: 'analytics',
            accent: '#a855f7',
            badge: 'Live data',
        },
        {
            title: "Day-Off Requests",
            desc: 'Review and approve pending staff leave requests',
            icon: CalendarOff,
            pageId: 'dayoff',
            accent: '#f59e0b',
            badge: data.pendingLeaveRequests > 0 ? `${data.pendingLeaveRequests} pending` : 'All clear',
            alert: data.pendingLeaveRequests > 0,
        },
        {
            title: 'Manage Staff',
            desc: 'Add new staff, deactivate accounts and edit roles',
            icon: Users,
            pageId: 'staff',
            accent: '#22c55e',
            badge: `${data.activeStaffCount} active`,
        },
        {
            title: 'Store Status',
            desc: 'Open or close the store and manage operating hours',
            icon: Store,
            pageId: 'store-status',
            accent: '#f97316',
            badge: data.isStoreOpen ? 'Now Open' : 'Closed',
        },
        {
            title: 'My Profile',
            desc: 'Edit account info and change your password',
            icon: User,
            pageId: 'profile',
            accent: '#6b7280',
            badge: 'Owner',
        },
    ];

    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />

            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleRow}>
                        <div>
                            <div className={styles.ownerBadge}>
                                <Crown size={16} />
                                <span>Owner Portal</span>
                            </div>
                            <div className="flex items-center gap-2.5 mt-1">
                                <h1 className={styles.pageTitle}>{greeting}!</h1>
                                <Crown size={28} className="text-amber-400 animate-pulse hidden sm:block" />
                            </div>
                            <p className={styles.dateText}>
                                {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className={`${styles.storeStatus} ${data.isStoreOpen ? styles.statusOpen : styles.statusClosed}`}>
                            <span className={`${styles.statusDot} ${data.isStoreOpen ? styles.statusDotOpen : styles.statusDotClosed}`} />
                            <span>{data.isStoreOpen ? 'Store Open' : 'Store Closed'}</span>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        {stats.map(({ label, value, color, sub }) => (
                            <div key={label} className={styles.statCard}>
                                <p className={styles.statLabel}>{label}</p>
                                <p className={styles.statValue} style={{ color }}>{value}</p>
                                <p className={styles.statSub}><TrendingUp size={10} />{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <div className={styles.featuresSection}>
                <div className={styles.featuresHeader}>
                    <h2 className={styles.featuresTitle}>Management</h2>
                    {data.pendingLeaveRequests > 0 && (
                        <div className={styles.alertBadge}>
                            <AlertCircle size={14} />
                            {data.pendingLeaveRequests} requests need attention
                        </div>
                    )}
                </div>

                <div className={styles.featuresGrid}>
                    {features.map(({ title, desc, icon: Icon, pageId, accent, badge, alert }) => (
                        <button
                            key={pageId}
                            onClick={() => setSearchParams({ page: pageId })}
                            className={`${styles.featureCard} transform hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300`}
                        >
                            <div className={styles.accentStripe} style={{ backgroundColor: accent }} />

                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper} style={{ backgroundColor: accent }}>
                                    <Icon size={22} strokeWidth={2} />
                                </div>

                                <span className={`${styles.cardBadge} ${alert ? styles.badgeAlert : styles.badgeNormal}`}>
                                    {alert && <span className={styles.alertDot} />}
                                    {badge}
                                </span>
                            </div>

                            <h3 className={styles.cardTitle}>{title}</h3>
                            <p className={styles.cardDesc}>{desc}</p>

                            <div className={styles.cardFooter}>
                                Open <ChevronRight size={15} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}