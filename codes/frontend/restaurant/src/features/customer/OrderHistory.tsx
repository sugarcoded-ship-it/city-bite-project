import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api-client.ts';
import { CustomerTopNav } from './CustomerTopNav.tsx';
import { Dialog } from '../../ui/Dialog.tsx';
import {
    ClockArrowUp, RotateCcw, ChevronLeft, ChevronRight,
    MapPin, Calendar, AlertCircle, UtensilsCrossed, X,
} from 'lucide-react';

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

// Maps status → badge color classes
function getStatusBadgeClasses(status: string): string {
    const normalized = status.toLowerCase().replace(/\s+/g, '');
    if (normalized === 'pending') return 'bg-orange-100 text-orange-700';
    if (normalized === 'received') return 'bg-blue-100 text-blue-700';
    if (normalized === 'processing') return 'bg-yellow-100 text-yellow-700';
    if (normalized === 'ondelivery') return 'bg-purple-100 text-purple-700';
    if (normalized === 'shipped') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
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
    const [selectedOrder, setSelectedOrder] = useState<OrderHistoryEntry | null>(null);

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
        <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <CustomerTopNav />

            <div className="max-w-3xl mx-auto px-6 pt-24 pb-10">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-[#0B1F4D] text-2xl font-extrabold">Order History</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalElements > 0
                            ? `${totalElements} past order${totalElements !== 1 ? 's' : ''}`
                            : 'View and reorder from your past orders'}
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 mb-4">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-3">
                                <div className="h-4 bg-gray-100 rounded-full w-1/3" />
                                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                                <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                                <div className="h-8 bg-gray-100 rounded-xl w-full" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && orders.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <ClockArrowUp size={32} className="text-[#2D7FF9]" />
                        </div>
                        <h2 className="text-[#0B1F4D] font-extrabold text-lg mb-1">No orders yet</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Once you place your first order, it will appear here. Start exploring our menu!
                        </p>
                        <button
                            className="inline-flex items-center gap-2 bg-[#2D7FF9] hover:bg-[#1a6de0] text-white font-extrabold text-sm px-5 py-3 rounded-2xl transition-colors shadow-md"
                            onClick={() => navigate('/customer/home')}
                        >
                            <UtensilsCrossed size={16} />
                            Browse Menu
                        </button>
                    </div>
                )}

                {/* Order Cards */}
                <div className="space-y-3">
                    {!loading && !error && orders.map((order, index) => {
                        const groupLabel = getGroupLabel(order.createdAt);
                        const previousGroupLabel = index > 0 ? getGroupLabel(orders[index - 1].createdAt) : null;
                        const showGroupLabel = groupLabel !== previousGroupLabel;
                        const isShipped = order.status.toLowerCase() === 'shipped';

                        return (
                            <Fragment key={order.orderId}>
                                {showGroupLabel && (
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest pt-2 first:pt-0">
                                        {groupLabel}
                                    </div>
                                )}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    {/* Header: Order ID + Status */}
                                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50">
                                        <span className="text-[#0B1F4D] font-extrabold text-sm">
                                            #ORD-{String(order.orderId).padStart(5, '0')}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(order.status || '')}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Body: Info */}
                                    <div className="px-5 py-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                                <p className="text-[#0B1F4D] font-extrabold text-lg">฿{(order.totalAmount || 0).toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                                    <Calendar size={11} /> Date &amp; Time
                                                </p>
                                                <p className="text-gray-700 text-sm font-semibold">{formatDisplayDate(order.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-1.5 text-gray-500 text-xs">
                                            <MapPin size={13} className="flex-shrink-0 mt-0.5" />
                                            <span className="truncate">{order.deliveryAddress}</span>
                                        </div>

                                        {/* Items preview */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {order.items.map((item, idx) => (
                                                    <span key={idx} className="bg-[#f8f9fc] text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                        {item.menuName} <span className="text-gray-400">×{item.quantity}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer: Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-50">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-[#2D7FF9] text-xs font-bold hover:underline"
                                        >
                                            View Details
                                        </button>

                                        {!isShipped ? (
                                            <button
                                                className="flex items-center gap-1.5 bg-[#0B1F4D] hover:bg-[#132a63] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                                                onClick={() => navigate(`/customer/tracking/${order.orderId}`)}
                                            >
                                                <MapPin size={14} />
                                                Track Order
                                            </button>
                                        ) : (
                                            <button
                                                className="flex items-center gap-1.5 bg-[#2D7FF9] hover:bg-[#1a6de0] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                                                onClick={() => handleReorder(order.orderId)}
                                                disabled={reorderingId !== null}
                                            >
                                                <RotateCcw
                                                    size={14}
                                                    className={reorderingId === order.orderId ? 'animate-spin' : ''}
                                                />
                                                {reorderingId === order.orderId ? 'Reordering…' : 'Reorder'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Fragment>
                        );
                    })}
                </div>

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-5">
                        <button
                            className="flex items-center gap-1 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-xs font-bold px-3 py-2 rounded-xl hover:bg-white transition-colors"
                            onClick={() => goToPage(page - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>

                        <span className="text-gray-400 text-xs font-semibold">
                            Page {page + 1} of {totalPages}
                        </span>

                        <button
                            className="flex items-center gap-1 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-xs font-bold px-3 py-2 rounded-xl hover:bg-white transition-colors"
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <h2 className="text-[#0B1F4D] text-xl font-extrabold">
                                    #ORD-{String(selectedOrder.orderId).padStart(5, '0')}
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">{formatDisplayDate(selectedOrder.createdAt)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(selectedOrder.status || '')}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Delivery Address</p>
                                <p className="text-gray-700 text-sm">{selectedOrder.deliveryAddress}</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Order Items</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="bg-[#f8f9fc] rounded-2xl p-4 flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-[#0B1F4D] truncate">{item.menuName}</p>
                                                {item.specialRequest && (
                                                    <p className="text-orange-500 text-xs mt-0.5">{item.specialRequest}</p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-sm text-[#0B1F4D]">฿{(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-gray-400 text-xs">฿{item.price} × {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-extrabold text-[#0B1F4D]">Total</span>
                                <span className="font-extrabold text-[#2D7FF9] text-xl">
                                    ฿{(selectedOrder.totalAmount || 0).toFixed(2)}
                                </span>
                            </div>

                            {selectedOrder.status.toLowerCase() === 'shipped' ? (
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        handleReorder(selectedOrder.orderId);
                                    }}
                                    disabled={reorderingId !== null}
                                    className="w-full flex items-center justify-center gap-2 bg-[#2D7FF9] hover:bg-[#1a6de0] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl transition-colors shadow-md text-sm"
                                >
                                    <RotateCcw size={16} />
                                    Reorder
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        navigate(`/customer/tracking/${selectedOrder.orderId}`);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-[#0B1F4D] hover:bg-[#132a63] text-white font-extrabold py-3.5 rounded-2xl transition-colors shadow-md text-sm"
                                >
                                    <MapPin size={16} />
                                    Track Order
                                </button>
                            )}
                        </div>
                    </div>
                </Dialog>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0B1F4D] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg z-50">
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    {toast}
                </div>
            )}
        </div>
    );
}