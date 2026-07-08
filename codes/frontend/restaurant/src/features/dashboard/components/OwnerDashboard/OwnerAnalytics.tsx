import {
    ArrowDownLeft,
    ArrowUpRight,
    BadgeDollarSign,
    Building2,
    Receipt,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { OwnerTopNav } from './OwnerTopNav';
import styles from './OwnerAnalytics.module.css';

const restaurant = {
    name: 'City Bite',
    address: '123 Main Street, Bangkok',
    currency: 'THB',
    status: 'Healthy',
};

const weeklyFlow = [
    { label: 'Mon', inflow: 32000, outflow: 14500 },
    { label: 'Tue', inflow: 28500, outflow: 13800 },
    { label: 'Wed', inflow: 41000, outflow: 15600 },
    { label: 'Thu', inflow: 37500, outflow: 14900 },
    { label: 'Fri', inflow: 52000, outflow: 17200 },
    { label: 'Sat', inflow: 61000, outflow: 18800 },
    { label: 'Sun', inflow: 46500, outflow: 16100 },
];

const incomingItems = [
    { title: 'Lunch service', amount: 12500, note: 'Today • 13:20', type: 'income' },
    { title: 'Delivery orders', amount: 8400, note: 'Today • 11:45', type: 'income' },
    { title: 'Evening dine-in', amount: 16800, note: 'Yesterday • 19:30', type: 'income' },
];

const outgoingItems = [
    { title: 'Ingredient restock', amount: 6200, note: 'Today • 09:10', type: 'expense' },
    { title: 'Staff wages', amount: 15400, note: 'Today • 08:00', type: 'expense' },
    { title: 'Utilities', amount: 3100, note: 'Yesterday • 22:00', type: 'expense' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: restaurant.currency,
        maximumFractionDigits: 0,
    }).format(value);

export function OwnerAnalytics() {
    const totalInflow = weeklyFlow.reduce((sum, item) => sum + item.inflow, 0);
    const totalOutflow = weeklyFlow.reduce((sum, item) => sum + item.outflow, 0);
    const netProfit = totalInflow - totalOutflow;
    const reserve = Math.round(netProfit * 0.22);

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
                            <h2 className={styles.summaryValue}>{formatCurrency(reserve)}</h2>
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
                                const maxValue = 65000;
                                const inflowHeight = (item.inflow / maxValue) * 100;
                                const outflowHeight = (item.outflow / maxValue) * 100;

                                return (
                                    <div key={item.label} className={styles.barColumn}>
                                        <div className={styles.barStack}>
                                            <div
                                                className={styles.barInflow}
                                                style={{ height: `${inflowHeight}%` }}
                                            />
                                            <div
                                                className={styles.barOutflow}
                                                style={{ height: `${outflowHeight}%` }}
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
                            {incomingItems.map((item) => (
                                <div key={item.title} className={styles.transactionItem}>
                                    <div>
                                        <p>{item.title}</p>
                                        <span>{item.note}</span>
                                    </div>
                                    <strong>{formatCurrency(item.amount)}</strong>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className={styles.transactionCard}>
                        <div className={styles.transactionHeader}>
                            <h3>Outgoing</h3>
                            <span>Mock costs</span>
                        </div>
                        <div className={styles.transactionList}>
                            {outgoingItems.map((item) => (
                                <div key={item.title} className={styles.transactionItem}>
                                    <div>
                                        <p>{item.title}</p>
                                        <span>{item.note}</span>
                                    </div>
                                    <strong>{formatCurrency(item.amount)}</strong>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </main>
        </div>
    );
}
