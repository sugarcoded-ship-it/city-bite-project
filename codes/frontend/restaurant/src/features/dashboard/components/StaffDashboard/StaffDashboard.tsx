import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../../../../lib/api-client';
import keycloak from '../../../../lib/keycloak';
import { StaffTopNav } from './StaffTopNav.tsx';
import styles from './StaffDashboard.module.css';
import { Clock, User, CheckCircle } from 'lucide-react';

interface StaffOrderItemResponse {
    detailId: number;
    menuName: string;
    quantity: number;
    price: number;
    specialRequest: string | null;
    selectedOptions: string[];
    isCanceled: boolean;
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
    const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);
    const [cancelModalOrder, setCancelModalOrder] = useState<StaffOrderResponse | null>(null);
    const [completeModalOrder, setCompleteModalOrder] = useState<StaffOrderResponse | null>(null);
    const [selectedCancelIds, setSelectedCancelIds] = useState<Set<number>>(new Set());

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
            const result = await apiClient<{ message: string; removedItems: string[] }>(`/staff/orders/${orderId}/claim`, { method: 'POST' });
            showToast(result?.message || 'Order moved to In Preparation!', (result?.removedItems?.length ?? 0) > 0);
            await fetchOrders();
        } catch (error: unknown) {
            console.error('Failed to accept order:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to accept order.';
            showToast(msg, true);
            await fetchOrders(); // Refresh
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeliverOrder = async (orderId: number) => {
        setActionLoadingId(orderId);
        try {
            const result = await apiClient<{ message: string }>(`/staff/orders/${orderId}/deliver`, { method: 'POST' });
            showToast(result?.message || 'Order is now out for delivery!');
            await fetchOrders();
        } catch (error: unknown) {
            console.error('Failed to deliver order:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to start delivery. It might have been taken by another staff.';
            showToast(msg, true);
            await fetchOrders(); // Refresh to see if it was claimed
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleCompleteOrder = async () => {
        if (!completeModalOrder) return;
        const orderId = completeModalOrder.orderId;
        setActionLoadingId(orderId);
        try {
            await apiClient(`/staff/orders/${orderId}/complete`, { method: 'POST' });
            showToast('Order completed!');
            setCompleteModalOrder(null);
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

    const openCancelModal = (order: StaffOrderResponse) => {
        const activeIds = order.items.filter(i => !i.isCanceled).map(i => i.detailId);
        setSelectedCancelIds(new Set(activeIds));
        setCancelModalOrder(order);
    };

    const toggleCancelSelection = (detailId: number) => {
        setSelectedCancelIds(prev => {
            const next = new Set(prev);
            if (next.has(detailId)) next.delete(detailId); else next.add(detailId);
            return next;
        });
    };

    const confirmCancelSelection = async () => {
        if (!cancelModalOrder) return;
        const order = cancelModalOrder;
        const activeIds = order.items.filter(i => !i.isCanceled).map(i => i.detailId);
        const selected = activeIds.filter(id => selectedCancelIds.has(id));

        if (selected.length === 0) {
            showToast('Select at least one item to cancel.', true);
            return;
        }

        setActionLoadingId(order.orderId);
        try {
            if (selected.length === activeIds.length) {
                await apiClient(`/staff/orders/${order.orderId}/cancel`, { method: 'POST' });
                showToast('Order canceled.');
            } else {
                for (const detailId of selected) {
                    await apiClient(`/staff/orders/${order.orderId}/items/${detailId}/cancel`, { method: 'POST' });
                }
                showToast(`${selected.length} item(s) canceled and refunded.`);
            }
            setCancelModalOrder(null);
            await fetchOrders();
        } catch (error: unknown) {
            console.error('Failed to cancel:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to cancel.';
            showToast(msg, true);
        } finally {
            setActionLoadingId(null);
        }
    };

    const pendingOrders = orders.filter(o => (o.status || '').toUpperCase().replace(/\s+/g, '_') === 'PENDING');
    const inPrepOrders = orders.filter(o => (o.status || '').toUpperCase().replace(/\s+/g, '_') === 'IN_PREPARATION');
    const inDeliveryOrders = orders.filter(o => (o.status || '').toUpperCase().replace(/\s+/g, '_') === 'ON_DELIVERY');

    const renderOrderCard = (order: StaffOrderResponse, section: 'PENDING' | 'IN_PREPARATION' | 'ON_DELIVERY') => {
        const isPending = section === 'PENDING';
        const inPrep = section === 'IN_PREPARATION';
        const inDelivery = section === 'ON_DELIVERY';
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
                            <div key={idx} style={item.isCanceled ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}>
                                <div className={styles.itemRow}>
                                    <span className={styles.itemName}>{item.menuName}</span>
                                    <span className={styles.itemQty}>x{item.quantity}</span>
                                    {item.isCanceled && (
                                        <span className={styles.badge} style={{ background: '#ef4444', marginLeft: 8 }}>Canceled</span>
                                    )}
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

                    {inDelivery && (
                        <div className={styles.assignedStaff}>
                            Assigned to: {order.assignedStaffName}
                        </div>
                    )}

                    {isPending && (
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                                onClick={() => handleClaimOrder(order.orderId)}
                                disabled={actionLoadingId === order.orderId}
                            >
                                {actionLoadingId === order.orderId ? 'Accepting...' : 'Accept Order'}
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                onClick={() => openCancelModal(order)}
                                disabled={actionLoadingId === order.orderId}
                            >
                                Cancel Order
                            </button>
                        </div>
                    )}

                    {inPrep && (
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.actionBtn} ${styles.acceptBtn}`}
                                onClick={() => handleDeliverOrder(order.orderId)}
                                disabled={actionLoadingId === order.orderId}
                            >
                                {actionLoadingId === order.orderId ? 'Processing...' : 'Deliver'}
                            </button>
                            <button
                                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                onClick={() => openCancelModal(order)}
                                disabled={actionLoadingId === order.orderId}
                            >
                                Cancel Order
                            </button>
                        </div>
                    )}

                    {inDelivery && (
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.actionBtn} ${styles.completeBtn}`}
                                onClick={() => setCompleteModalOrder(order)}
                                disabled={actionLoadingId === order.orderId || !isMine}
                                title={!isMine ? 'Only the assigned staff can complete this order' : ''}
                            >
                                <CheckCircle size={18} />
                                {actionLoadingId === order.orderId ? 'Processing...' : 'Complete'}
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
                        {pendingOrders.map(o => renderOrderCard(o, 'PENDING'))}
                    </div>
                )}

                {/* In Preparation Section */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>In Preparation</h2>
                    <span className={styles.badge} style={{ background: '#f59e0b' }}>{inPrepOrders.length}</span>
                </div>

                {loading ? null : inPrepOrders.length === 0 ? (
                    <div className={styles.emptyState}>No orders currently being prepared.</div>
                ) : (
                    <div className={styles.scrollContainer}>
                        {inPrepOrders.map(o => renderOrderCard(o, 'IN_PREPARATION'))}
                    </div>
                )}

                {/* In Delivery Section */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>In Delivery</h2>
                    <span className={styles.badge} style={{ background: '#10b981' }}>{inDeliveryOrders.length}</span>
                </div>

                {loading ? null : inDeliveryOrders.length === 0 ? (
                    <div className={styles.emptyState}>No orders currently in delivery.</div>
                ) : (
                    <div className={styles.scrollContainer}>
                        {inDeliveryOrders.map(o => renderOrderCard(o, 'ON_DELIVERY'))}
                    </div>
                )}
            </div>

            {toast && (
                <div className={`${styles.toast} ${toast.isError ? styles.toastError : ''}`}>
                    {toast.msg}
                </div>
            )}

            {cancelModalOrder && (() => {
                const activeItems = cancelModalOrder.items.filter(i => !i.isCanceled);
                const selectedCount = activeItems.filter(i => selectedCancelIds.has(i.detailId)).length;
                const isWholeOrder = selectedCount === activeItems.length;
                const isLoading = actionLoadingId === cancelModalOrder.orderId;

                return (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={() => !isLoading && setCancelModalOrder(null)}
                    >
                        <div
                            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-lg font-extrabold text-gray-900">
                                    Cancel Order #ORD-{String(cancelModalOrder.orderId).padStart(5, '0')}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select which items to cancel and refund. Leave everything selected to cancel the whole order.
                                </p>
                            </div>

                            <div className="overflow-y-auto flex-1 p-5 space-y-2">
                                {activeItems.map((item) => (
                                    <label
                                        key={item.detailId}
                                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-red-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedCancelIds.has(item.detailId)}
                                                onChange={() => toggleCancelSelection(item.detailId)}
                                                className="w-4 h-4 accent-red-500"
                                            />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-800">{item.menuName} x{item.quantity}</div>
                                                {item.specialRequest && (
                                                    <div className="text-xs text-gray-400">Note: {item.specialRequest}</div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">฿{item.price.toFixed(2)}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="p-5 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setCancelModalOrder(null)}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={confirmCancelSelection}
                                    disabled={isLoading || selectedCount === 0}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Canceling...'
                                        : isWholeOrder
                                            ? 'Cancel Whole Order'
                                            : `Cancel ${selectedCount} Item(s)`}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {completeModalOrder && (() => {
                const isLoading = actionLoadingId === completeModalOrder.orderId;

                return (
                    <div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                        onClick={() => !isLoading && setCompleteModalOrder(null)}
                    >
                        <div
                            className="bg-white rounded-2xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="text-lg font-extrabold text-gray-900">
                                    Confirm Delivery
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Are you sure you have delivered Order #ORD-{String(completeModalOrder.orderId).padStart(5, '0')} to {completeModalOrder.customerName}?
                                </p>
                            </div>

                            <div className="p-5 flex gap-3">
                                <button
                                    onClick={() => setCompleteModalOrder(null)}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCompleteOrder}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                                >
                                    {isLoading ? 'Completing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};