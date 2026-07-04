import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../../../lib/api-client';
import keycloak from '../../../../lib/keycloak';
import { StaffTopNav } from './StaffTopNav.tsx';
import styles from './StaffDashboard.module.css';
import { Clock, User, CheckCircle } from 'lucide-react';

interface StaffOrderItemResponse {
    menuName: string;
    quantity: number;
    price: number;
    specialRequest: string | null;
    selectedOptions: string[];
}

interface StaffOrderResponse {
    orderId: number;
    status: string;
    customerName: string;
    totalPrice: number;
    createdAt: string;
    assignedStaffName: string | null;
    assignedStaffUuid: string | null;
    deliveryAddress: string;
    items: StaffOrderItemResponse[];
}

export const StaffDashboard = () => {
    const [orders, setOrders] = useState<StaffOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);


    // Function to calculate minutes ago
    const getMinutesElapsed = (dateString: string) => {
        const diffMs = new Date().getTime() - new Date(dateString).getTime();
        return Math.floor(diffMs / 60000);
    };

    const showToast = (msg: string, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), isError ? 6000 : 3000);
    };

    const fetchOrders = useCallback(async () => {
        try {
            const data = await apiClient<StaffOrderResponse[]>('/staff/orders/active');
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleClaimOrder = async (orderId: number) => {
        setActionLoadingId(orderId);
        try {
            await apiClient(`/staff/orders/${orderId}/claim`, { method: 'POST' });
            showToast('Order successfully claimed!');
            await fetchOrders();
        } catch (error: unknown) {
            console.error('Failed to claim order:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to claim order. It might have been claimed by another staff.';
            showToast(msg, true);
            await fetchOrders(); // Refresh to see if it was claimed
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCompleteOrder = async (orderId: number) => {
        setActionLoadingId(orderId);
        try {
            await apiClient(`/staff/orders/${orderId}/complete`, { method: 'POST' });
            showToast('Order completed!');
            await fetchOrders();
        } catch (error: unknown) {
            console.error('Failed to complete order:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to complete order.';
            showToast(msg, true);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        setActionLoadingId(orderId);
        try {
            await apiClient(`/staff/orders/${orderId}/cancel`, { method: 'POST' });
            showToast('Order canceled.');
            await fetchOrders();
        } catch (error: unknown) {
            console.error('Failed to cancel order:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to cancel order.';
            showToast(msg, true);
        } finally {
            setActionLoadingId(null);
        }
    };

    const pendingOrders = orders.filter(o => (o.status || '').toUpperCase().replace(/\s+/g, '_') === 'PENDING');
    const inProgressOrders = orders.filter(o => (o.status || '').toUpperCase().replace(/\s+/g, '_') === 'IN_PROGRESS');

    const renderOrderCard = (order: StaffOrderResponse, isPending: boolean) => {
        const minutes = getMinutesElapsed(order.createdAt);
        const currentUserUuid = keycloak.tokenParsed?.sub || '';
        const isMine = order.assignedStaffUuid === currentUserUuid;

        return (
            <div key={order.orderId} className={styles.orderCard}>
                <div className={`${styles.cardHeader} ${isPending ? styles.headerPending : styles.headerInProgress}`}>
                    <span className={styles.orderId}>#ORD-{String(order.orderId).padStart(5, '0')}</span>
                    <span className={styles.timeElapsed}>
                        <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                        {minutes}m ago
                    </span>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.customerName}>
                        <User size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                        {order.customerName}
                    </div>

                    <div className={styles.itemList}>
                        {order.items.map((item, idx) => (
                            <div key={idx}>
                                <div className={styles.itemRow}>
                                    <span className={styles.itemName}>{item.menuName}</span>
                                    <span className={styles.itemQty}>x{item.quantity}</span>
                                </div>
                                {item.selectedOptions.length > 0 && (
                                    <div className={styles.itemOptions}>
                                        {item.selectedOptions.map((opt, optIdx) => (
                                            <div key={optIdx}>• {opt}</div>
                                        ))}
                                    </div>
                                )}
                                {item.specialRequest && (
                                    <div className={styles.specialRequest}>Note: {item.specialRequest}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total</span>
                        <span className={styles.totalAmount}>฿{order.totalPrice.toFixed(2)}</span>
                    </div>

                    {!isPending && (
                        <div className={styles.assignedStaff}>
                            Assigned to: {order.assignedStaffName}
                        </div>
                    )}

                    {isPending ? (
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                                onClick={() => handleClaimOrder(order.orderId)}
                                disabled={actionLoadingId === order.orderId}
                            >
                                {actionLoadingId === order.orderId ? 'Claiming...' : 'Accept Order'}
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                onClick={() => {
                                    if (confirmCancelId === order.orderId) {
                                        handleCancelOrder(order.orderId);
                                        setConfirmCancelId(null);
                                    } else {
                                        setConfirmCancelId(order.orderId);
                                        setTimeout(() => setConfirmCancelId(null), 3000);
                                    }
                                }}
                                disabled={actionLoadingId === order.orderId}
                            >
                                {actionLoadingId === order.orderId ? 'Canceling...' : (confirmCancelId === order.orderId ? 'Confirm?' : 'Cancel Order')}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.actionBtn} ${styles.completeBtn}`}
                                onClick={() => handleCompleteOrder(order.orderId)}
                                disabled={actionLoadingId === order.orderId || !isMine}
                                title={!isMine ? 'Only the assigned staff can complete this order' : ''}
                            >
                                <CheckCircle size={18} />
                                {actionLoadingId === order.orderId ? 'Processing...' : 'Complete'}
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                onClick={() => {
                                    if (confirmCancelId === order.orderId) {
                                        handleCancelOrder(order.orderId);
                                        setConfirmCancelId(null);
                                    } else {
                                        setConfirmCancelId(order.orderId);
                                        setTimeout(() => setConfirmCancelId(null), 3000);
                                    }
                                }}
                                disabled={actionLoadingId === order.orderId || !isMine}
                                title={!isMine ? 'Only the assigned staff can cancel this order' : ''}
                            >
                                {actionLoadingId === order.orderId ? 'Canceling...' : (confirmCancelId === order.orderId ? 'Confirm?' : 'Cancel')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.page}>
            {/* Header Section (Full Width) */}
            <StaffTopNav />

            <div className={styles.container}>

                <h1 className={styles.pageTitle}>Staff Dashboard</h1>

                {/* Pending Section */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Incoming Orders</h2>
                    <span className={styles.badge}>{pendingOrders.length}</span>
                </div>

                {loading ? (
                    <div style={{ padding: 20 }}>Loading orders...</div>
                ) : pendingOrders.length === 0 ? (
                    <div className={styles.emptyState}>No incoming orders at the moment.</div>
                ) : (
                    <div className={styles.scrollContainer}>
                        {pendingOrders.map(o => renderOrderCard(o, true))}
                    </div>
                )}

                {/* In Progress Section */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>In Preparation</h2>
                    <span className={styles.badge} style={{ background: '#10b981' }}>{inProgressOrders.length}</span>
                </div>

                {loading ? null : inProgressOrders.length === 0 ? (
                    <div className={styles.emptyState}>No orders currently being prepared.</div>
                ) : (
                    <div className={styles.scrollContainer}>
                        {inProgressOrders.map(o => renderOrderCard(o, false))}
                    </div>
                )}

            </div>

            {toast && (
                <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};