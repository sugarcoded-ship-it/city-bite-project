import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard, QrCode, Store, MapPin, Edit2, Trash2,
    Plus, X, Check, ChevronRight, ShoppingBag, ArrowLeft,
    Wallet, AlertTriangle, type LucideProps,
} from 'lucide-react';
import { apiClient } from "../../lib/api-client.ts";
import keycloak from "../../lib/keycloak.ts";
import { CustomerTopNav } from "./CustomerTopNav.tsx"

// ── Types (From API) ─────────────────────────────────────────────────────────

interface CartItemResponse {
    menuId: number;
    name: string;
    price: number;
    quantity: number;
    specialRequest: string | null;
    selectedCustomizations: string[];
    status: string;
}

interface RefundCreditResponse {
    currentBalance: number;
}

interface OptionSummaryResponse {
    choiceName: string;
    extraPrice: number;
}

interface CartItemSummary {
    menuId: number;
    menuName: string;
    amount: number;
    specialRequest?: string;
    unitPrice: number;
    lineTotal: number;
    selectedOptions: OptionSummaryResponse[];
    selectedChoiceIds: number[];
}

interface CartSummaryResponse {
    items: CartItemSummary[];
    totalPrice: number;
}

interface AddressDto {
    id: number;
    addressInfo: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
}

interface PaymentMethodResponse {
    id: number;
    methodCode: string;
}

const DELIVERY_FEE = 50;

// ── Payment methods static UI config mapping ─────────────────────────────────

const PAYMENT_UI_CONFIG: Record<
    string,
    {
        label: string;
        sub: string;
        icon: React.ComponentType<LucideProps>;
        accent: string;
        light: string;
    }
> = {
    'ONLINE_BANKING': { label: 'Online Banking', sub: 'Pay via your bank app', icon: CreditCard, accent: 'text-[#2D7FF9]', light: 'bg-blue-50' },
    'QR_PROMPTPAY': { label: 'QR PromptPay', sub: 'Scan with any banking app', icon: QrCode, accent: 'text-purple-600', light: 'bg-purple-50' },
    'TRUEMONEY': { label: 'TrueMoney Wallet', sub: 'Pay with e-wallet balance', icon: Wallet, accent: 'text-orange-500', light: 'bg-orange-50' },
    'CASH_ON_DELIVERY': { label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: Store, accent: 'text-green-600', light: 'bg-green-50' },
};

const FALLBACK_PAYMENT_UI = { label: 'Payment Method', sub: 'Pay securely', icon: CreditCard, accent: 'text-gray-600', light: 'bg-gray-100' };

// ── Component ─────────────────────────────────────────────────────────────────

const OrderSummary: React.FC = () => {
    const navigate = useNavigate();

    // API State
    const [cartSummary, setCartSummary] = useState<CartSummaryResponse | null>(null);
    const [, setRefundCredit] = useState<number>(0);
    const [userAddresses, setUserAddresses] = useState<AddressDto[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Selection State
    const [selectedAddress, setSelectedAddress] = useState<AddressDto | null>(null);
    const [paymentMethodId, setPaymentMethodId] = useState<number | ''>('');

    // Modals & Forms
    const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [deleteAddrId, setDeleteAddrId] = useState<number | null>(null);
    const [addressForm, setAddressForm] = useState({
        addressInfo: '', subDistrict: '', district: '', province: '', postalCode: ''
    });

    const buildSummary = (cart: CartItemResponse[]): CartSummaryResponse => ({
        items: cart.map(ci => ({
            menuId: ci.menuId,
            menuName: ci.name,
            amount: ci.quantity,
            specialRequest: ci.specialRequest ?? undefined,
            unitPrice: ci.price,
            lineTotal: ci.price * ci.quantity,
            selectedOptions: ci.selectedCustomizations.map(name => ({ choiceName: name, extraPrice: 0 })),
            selectedChoiceIds: [],
        })),
        totalPrice: cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0),
    });

    // ── Fetch Data ────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchBackendData = async () => {
            try {
                setIsLoading(true);

                const [cartData, creditData, addressData, paymentMethodData] = await Promise.all([
                    apiClient<CartItemResponse[]>('/customer/cart'),
                    apiClient<RefundCreditResponse>('/customer/credits/balance'),
                    apiClient<AddressDto[]>('/customer/addresses'),
                    apiClient<PaymentMethodResponse[]>('/customer/payments')
                ]);

                setCartSummary(buildSummary(cartData));
                setRefundCredit(creditData.currentBalance);
                setUserAddresses(addressData);
                if (addressData.length > 0) setSelectedAddress(addressData[0]);

                setPaymentMethods(paymentMethodData);
                if (paymentMethodData.length > 0) setPaymentMethodId(paymentMethodData[0].id);

            } catch (error) {
                console.error("Failed to load order data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBackendData();
    }, []);

    // ── Address Handlers ──────────────────────────────────────────────────────
    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({ addressInfo: '', subDistrict: '', district: '', province: '', postalCode: '' });
        setIsAddressModalOpen(true);
    };

    const handleOpenEditAddress = (addr: AddressDto) => {
        setEditingAddressId(addr.id);
        setAddressForm({
            addressInfo: addr.addressInfo, subDistrict: addr.subDistrict,
            district: addr.district, province: addr.province, postalCode: addr.postalCode
        });
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async () => {
        try {
            if (editingAddressId) {
                const updated = await apiClient<AddressDto>(`/customer/addresses/${editingAddressId}`, {
                    method: 'PUT', data: addressForm
                });
                setUserAddresses(prev => prev.map(a => (a.id === editingAddressId ? updated : a)));
                if (selectedAddress?.id === editingAddressId) setSelectedAddress(updated);
            } else {
                const created = await apiClient<AddressDto>('/customer/addresses', {
                    method: 'POST', data: addressForm
                });
                setUserAddresses(prev => [...prev, created]);
                setSelectedAddress(created);
            }
            setIsAddressModalOpen(false);
        } catch (err) {
            const e = err as { response?: { data?: { message?: string } } };
            console.error("Failed to save address:", e.response?.data ?? err);
            alert(e.response?.data?.message ?? "Could not save the address. Please try again.");
        }
    };

    const confirmDeleteAddr = async () => {
        if (!deleteAddrId) return;
        try {
            await apiClient(`/customer/addresses/${deleteAddrId}`, { method: 'DELETE' });
            const updatedList = userAddresses.filter(a => a.id !== deleteAddrId);
            setUserAddresses(updatedList);
            if (selectedAddress?.id === deleteAddrId) {
                setSelectedAddress(updatedList.length > 0 ? updatedList[0] : null);
            }
            setDeleteAddrId(null);
        } catch (err) {
            const e = err as { response?: { data?: { message?: string } } };
            alert(e.response?.data?.message ?? "Could not delete the address. Please try again.");
        }
    };

    // ── Place Order ───────────────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (!cartSummary || cartSummary.items.length === 0 || !selectedAddress || !paymentMethodId) return;

        const finalTotal = cartSummary.totalPrice + DELIVERY_FEE;
        const orderPayload = {
            customerUuid: keycloak.subject,
            addressId: selectedAddress.id,
            orderStatusId: 1,
            paymentMethodId: Number(paymentMethodId),
            totalPrice: finalTotal,
            items: cartSummary.items.map(item => ({
                menuId: item.menuId,
                amount: item.amount,
                specialRequest: item.specialRequest ?? '',
                selectedChoiceIds: item.selectedChoiceIds
            }))
        };

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            // 1. Create the order in the backend
            await apiClient('/customer/orders/create', { method: 'POST', data: orderPayload });

            // 2. Check the payment method and navigate accordingly
            if (selectedMethodCode === 'QR_PROMPTPAY') {
                navigate('/payment-process');
            } else {
                navigate('/history');
            }

        } catch (err) {
            const e = err as { response?: { data?: { message?: string } } };
            setSubmitError(e.response?.data?.message ?? "Failed to place order. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f0f2f7]">Loading order details...</div>;
    }

    const subtotal = cartSummary?.totalPrice || 0;
    const total = subtotal + DELIVERY_FEE;
    const cartCount = cartSummary?.items.reduce((sum, item) => sum + item.amount, 0) || 0;
    const selectedMethodObj = paymentMethods.find(p => p.id === paymentMethodId);
    const selectedMethodCode = selectedMethodObj?.methodCode.toUpperCase() || '';

    const canProceed = !!cartSummary && cartSummary.items.length > 0 && !!selectedAddress && !!paymentMethodId && !isSubmitting;

    return (
        <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <CustomerTopNav cartCount={cartCount} />

            {/* Page header */}
            <div className="bg-[#0B1F4D] pt-28 pb-5 px-6">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => navigate('/customer/cart')}
                        className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest leading-none">Checkout</p>
                        <h1 className="text-white text-xl font-extrabold leading-tight">Order Summary</h1>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-[#0B1F4D] pb-4 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-2">
                        {['Cart', 'Summary', 'Done'].map((step, i) => {
                            const active = i === 1;
                            const done = i === 0;
                            return (
                                <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
                                    <div className={`flex items-center gap-1.5 ${active ? 'text-white' : done ? 'text-green-400' : 'text-blue-400'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 ${
                                            active ? 'bg-white text-[#0B1F4D] border-white' :
                                                done ? 'bg-green-400 border-green-400 text-white' :
                                                    'border-blue-600 text-blue-500'
                                        }`}>
                                            {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                                        </div>
                                        <span className={`text-xs font-bold hidden sm:block ${active ? 'text-white' : done ? 'text-green-400' : 'text-blue-500'}`}>{step}</span>
                                    </div>
                                    {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${done ? 'bg-green-400' : 'bg-blue-800'}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {submitError && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm font-bold">
                        <AlertTriangle size={18} /> {submitError}
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-5">
                    {/* ── LEFT COLUMN ── */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* ── DELIVERY ADDRESS ── */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-[#0B1F4D] flex items-center justify-center">
                                        <MapPin size={15} className="text-white" />
                                    </div>
                                    <h2 className="text-[#0B1F4D] font-extrabold text-sm">Delivery Address</h2>
                                </div>
                                <button
                                    onClick={handleOpenAddAddress}
                                    className="flex items-center gap-1.5 text-[#2D7FF9] text-xs font-bold hover:underline"
                                >
                                    <Plus size={13} /> Add new
                                </button>
                            </div>

                            <div className="p-4 space-y-3">
                                {userAddresses.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        No addresses saved. Add one to continue.
                                    </div>
                                )}
                                {userAddresses.map((addr) => {
                                    const selected = selectedAddress?.id === addr.id;
                                    return (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddress(addr)}
                                            className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                                                selected ? 'border-[#0B1F4D] bg-[#f0f2f7]' : 'border-gray-100 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                                    selected ? 'border-[#0B1F4D] bg-[#0B1F4D]' : 'border-gray-300'
                                                }`}>
                                                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[#0B1F4D] font-extrabold text-sm">Delivery Address</span>
                                                        {selected && <span className="text-[10px] font-bold bg-[#0B1F4D] text-white px-2 py-0.5 rounded-full">Selected</span>}
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{addr.addressInfo}</p>
                                                    <p className="text-gray-500 text-xs">{addr.subDistrict}, {addr.district}</p>
                                                    <p className="text-gray-500 text-xs">{addr.province} {addr.postalCode}</p>
                                                </div>
                                                <div className="flex gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleOpenEditAddress(addr)}
                                                        className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#0B1F4D] hover:text-white text-gray-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteAddrId(addr.id)}
                                                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* ── ORDER ITEMS ── */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-xl bg-[#2D7FF9] flex items-center justify-center">
                                    <ShoppingBag size={15} className="text-white" />
                                </div>
                                <h2 className="text-[#0B1F4D] font-extrabold text-sm">Your Items</h2>
                                <span className="text-gray-400 text-xs ml-1">({cartCount} items)</span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {cartSummary?.items.map((item, idx) => (
                                    <div key={`${item.menuId}-${idx}`} className="flex items-center gap-4 px-5 py-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#0B1F4D] font-bold text-sm leading-snug line-clamp-1">{item.menuName}</p>
                                            {item.specialRequest && (
                                                <p className="text-amber-600 text-[11px] italic mt-0.5">"{item.specialRequest}"</p>
                                            )}
                                            {item.selectedOptions.length > 0 && (
                                                <p className="text-gray-500 text-xs mt-0.5">Options: {item.selectedOptions.map(opt => opt.choiceName).join(', ')}</p>
                                            )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[#2D7FF9] font-extrabold text-sm">฿{item.lineTotal}</p>
                                            <p className="text-gray-400 text-[11px]">฿{item.unitPrice} × {item.amount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-5 py-3 border-t border-gray-50">
                                <button
                                    onClick={() => navigate('/customer/cart')}
                                    className="flex items-center gap-1 text-[#2D7FF9] text-xs font-bold hover:underline"
                                >
                                    <Edit2 size={12} /> Edit cart
                                </button>
                            </div>
                        </section>

                        {/* ── PAYMENT METHOD ── */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center">
                                    <CreditCard size={15} className="text-white" />
                                </div>
                                <h2 className="text-[#0B1F4D] font-extrabold text-sm">Payment Method</h2>
                            </div>

                            <div className="p-4 space-y-3">
                                {paymentMethods.map((method) => {
                                    const selected = paymentMethodId === method.id;
                                    const config = PAYMENT_UI_CONFIG[method.methodCode.toUpperCase()] || FALLBACK_PAYMENT_UI;
                                    const Icon = config.icon;

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethodId(method.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                                                selected ? 'border-[#0B1F4D] bg-[#f0f2f7]' : 'border-gray-100 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                selected ? 'border-[#0B1F4D] bg-[#0B1F4D]' : 'border-gray-300'
                                            }`}>
                                                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>

                                            <div className={`w-10 h-10 rounded-xl ${config.light} flex items-center justify-center flex-shrink-0`}>
                                                <Icon size={20} className={config.accent} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-extrabold text-sm ${selected ? 'text-[#0B1F4D]' : 'text-gray-700'}`}>{config.label}</p>
                                                <p className="text-gray-400 text-xs">{config.sub}</p>
                                            </div>

                                            {selected && <Check size={16} className="text-[#0B1F4D] flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedMethodCode === 'QR_PROMPTPAY' && (
                                <div className="mx-4 mb-4 bg-purple-50 rounded-2xl border border-purple-100 p-4 flex items-start gap-3">
                                    <QrCode size={36} className="text-purple-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-purple-700 font-bold text-sm">Scan with your banking app</p>
                                        <p className="text-purple-500 text-xs mt-0.5">A QR code will be shown on the next screen. Complete payment within 5 minutes.</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── RIGHT — PRICE SUMMARY ── */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-[#0B1F4D] px-5 py-4">
                                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Order Total</p>
                                <p className="text-white text-2xl font-extrabold">฿{total}</p>
                            </div>

                            <div className="p-5 space-y-3">
                                <div className="space-y-2">
                                    {cartSummary?.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-500 flex-1 pr-2 truncate">{item.menuName} ×{item.amount}</span>
                                            <span className="text-gray-700 font-semibold flex-shrink-0">฿{item.lineTotal}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 pt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-700 font-semibold">฿{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="text-gray-700 font-semibold">฿{DELIVERY_FEE}</span>
                                    </div>
                                    <div className="flex justify-between font-extrabold text-[#0B1F4D] border-t border-gray-100 pt-2">
                                        <span>Total</span>
                                        <span>฿{total}</span>
                                    </div>
                                </div>

                                {selectedAddress && (
                                    <div className="bg-[#f0f2f7] rounded-2xl p-3 mt-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Delivering to</p>
                                        <p className="text-[#0B1F4D] text-xs font-bold">Delivery Address</p>
                                        <p className="text-gray-500 text-xs">{selectedAddress.addressInfo}, {selectedAddress.district}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!canProceed}
                                    className="w-full flex items-center justify-center gap-2 bg-[#2D7FF9] hover:bg-[#1a6de0] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl transition-colors shadow-md text-sm mt-1"
                                >
                                    {isSubmitting ? 'Processing...' : 'Place Order'}
                                    {!isSubmitting && <ChevronRight size={16} strokeWidth={3} />}
                                </button>

                                {!selectedAddress && (
                                    <p className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold justify-center">
                                        <AlertTriangle size={12} /> Please select a delivery address
                                    </p>
                                )}

                                <p className="text-gray-300 text-[10px] text-center">
                                    By placing your order you agree to our terms and conditions.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── ADDRESS MODAL ── */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden shadow-2xl" style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div className="bg-[#0B1F4D] px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Address</p>
                                <h2 className="text-white text-xl font-extrabold">{editingAddressId ? 'Edit Address' : 'Add Address'}</h2>
                            </div>
                            <button onClick={() => setIsAddressModalOpen(false)} className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {[
                                { label: 'Address Info *', key: 'addressInfo', placeholder: '123 Sukhumvit Soi 11' },
                                { label: 'Sub-District *', key: 'subDistrict', placeholder: 'e.g. Khlong Toei Nuea' },
                                { label: 'District *', key: 'district', placeholder: 'e.g. Watthana' },
                                { label: 'Province *', key: 'province', placeholder: 'e.g. Bangkok' },
                                { label: 'Postal Code *', key: 'postalCode', placeholder: '10110' },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
                                    <input
                                        type="text"
                                        value={(addressForm as never)[key]}
                                        onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 transition-all"
                                    />
                                </div>
                            ))}

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={!addressForm.addressInfo || !addressForm.district || !addressForm.province}
                                    className="flex-1 py-3 bg-[#2D7FF9] hover:bg-[#1a6de0] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                                >
                                    {editingAddressId ? 'Save Changes' : 'Add Address'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE ADDRESS CONFIRM ── */}
            {!!deleteAddrId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl" style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div className="bg-red-500 px-6 py-5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <Trash2 size={18} className="text-white" />
                            </div>
                            <h2 className="text-white font-extrabold text-lg">Remove Address?</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 text-sm mb-6">
                                Remove this address? You can always add it back later.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteAddrId(null)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
                                <button onClick={confirmDeleteAddr} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
        </div>
    );
}

export default OrderSummary;