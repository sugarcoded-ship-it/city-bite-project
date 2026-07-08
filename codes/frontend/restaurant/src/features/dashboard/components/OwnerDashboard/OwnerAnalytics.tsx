import { useEffect, useState } from 'react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    BadgeDollarSign,
    Building2,
    Receipt,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { OwnerTopNav } from './OwnerTopNav';
import styles from './OwnerAnalytics.module.css';

interface WeeklyFinancePoint {
    label: string;
    inflow: number;
    outflow: number;
}

interface RecentTransaction {
    title: string;
    amount: number;
    note: string;
    type: string;
}

interface OwnerAnalyticsResponse {
    totalInflow: number;
    totalOutflow: number;
    netProfit: number;
    cashReserve: number;
    weeklyFlow: WeeklyFinancePoint[];
    recentTransactions: RecentTransaction[];
}

const restaurant = {
    name: 'City Bite',
    address: '123 Main Street, Bangkok',
    currency: 'THB',
    status: 'Healthy',
};

const formatCurrency = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: restaurant.currency,
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

export function OwnerAnalytics() {
    const [analytics, setAnalytics] = useState<OwnerAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [seedOffset, setSeedOffset] = useState(0);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const data = await apiClient<OwnerAnalyticsResponse>('/owner/analytics');
            setAnalytics(data);
            setError(null);
        } catch (err) {
            console.error('Analytics load failed', err);
            setError(err instanceof Error ? err.message : 'Unable to load analytics right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadAnalytics();
    }, []);

    const buildSeedEntries = () => {
        const today = new Date();
        const seedVariant = Date.now() % 1000;
        const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let cumulativeIncome = 12000 + seedOffset * 3000;
        let cumulativeExpense = 7000 + seedOffset * 1800;

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - index);
            const weekday = weekdayNames[date.getDay()];
            const incomeStep = 2200 + ((seedVariant + index * 73) % 800);
            const expenseStep = 1500 + ((seedVariant + index * 43) % 600);
            const incomeAmount = cumulativeIncome + incomeStep;
            const expenseAmount = cumulativeExpense + expenseStep;
            const balance = incomeAmount - expenseAmount;

            cumulativeIncome = incomeAmount;
            cumulativeExpense = expenseAmount;

            return [
                {
                    eventType: 'INCOME',
                    amount: incomeAmount,
                    description: `${weekday} sales · balance ${balance}`,
                    daysAgo: index,
                    hour: 13 + (index % 3),
                },
                {
                    eventType: 'EXPENSE',
                    amount: expenseAmount,
                    description: `${weekday} supplies · balance ${balance}`,
                    daysAgo: index,
                    hour: 9 + (index % 2),
                },
            ];
        }).flat();
    };

    const handleSeedData = async () => {
        setIsUpdating(true);
        try {
            await apiClient('/owner/analytics/seed', {
                method: 'POST',
                data: buildSeedEntries(),
            });
            setSeedOffset((value) => value + 1);
            await loadAnalytics();
        } catch (err) {
            console.error('Analytics update failed', err);
            setError(err instanceof Error ? err.message : 'Could not update analytics data.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <OwnerTopNav />
                <main className={styles.mainContent}>
                    <section className={styles.heroCard}>
                        <p className={styles.eyebrow}>Owner analytics</p>
                        <h1 className={styles.heroTitle}>Loading financial snapshot...</h1>
                    </section>
                </main>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className={styles.pageContainer}>
                <OwnerTopNav />
                <main className={styles.mainContent}>
                    <section className={styles.heroCard}>
                        <p className={styles.eyebrow}>Owner analytics</p>
                        <h1 className={styles.heroTitle}>Could not load analytics</h1>
                        <p className={styles.heroText}>{error ?? 'Please sign in again and try refreshing the page.'}</p>
                    </section>
                </main>
            </div>
        );
    }

    const { totalInflow, totalOutflow, netProfit, cashReserve, weeklyFlow, recentTransactions } = analytics;
    const incomingItems = recentTransactions.filter((item) => item.type.toLowerCase() === 'income').slice(0, 3);
    const outgoingItems = recentTransactions.filter((item) => item.type.toLowerCase() === 'expense').slice(0, 3);
    const maxChartValue = Math.max(...weeklyFlow.map((item) => Math.max(item.inflow, item.outflow, 1)), 1);

    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />

            <main className={styles.mainContent}>
                <section className={styles.heroCard}>
                    <div>
                        <p className={styles.eyebrow}>Owner analytics</p>
                        <h1 className={styles.heroTitle}>{restaurant.name} financial snapshot</h1>
                        <p className={styles.heroText}>
                            A mock view of the money flowing in and out of the restaurant, tuned for quick owner review.
                        </p>
                    </div>

                    <div className={styles.heroMeta}>
                        <span className={styles.statusChip}>{restaurant.status}</span>
                        <div className={styles.restaurantInfo}>
                            <Building2 size={16} />
                            <span>{restaurant.address}</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleSeedData}
                            disabled={isUpdating}
                            style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '999px', border: 'none', background: '#2563eb', color: 'white', cursor: isUpdating ? 'wait' : 'pointer' }}
                        >
                            {isUpdating ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </section>

                <section className={styles.summaryGrid}>
                    <article className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ backgroundColor: '#dcfce7' }}>
                            <ArrowUpRight size={18} color="#166534" />
                        </div>
                        <div>
                            <p className={styles.summaryLabel}>Total inflow</p>
                            <h2 className={styles.summaryValue}>{formatCurrency(totalInflow)}</h2>
                        </div>
                    </article>

                    <article className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ backgroundColor: '#fee2e2' }}>
                            <ArrowDownLeft size={18} color="#b91c1c" />
                        </div>
                        <div>
                            <p className={styles.summaryLabel}>Total outflow</p>
                            <h2 className={styles.summaryValue}>{formatCurrency(totalOutflow)}</h2>
                        </div>
                    </article>

                    <article className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ backgroundColor: '#dbeafe' }}>
                            <TrendingUp size={18} color="#1d4ed8" />
                        </div>
                        <div>
                            <p className={styles.summaryLabel}>Net profit</p>
                            <h2 className={styles.summaryValue}>{formatCurrency(netProfit)}</h2>
                        </div>
                    </article>

                    <article className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ backgroundColor: '#fef3c7' }}>
                            <Wallet size={18} color="#92400e" />
                        </div>
                        <div>
                            <p className={styles.summaryLabel}>Cash reserve</p>
                            <h2 className={styles.summaryValue}>{formatCurrency(cashReserve)}</h2>
                        </div>
                    </article>
                </section>

                <section className={styles.contentGrid}>
                    <article className={styles.panelCard}>
                        <div className={styles.panelHeader}>
                            <div>
                                <p className={styles.panelEyebrow}>Cash flow</p>
                                <h3 className={styles.panelTitle}>Weekly money movement</h3>
                            </div>
                            <div className={styles.legend}>
                                <span><i className={styles.inflowDot} /> Inflow</span>
                                <span><i className={styles.outflowDot} /> Outflow</span>
                            </div>
                        </div>

                        <div className={styles.chartArea}>
                            {weeklyFlow.map((item) => {
                                const inflowHeight = (item.inflow / maxChartValue) * 100;
                                const outflowHeight = (item.outflow / maxChartValue) * 100;

                                return (
                                    <div key={item.label} className={styles.barColumn}>
                                        <div className={styles.barStack}>
                                            <div
                                                className={styles.barInflow}
                                                style={{ height: `${Math.max(inflowHeight, 6)}%` }}
                                            />
                                            <div
                                                className={styles.barOutflow}
                                                style={{ height: `${Math.max(outflowHeight, 6)}%` }}
                                            />
                                        </div>
                                        <span className={styles.barLabel}>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </article>

                    <article className={styles.panelCard}>
                        <div className={styles.panelHeader}>
                            <div>
                                <p className={styles.panelEyebrow}>Today</p>
                                <h3 className={styles.panelTitle}>Restaurant health</h3>
                            </div>
                        </div>

                        <div className={styles.healthList}>
                            <div className={styles.healthItem}>
                                <div className={styles.healthIcon}>
                                    <BadgeDollarSign size={16} />
                                </div>
                                <div>
                                    <p>Best day so far</p>
                                    <span>Friday brought the strongest inflow of the week.</span>
                                </div>
                            </div>
                            <div className={styles.healthItem}>
                                <div className={styles.healthIcon}>
                                    <Receipt size={16} />
                                </div>
                                <div>
                                    <p>Expense discipline</p>
                                    <span>Outflow remains steady and within the planned range.</span>
                                </div>
                            </div>
                        </div>
                    </article>
                </section>

                <section className={styles.transactionGrid}>
                    <article className={styles.transactionCard}>
                        <div className={styles.transactionHeader}>
                            <h3>Incoming</h3>
                            <span>Mock sales feed</span>
                        </div>
                        <div className={styles.transactionList}>
                            {incomingItems.length > 0 ? incomingItems.map((item) => (
                                <div key={`${item.title}-${item.note}`} className={styles.transactionItem}>
                                    <div>
                                        <p>{item.title}</p>
                                        <span>{item.note}</span>
                                    </div>
                                    <strong>{formatCurrency(item.amount)}</strong>
                                </div>
                            )) : <p className={styles.heroText}>No incoming transactions yet.</p>}
                        </div>
                    </article>

                    <article className={styles.transactionCard}>
                        <div className={styles.transactionHeader}>
                            <h3>Outgoing</h3>
                            <span>Mock costs</span>
                        </div>
                        <div className={styles.transactionList}>
                            {outgoingItems.length > 0 ? outgoingItems.map((item) => (
                                <div key={`${item.title}-${item.note}`} className={styles.transactionItem}>
                                    <div>
                                        <p>{item.title}</p>
                                        <span>{item.note}</span>
                                    </div>
                                    <strong>{formatCurrency(item.amount)}</strong>
                                </div>
                            )) : <p className={styles.heroText}>No outgoing transactions yet.</p>}
                        </div>
                    </article>
                </section>
            </main>
        </div>
    );
}
