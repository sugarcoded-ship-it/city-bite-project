import React, {useState, useEffect} from 'react';
// import { useKeycloak } from '@react-keycloak/web';
import {apiClient} from "./api/client.ts";
import keycloak from "./security/keycloak.ts";

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
    extra_info: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
}

interface PaymentMethodResponse {
    id: number;
    methodCode: string;
}

// const API_BASE_URL = 'http://localhost:8080/api';
// const CUSTOMER_UUID = ???

const OrderSummaryPage: React.FC = () => {
    const [cartSummary, setCartSummary] = useState<CartSummaryResponse | null>(null);
    const [refundCredit, setRefundCredit] = useState<number>(0);
    const [userAddresses, setUserAddresses] = useState<AddressDto[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);

    const [paymentMethodId, setPaymentMethodId] = useState<number | ''>('');
    const [useCredit, setUseCredit] = useState<boolean>(false);
    const [selectedAddress, setSelectedAddress] = useState<AddressDto | null>(null);


    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

    const [addressForm, setAddressForm] = useState({
        extra_info: '', subDistrict: '', district: '', province: '', postalCode: ''
    });

    useEffect(() => {
        const fetchBackendData = async () => {
            try {
                setIsLoading(true);

                const cartPromise = apiClient<CartSummaryResponse>('/customer/cart');
                const creditPromise = apiClient<number>('/customer/credits/balance');
                const addressPromise = apiClient<AddressDto[]>('/customer/addresses');
                const paymentPromise = apiClient<PaymentMethodResponse[]>('/customer/payments');

                const [cartData, creditData, addressData, paymentMethodData] = await Promise.all([
                    cartPromise,
                    creditPromise,
                    addressPromise,
                    paymentPromise
                ]);

                setCartSummary(cartData);
                setRefundCredit(creditData);
                setUserAddresses(addressData);

                if (addressData.length > 0) {
                    setSelectedAddress(addressData[0]);
                }

                setPaymentMethods(paymentMethodData);
                if (paymentMethodData.length > 0) {
                    setPaymentMethodId(paymentMethodData[0].id);
                }

            } catch (error) {
                console.error("Failed to load order data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBackendData();
    }, []);

    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({ extra_info: '', subDistrict: '', district: '', province: '', postalCode: '' });
        setIsAddressFormOpen(true);
    };

    const handleOpenEditAddress = (addr: AddressDto) => {
        setEditingAddressId(addr.id);
        setAddressForm({
            extra_info: addr.extra_info, subDistrict: addr.subDistrict,
            district: addr.district, province: addr.province, postalCode: addr.postalCode
        });
        setIsAddressFormOpen(true);
    };

    const handleSaveAddress = async () => {
        if (editingAddressId) {
            const updatedList = userAddresses.map(a => a.id === editingAddressId ? { id: editingAddressId, ...addressForm } : a);
            setUserAddresses(updatedList);
            if (selectedAddress?.id === editingAddressId) setSelectedAddress({ id: editingAddressId, ...addressForm });
        } else {
            const newlySavedAddress: AddressDto = { id: Math.floor(Math.random() * 1000), ...addressForm };
            setUserAddresses([...userAddresses, newlySavedAddress]);
            setSelectedAddress(newlySavedAddress);
        }

        setIsAddressFormOpen(false);
    };

    const handleDeleteAddress = async (idToDelete: number) => {
        const updatedList = userAddresses.filter(a => a.id !== idToDelete);
        setUserAddresses(updatedList);
        if (selectedAddress?.id === idToDelete) {
            setSelectedAddress(updatedList.length > 0 ? updatedList[0] : null);
        }
    };

    const handleConfirmOrder = async () => {
        if (!cartSummary || !selectedAddress || !paymentMethodId) return;

        const orderPayload = {
            customerUuid: keycloak.subject,
            addressId: selectedAddress.id,
            paymentMethodId: Number(paymentMethodId),
            totalPrice: finalTotal,
            items: cartSummary.items.map(item => ({
                menuId: item.menuId,
                quantity: item.amount,
                specialRequest: item.specialRequest || null,
                selectedChoiceIds: item.selectedChoiceIds
            }))
        };

        try {
            await apiClient('customer/orders/create', {
                method: 'POST',
                data: orderPayload
            });
        } catch (err) {
            console.error("Order submission network error:", err);
        }
    };

    if (isLoading || !cartSummary) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-xl font-bold text-gray-500 animate-pulse">Loading your order summary...</div>
            </div>
        );
    }

    const finalTotal: number = useCredit
        ? Math.max(0, cartSummary.totalPrice - refundCredit)
        : cartSummary.totalPrice;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-[#0f172a]">Order Summary</h1>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Your Items</h2>
                        <div className="space-y-4">
                            {cartSummary.items.map((item, index) => (
                                <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{item.menuName} <span className="text-gray-400 font-normal text-sm">x{item.amount}</span></h3>
                                        {item.selectedOptions.length > 0 && (
                                            <ul className="text-sm text-gray-500 mt-2 space-y-1">
                                                {item.selectedOptions.map((opt, i) => <li key={i}>+ {opt.choiceName} (${opt.extraPrice.toFixed(2)})</li>)}
                                            </ul>
                                        )}
                                        {item.specialRequest && <p className="text-sm text-amber-600 mt-2 italic">Note: {item.specialRequest}</p>}
                                    </div>
                                    <div className="font-bold text-[#3b82f6] text-lg">${item.lineTotal.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex justify-between items-center">
                            {selectedAddress ? (
                                <div>
                                    <p className="font-bold text-gray-900">{selectedAddress.extra_info}</p>
                                    <p className="text-sm text-gray-500">{selectedAddress.subDistrict}, {selectedAddress.district}</p>
                                    <p className="text-sm text-gray-500">{selectedAddress.province} {selectedAddress.postalCode}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No address selected.</p>
                            )}
                            <button onClick={() => setIsAddressModalOpen(true)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition">
                                Change
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                        <select
                            value={paymentMethodId}
                            onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select a method</option>
                            {paymentMethods.map(pm => (
                                <option key={pm.id} value={pm.id}>{pm.methodCode.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Summary</h2>
                        <div className="space-y-3 text-gray-600 mb-6 border-b border-gray-100 pb-6">
                            <div className="flex justify-between"><span>Subtotal</span><span>${cartSummary.totalPrice.toFixed(2)}</span></div>
                            {refundCredit > 0 && (
                                <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg border border-green-100">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={useCredit} onChange={() => setUseCredit(!useCredit)} className="w-4 h-4 text-green-600 rounded" />
                                        Use Credit (${refundCredit.toFixed(2)})
                                    </label>
                                    {useCredit && <span>-${Math.min(refundCredit, cartSummary.totalPrice).toFixed(2)}</span>}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-black text-2xl text-[#3b82f6]">${finalTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleConfirmOrder}
                            disabled={cartSummary.items.length === 0 || !selectedAddress || !paymentMethodId}
                            className="w-full bg-[#3b82f6] hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md transition-colors"
                        >
                            Confirm Order
                        </button>
                    </div>
                </div>
            </div>

            {isAddressModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{isAddressFormOpen ? (editingAddressId ? 'Edit Address' : 'Add New Address') : 'Select Address'}</h2>
                            <button onClick={() => { setIsAddressModalOpen(false); setIsAddressFormOpen(false); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
                        </div>

                        {isAddressFormOpen ? (
                            <div className="space-y-4">
                                <input placeholder="Extra Address Information" value={addressForm.extra_info} onChange={(e) => setAddressForm({...addressForm, extra_info: e.target.value})} className="border p-3 rounded-lg w-full bg-gray-50 outline-none" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Sub-district" value={addressForm.subDistrict} onChange={(e) => setAddressForm({...addressForm, subDistrict: e.target.value})} className="border p-3 rounded-lg w-full bg-gray-50 outline-none" />
                                    <input placeholder="District" value={addressForm.district} onChange={(e) => setAddressForm({...addressForm, district: e.target.value})} className="border p-3 rounded-lg w-full bg-gray-50 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Province" value={addressForm.province} onChange={(e) => setAddressForm({...addressForm, province: e.target.value})} className="border p-3 rounded-lg w-full bg-gray-50 outline-none" />
                                    <input placeholder="Postal Code" value={addressForm.postalCode} onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})} className="border p-3 rounded-lg w-full bg-gray-50 outline-none" />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setIsAddressFormOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                                    <button onClick={handleSaveAddress} className="flex-1 py-3 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600">Save</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                                    {userAddresses.map((addr) => (
                                        <div key={addr.id} className={`p-4 rounded-xl border flex flex-col transition ${selectedAddress?.id === addr.id ? 'border-[#3b82f6] bg-blue-50 ring-1 ring-[#3b82f6]' : 'border-gray-200'}`}>
                                            <div className="flex-1 cursor-pointer" onClick={() => { setSelectedAddress(addr); setIsAddressModalOpen(false); }}>
                                                <p className="font-bold">{addr.extra_info}</p>
                                                <p className="text-sm text-gray-500">{addr.subDistrict}, {addr.district}</p>
                                                <p className="text-sm text-gray-500">{addr.province} {addr.postalCode}</p>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-gray-100">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenEditAddress(addr); }} className="text-sm text-blue-600 hover:underline font-semibold">Edit</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }} className="text-sm text-red-600 hover:underline font-semibold">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {userAddresses.length < 3 ? (
                                    <button onClick={handleOpenAddAddress} className="w-full py-3 border-2 border-dashed border-[#3b82f6] text-[#3b82f6] font-bold rounded-xl hover:bg-blue-50 transition">
                                        + Add New Address ({3 - userAddresses.length} remaining)
                                    </button>
                                ) : (
                                    <p className="text-center text-sm text-red-500 bg-red-50 p-2 rounded-lg">Max 3 addresses reached.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderSummaryPage;