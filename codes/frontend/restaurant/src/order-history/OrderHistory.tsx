import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client.ts';
import { CustomerTopNav } from '../features/customer/CustomerTopNav';
import {
    ClockArrowUp, RotateCcw, ChevronLeft, ChevronRight,
    MapPin, Calendar, AlertCircle, UtensilsCrossed
} from 'lucide-react';
import styles from './OrderHistory.module.css';

// --- Interfaces ---
interface OrderDetailItem {
    menuId: number;
    menuName: string;
    quantity: number;
    price: number;
    specialRequest: string | null;
    selectedChoiceIds: number[];
}

interface OrderHistoryEntry {
    orderId: number;
    totalAmount: number;
    createdAt: string;
    status: string;
    deliveryAddress: string;
    items: OrderDetailItem[];
}

interface PageResponse {
    content: OrderHistoryEntry[];
    totalPages: number;
    totalElements: number;
    number: number; // current page (0-indexed)
    size: number;
    first: boolean;
    last: boolean;
}

// Maps status display name → CSS class suffix
function getStatusClass(status: string): string {
    const normalized = status.toLowerCase().replace(/\s+/g, '');
    if (normalized === 'pending') return styles.statusPending;
    if (normalized === 'received') return styles.statusReceived;
    if (normalized === 'processing') return styles.statusProcessing;
    if (normalized === 'ondelivery') return styles.statusOnDelivery;
    if (normalized === 'shipped') return styles.statusShipped;
    return styles.statusDefault;
}

function formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ', ' + 
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getGroupLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    
    const isSameDay = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear();
    if (isSameDay) return 'Today';
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return 'Yesterday';
    
    const isSameMonth = date.getMonth() === now.getMonth() && 
                        date.getFullYear() === now.getFullYear();
    if (isSameMonth) return 'This Month';
    
    // Fallback to Month Year (e.g., "May 2026")
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

export default function OrderHistory() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reorderingId, setReorderingId] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchHistory = useCallback(async (p: number, isInitial: boolean = false) => {
        if (!isInitial) {
            setLoading(true);
            setError(null);
        }
        try {
            const data = await apiClient<PageResponse>(
                `/customer/orders/history?page=${p}&size=10`
            );
            
            setOrders(data?.content || []);
            setTotalPages(data?.totalPages || 0);
            setTotalElements(data?.totalElements || 0);
            setPage(data?.number || 0);
        } catch (err) {
            console.error('Failed to fetch order history:', err);
            setError('Unable to load your order history. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchHistory(0, true);
    }, [fetchHistory]);

    const handleReorder = async (orderId: number) => {
        setReorderingId(orderId);
        try {
            await apiClient(`/customer/orders/reorder/${orderId}`, {
                method: 'POST',
            });
            showToast('Items added to cart! Redirecting…');
            setTimeout(() => {
                navigate('/customer/payment-method');
            }, 800);
        } catch (err) {
            console.error('Reorder failed:', err);
            showToast('Failed to reorder. Some items may no longer be available.');
            setReorderingId(null);
        }
    };

    const goToPage = (p: number) => {
        if (p >= 0 && p < totalPages) {
            fetchHistory(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.page}>
            <CustomerTopNav />

            <div className={styles.container}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Order History</h1>
                    <p className={styles.pageSubtitle}>
                        {totalElements > 0
                            ? `${totalElements} past order${totalElements !== 1 ? 's' : ''}`
                            : 'View and reorder from your past orders'}
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonLine} />
                                <div className={styles.skeletonLine} />
                                <div className={styles.skeletonLine} />
                                <div className={styles.skeletonLine} />
                            </div>
                        ))}
                    </>
                )}

                {/* Empty State */}
                {!loading && !error && orders.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIconWrap}>
                            <ClockArrowUp size={36} color="#2D7FF9" />
                        </div>
                        <h2 className={styles.emptyTitle}>No orders yet</h2>
                        <p className={styles.emptyText}>
                            Once you place your first order, it will appear here. Start exploring our menu!
                        </p>
                        <button
                            className={styles.emptyBtn}
                            onClick={() => navigate('/customer/home')}
                        >
                            <UtensilsCrossed size={16} />
                            Browse Menu
                        </button>
                    </div>
                )}

                {/* Order Cards */}
                {!loading && !error && orders.map((order, index) => {
                    const groupLabel = getGroupLabel(order.createdAt);
                    const previousGroupLabel = index > 0 ? getGroupLabel(orders[index - 1].createdAt) : null;
                    const showGroupLabel = groupLabel !== previousGroupLabel;

                    return (
                        <Fragment key={order.orderId}>
                            {showGroupLabel && (
                                <div className={styles.groupHeader}>
                                    {groupLabel}
                                </div>
                            )}
                            <div className={styles.orderCard}>
                                {/* Header: Order ID + Status */}
                        <div className={styles.cardHeader}>
                            <span className={styles.orderId}>
                                #ORD-{String(order.orderId).padStart(5, '0')}
                            </span>
                            <span className={`${styles.statusBadge} ${getStatusClass(order.status || '')}`}>
                                {order.status}
                            </span>
                        </div>

                        {/* Body: Info Grid */}
                        <div className={styles.cardBody}>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Total Amount</span>
                                    <span className={`${styles.infoValue} ${styles.infoValueLarge}`}>
                                        ฿{(order.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        <Calendar size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                                        Date & Time
                                    </span>
                                    <span className={styles.infoValue}>{formatDisplayDate(order.createdAt)}</span>
                                </div>

                                <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                                    <span className={styles.infoLabel}>
                                        <MapPin size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                                        Delivery Address
                                    </span>
                                    <span className={styles.addressValue}>{order.deliveryAddress}</span>
                                </div>
                            </div>

                            {/* Items preview */}
                            {order.items && order.items.length > 0 && (
                                <div className={styles.itemsPreview}>
                                    <div className={styles.itemsLabel}>Items ordered</div>
                                    <div className={styles.itemsList}>
                                        {order.items.map((item, idx) => (
                                            <span key={idx} className={styles.itemChip}>
                                                {item.menuName}
                                                <span className={styles.itemChipQty}>×{item.quantity}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer: Action Buttons */}
                        <div className={styles.cardFooter}>
                            {order.status.toLowerCase() !== 'shipped' ? (
                                <button
                                    className={styles.trackBtn}
                                    onClick={() => navigate(`/customer/tracking/${order.orderId}`)}
                                >
                                    <MapPin size={15} />
                                    Track Order
                                </button>
                            ) : (
                                <button
                                    className={styles.reorderBtn}
                                    onClick={() => handleReorder(order.orderId)}
                                    disabled={reorderingId !== null}
                                >
                                    <RotateCcw
                                        size={15}
                                        style={{
                                            animation: reorderingId === order.orderId
                                                ? 'spin 0.8s linear infinite'
                                                : 'none'
                                        }}
                                    />
                                    {reorderingId === order.orderId ? 'Reordering…' : 'Reorder'}
                                </button>
                            )}
                        </div>
                    </div>
                    </Fragment>
                )})}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>

                        <span className={styles.pageInfo}>
                            Page {page + 1} of {totalPages}
                        </span>

                        <button
                            className={styles.pageBtn}
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={styles.toast}>
                    <span style={{
                        width: 16, height: 16, background: '#22c55e', borderRadius: '50%',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    {toast}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
            `}</style>
        </div>
    );
}
