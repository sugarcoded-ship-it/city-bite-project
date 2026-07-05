import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../lib/api-client';
import { CustomerTopNav } from '../../../customer/CustomerTopNav.tsx';
import {
    Search, Plus, Minus, X, ChevronLeft, ChevronRight,
    ShoppingBag, Trash2, ChevronDown, Flame
} from 'lucide-react';

// --- Interfaces ---
interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    menuPic: string | null;
    description?: string;
    status: string;
}

interface OptionChoice {
    choiceId: number;
    choiceName: string;
    extraPrice: number;
}

interface OptionGroup {
    id: number;
    groupName: string;
    isRequired: boolean;
    maxChoices: number;
    choices: OptionChoice[];
}

interface CartItem {
    menuId: number;
    name: string;
    price: number;
    quantity: number;
    specialRequest: string | null;
    selectedCustomizations: string[];
    status: string;
}

type SortOption = 'default' | 'price-asc' | 'price-desc';

export function CustomerDashboard() {
    const navigate = useNavigate();

    // --- Data States ---
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Cart States ---
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartCount, setCartCount] = useState<number>(0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const hasUnavailableCartItem = cartItems.some((item) => item.status !== 'ACTIVE');

    // --- Store Status ---
    const [storeOpen, setStoreOpen] = useState<boolean>(true);
    const [showClosedPopup, setShowClosedPopup] = useState<boolean>(false);

    // --- UI States ---
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOption, setSortOption] = useState<SortOption>('default');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // --- Modal States ---
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [specialRequest, setSpecialRequest] = useState<string>('');
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [selectedChoices, setSelectedChoices] = useState<Map<number, number[]>>(new Map());

    // --- Carousel States ---
    const [slide, setSlide] = useState(0);
    const [sliding, setSliding] = useState(false);

    // --- Effects & API Calls ---
    const fetchCartSnapshot = useCallback(() => {
        apiClient<CartItem[]>('/customer/cart')
            .then((data) => {
                setCartItems(data);
                const totalCount = data.reduce((acc, current) => acc + current.quantity, 0);
                setCartCount(totalCount);
            })
            .catch((err) => console.error('Error synchronizing active cart snapshot:', err));
    }, []);

    useEffect(() => {
        apiClient('/customer/').catch((err) => console.error('Failed to sync user profile:', err));

        apiClient<{ isOpen: boolean }>('/customer/store-status')
            .then((data) => {
                setStoreOpen(data.isOpen);
                if (!data.isOpen) setShowClosedPopup(true);
            })
            .catch((err) => console.error('Failed to fetch store status:', err));

        apiClient<MenuItem[]>('/customer/menu')
            .then((data: MenuItem[] | { data: MenuItem[] }) => {
                if (Array.isArray(data)) setItems(data);
                else if (data && Array.isArray((data as { data: MenuItem[] }).data)) setItems((data as { data: MenuItem[] }).data);
                else setItems([]);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching menu items:', err);
                setError('Failed to load menu items');
                setLoading(false);
            });

        fetchCartSnapshot();
    }, [fetchCartSnapshot]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // --- Memoized Derived Data ---
    const CATEGORIES = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        return ['All', ...Array.from(new Set(safeItems.map((m) => m.category)))];
    }, [items]);

    const FEATURED = useMemo(() => {
        const available = items.filter((item) => item.status === 'ACTIVE');
        if (available.length === 0) return [];
        // Select top 3 available items for the carousel dynamically
        return available.slice(0, 3).map((item, idx) => ({
            item,
            badge: idx === 0 ? "Chef's Pick" : idx === 1 ? "Most Popular" : "Today's Special",
            tagline: 'City Bite selected delight just for you',
            bg: idx === 0 ? 'from-[#0B1F4D]/80 via-[#0B1F4D]/40 to-transparent' :
                idx === 1 ? 'from-[#7c2d12]/80 via-[#7c2d12]/40 to-transparent' :
                    'from-[#14532d]/80 via-[#14532d]/40 to-transparent',
        }));
    }, [items]);

    const displayedItems = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        return safeItems
            .filter((item) =>
                (selectedCategory === 'All' || item.category === selectedCategory) &&
                item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
            )
            .sort((a, b) => {
                if (sortOption === 'price-asc') return a.price - b.price;
                if (sortOption === 'price-desc') return b.price - a.price;
                return 0;
            });
    }, [items, selectedCategory, searchQuery, sortOption]);

    // --- Carousel Logic ---
    const goTo = useCallback((idx: number) => {
        if (sliding || FEATURED.length === 0) return;
        setSliding(true);
        setSlide(idx);
        setTimeout(() => setSliding(false), 400);
    }, [sliding, FEATURED.length]);

    const next = useCallback(() => goTo((slide + 1) % FEATURED.length), [slide, goTo, FEATURED.length]);
    const prev = useCallback(() => goTo((slide - 1 + FEATURED.length) % FEATURED.length), [slide, goTo, FEATURED.length]);

    useEffect(() => {
        if (FEATURED.length === 0) return;
        const t = setInterval(next, 4000);
        return () => clearInterval(t);
    }, [next, FEATURED.length]);

    // --- Handlers ---
    const openMenuModal = async (item: MenuItem) => {
        if (!storeOpen) {
            setShowClosedPopup(true);
            return;
        }
        if (item.status !== 'ACTIVE') return;
        setSelectedItem(item);
        setSelectedChoices(new Map());
        setSpecialRequest('');
        setItemQuantity(1);

        try {
            const dynamicCustomizations = await apiClient<OptionGroup[]>(`/customer/menu/${item.id}/options`);
            setOptionGroups(dynamicCustomizations);
        } catch (err) {
            console.error('Could not load operational customizations matrix:', err);
            setOptionGroups([]);
        }
    };

    const closeMenuModal = () => {
        setSelectedItem(null);
        setOptionGroups([]);
    };

    const handleChoiceSelection = (groupId: number, choiceId: number, maxChoices: number) => {
        const workingMap = new Map(selectedChoices);
        const currentSelections = workingMap.get(groupId) || [];

        if (maxChoices === 1) {
            workingMap.set(groupId, [choiceId]);
        } else {
            if (currentSelections.includes(choiceId)) {
                workingMap.set(groupId, currentSelections.filter(id => id !== choiceId));
            } else {
                if (currentSelections.length < maxChoices) {
                    workingMap.set(groupId, [...currentSelections, choiceId]);
                } else {
                    showToast(`Maximum selections reached (${maxChoices})`);
                }
            }
        }
        setSelectedChoices(workingMap);
    };

    const handleAddToCartConfirm = async () => {
        if (!selectedItem) return;

        for (const group of optionGroups) {
            if (group.isRequired && (!selectedChoices.get(group.id) || selectedChoices.get(group.id)!.length === 0)) {
                showToast(`Please make a required selection for: ${group.groupName}`);
                return;
            }
        }

        const serializedPayload = {
            menuId: selectedItem.id,
            specialRequest: specialRequest.trim() || null,
            selectedChoices: Object.fromEntries(selectedChoices),
            quantity: itemQuantity
        };

        try {
            await apiClient('/customer/cart/add', {
                method: 'POST',
                data: serializedPayload
            });

            showToast(`${itemQuantity}× ${selectedItem.name} added to cart!`);
            closeMenuModal();
            fetchCartSnapshot();
        } catch (err) {
            console.error('Network request failed adding payload to cart:', err);
            const e = err as { response?: { data?: { message?: string } } };
            showToast(e.response?.data?.message ?? 'Failed to append item to cart.');
        }
    };

    const updateCartQuantityBackend = async (index: number, delta: number) => {
        try {
            const updatedDataset = await apiClient<CartItem[]>(`/customer/cart/update?itemIndex=${index}&change=${delta}`, {
                method: 'PATCH'
            });
            setCartItems(updatedDataset);
            setCartCount(updatedDataset.reduce((acc, cur) => acc + cur.quantity, 0));
        } catch (err) {
            console.error('Failed updating quantities:', err);
        }
    };

    const removeCartItemBackend = async (index: number) => {
        try {
            const reducedDataset = await apiClient<CartItem[]>(`/customer/cart/remove/${index}`, {
                method: 'DELETE'
            });
            setCartItems(reducedDataset);
            setCartCount(reducedDataset.reduce((acc, cur) => acc + cur.quantity, 0));
            showToast('Item removed from cart.');
        } catch (err) {
            console.error('Delete execution collapsed:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f7] gap-6">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="spinner">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        )
    }
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#f0f2f7] text-red-500 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-[#f0f2f7]">
            <CustomerTopNav cartCount={cartCount} />

            {/* Page body — offset for fixed nav */}
            <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 py-6">

                {/* ── HERO CAROUSEL ── */}
                {FEATURED.length > 0 && (
                    <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 shadow-xl group select-none bg-gray-200">
                        {FEATURED.map((f, i) => (
                            <div
                                key={f.item.id}
                                className="absolute inset-0 transition-opacity duration-500"
                                style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}
                            >
                                {f.item.menuPic ? (
                                    <img src={f.item.menuPic} alt={f.item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">City Bite Premium Select</div>
                                )}

                                <div className={`absolute inset-0 bg-gradient-to-r ${f.bg}`} />

                                <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-10 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                    <Flame size={12} />
                      {f.badge}
                  </span>
                                    <h2 className="text-white text-xl sm:text-3xl font-extrabold leading-tight drop-shadow-md max-w-xs sm:max-w-md">
                                        {f.item.name}
                                    </h2>
                                    <p className="text-white/75 text-sm mt-1 mb-4 hidden sm:block">{f.tagline}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-extrabold text-xl">฿{f.item.price.toFixed(2)}</span>
                                        <button
                                            onClick={() => openMenuModal(f.item)}
                                            className="bg-white text-[#0B1F4D] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#2D7FF9] hover:text-white transition-colors"
                                        >
                                            Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50">
                            <ChevronRight size={20} />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {FEATURED.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className={`rounded-full transition-all ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SPLIT LAYOUT ── */}
                <div className="flex gap-6 items-start">

                    {/* LEFT — Menu */}
                    <div className="flex-1 min-w-0">
                        <div className="flex gap-3 mb-5">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search standard dishes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm text-gray-700 font-medium focus:outline-none focus:border-[#2D7FF9] cursor-pointer"
                                >
                                    <option value="default">Default</option>
                                    <option value="price-asc">Price ↑</option>
                                    <option value="price-desc">Price ↓</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                                        selectedCategory === cat
                                            ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B1F4D]/40 hover:text-[#0B1F4D]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[#0B1F4D] text-lg font-extrabold">
                                {selectedCategory === 'All' ? 'All Dishes' : selectedCategory}
                            </h2>
                            <span className="text-gray-400 text-sm">{displayedItems.length} items</span>
                        </div>

                        {displayedItems.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
                                <p className="font-medium text-sm">No dishes match your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayedItems.map((item) => {
                                    const isAvailable = item.status === 'ACTIVE' && storeOpen;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 group/card ${isAvailable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'cursor-not-allowed'}`}
                                            onClick={() => openMenuModal(item)}
                                        >
                                            <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
                                                {item.menuPic ? (
                                                    <img
                                                        src={item.menuPic}
                                                        alt={item.name}
                                                        className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? 'group-hover/card:scale-105' : 'opacity-50 grayscale'}`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold">No Image</div>
                                                )}
                                                <span className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                                                {!isAvailable && (
                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold uppercase tracking-wide">
                                                    {!storeOpen ? 'Store Closed' : item.status === 'OUT_OF_ORDER' ? 'Out of Stock' : 'Unavailable'}
                                                </span>
                                                )}
                                            </div>

                                            <div className="p-3.5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    {/* Item Name */}
                                                    <p className="font-bold text-[#0B1F4D] text-sm leading-snug line-clamp-2 mb-0.5">
                                                        {item.name}
                                                    </p>
                                                </div>

                                                {/* Action Footer Bar */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                <span className="text-[#2D7FF9] font-extrabold text-base">
                                                    ฿{item.price.toFixed(2)}
                                                </span>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openMenuModal(item);
                                                        }}
                                                        disabled={!isAvailable}
                                                        className={`rounded-xl w-8 h-8 flex items-center justify-center transition-colors shadow-sm transform duration-150 ${isAvailable ? 'bg-[#0B1F4D] hover:bg-[#2D7FF9] text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                        title={isAvailable ? 'Add to cart' : 'Currently unavailable'}
                                                    >
                                                        <Plus size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Cart Sidebar */}
                    <aside className="w-80 flex-shrink-0 hidden lg:block self-stretch">
                        {/* 'sticky top-28' handles the top screen locking position */}
                        <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col">
                            <div className="bg-[#0B1F4D] px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-blue-300" />
                                        <span className="text-white font-extrabold text-base">Your Cart</span>
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="bg-[#2D7FF9] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {cartCount} item{cartCount !== 1 ? 's' : ''}
                    </span>
                                    )}
                                </div>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="px-5 py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <ShoppingBag size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">Your cart is empty</p>
                                    <p className="text-gray-300 text-xs mt-1">Add dishes to get started</p>
                                </div>
                            ) : (
                                <>
                                    {/* Dynamically fits exactly inside the window space so checkout never flies off-screen */}
                                    <div className="px-4 py-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide flex-1">
                                        {cartItems.map((entry, idx) => (
                                            <div key={`${entry.menuId}-${idx}`} className={`flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 ${entry.status !== 'ACTIVE' ? 'opacity-60' : ''}`}>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[#0B1F4D] font-bold text-xs leading-snug line-clamp-2">
                                                        {entry.name}
                                                    </p>
                                                    {entry.status !== 'ACTIVE' && (
                                                        <p className="text-[10px] text-red-500 font-bold mt-0.5">
                                                            {entry.status === 'OUT_OF_ORDER' ? 'No longer in stock — remove to checkout' : 'No longer available — remove to checkout'}
                                                        </p>
                                                    )}
                                                    {entry.selectedCustomizations.length > 0 && (
                                                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 italic">
                                                            Opts: {entry.selectedCustomizations.join(', ')}
                                                        </p>
                                                    )}
                                                    {entry.specialRequest && (
                                                        <p className="text-[10px] text-amber-600 italic mt-0.5 line-clamp-1">
                                                            Note: "{entry.specialRequest}"
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-1 py-0.5">
                                                            <button onClick={() => updateCartQuantityBackend(idx, -1)} className="w-5 h-5 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                                                                <Minus size={10} />
                                                            </button>
                                                            <span className="text-[#0B1F4D] font-bold text-xs w-4 text-center">{entry.quantity}</span>
                                                            <button onClick={() => updateCartQuantityBackend(idx, 1)} className="w-5 h-5 rounded-md bg-[#0B1F4D] flex items-center justify-center text-white hover:bg-[#1a3a7a]">
                                                                <Plus size={10} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                        <span className="text-[#2D7FF9] font-extrabold text-xs">
                                            ฿{(entry.price * entry.quantity).toFixed(2)}
                                        </span>
                                                            <button onClick={() => removeCartItemBackend(idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
                                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                                            <span>Subtotal</span>
                                            <span>฿{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-extrabold text-[#0B1F4D] text-base border-t border-gray-200 pt-2 mb-4 mt-2">
                                            <span>Total</span>
                                            <span>฿{cartTotal.toFixed(2)}</span>
                                        </div>
                                        {hasUnavailableCartItem && (
                                            <p className="text-[11px] text-red-500 font-semibold mb-2 text-center">
                                                Remove unavailable items before checking out.
                                            </p>
                                        )}
                                        <button
                                            onClick={() => navigate('/order-summary')}
                                            disabled={hasUnavailableCartItem}
                                            className={`w-full font-bold py-3 rounded-xl text-sm transition-colors shadow-md ${hasUnavailableCartItem ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#2D7FF9] hover:bg-[#1a6de0] text-white'}`}
                                        >
                                            Checkout →
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── STORE CLOSED POPUP ── */}
            {showClosedPopup && (
                <div className="fixed inset-0 bg-[#0B1F4D]/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-7 text-center shadow-2xl" style={{ animation: 'modalIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                            !
                        </div>
                        <h2 className="text-[#0B1F4D] text-lg font-extrabold mb-2">We're Currently Closed</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Sorry, we're not accepting orders right now. Please check back during our opening hours.
                        </p>
                        <button
                            onClick={() => setShowClosedPopup(false)}
                            className="w-full bg-[#0B1F4D] hover:bg-[#1a3a7a] text-white font-bold py-3 rounded-xl text-sm transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* ── ADD TO CART MODAL ── */}
            {selectedItem && (
                <div className="fixed inset-0 bg-[#0B1F4D]/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={closeMenuModal}>
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>

                        {/* Header Image */}
                        <div className="relative w-full h-48 bg-gray-100 flex-shrink-0">
                            {selectedItem.menuPic ? (
                                <img src={selectedItem.menuPic} alt={selectedItem.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-semibold">City Bite Premium</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <button onClick={closeMenuModal} className="absolute top-4 right-4 bg-white/90 rounded-full p-1.5 text-gray-700 hover:bg-white shadow">
                                <X size={18} />
                            </button>
                            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                                <div>
                  <span className="bg-[#2D7FF9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block uppercase tracking-wide">
                    {selectedItem.category}
                  </span>
                                    <h2 className="text-white text-xl font-extrabold leading-snug drop-shadow-md">
                                        {selectedItem.name}
                                    </h2>
                                </div>
                                <span className="text-white font-extrabold text-xl drop-shadow-md">฿{selectedItem.price.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto flex-1 p-6">
                            {selectedItem.description && (
                                <p className="text-gray-500 text-sm leading-relaxed mb-5">{selectedItem.description}</p>
                            )}

                            {/* Dynamic Option Groups */}
                            {optionGroups.map((group) => (
                                <div key={group.id} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-[#0B1F4D] text-sm font-bold">{group.groupName}</h4>
                                        {group.isRequired ? (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Required</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs font-medium">Max {group.maxChoices}</span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {group.choices.map((choice) => {
                                            const selectedArray = selectedChoices.get(group.id) || [];
                                            const isChecked = selectedArray.includes(choice.choiceId);
                                            return (
                                                <label key={choice.choiceId} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-blue-50/50 border-[#2D7FF9]' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type={group.maxChoices === 1 ? "radio" : "checkbox"}
                                                            checked={isChecked}
                                                            onChange={() => handleChoiceSelection(group.id, choice.choiceId, group.maxChoices)}
                                                            className="w-4 h-4 text-[#2D7FF9] accent-[#2D7FF9] cursor-pointer"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-700">{choice.choiceName}</span>
                                                    </div>
                                                    {choice.extraPrice > 0 && (
                                                        <span className="text-xs font-bold text-[#2D7FF9]">+฿{choice.extraPrice.toFixed(2)}</span>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="mb-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Special Instructions <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={specialRequest}
                                    onChange={(e) => setSpecialRequest(e.target.value)}
                                    placeholder="e.g. Allergies, extra spicy..."
                                    rows={2}
                                    maxLength={255}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-4 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1.5 border border-gray-200">
                                <button onClick={() => setItemQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50">
                                    <Minus size={16} />
                                </button>
                                <span className="w-6 text-center font-extrabold text-[#0B1F4D] text-base">{itemQuantity}</span>
                                <button onClick={() => setItemQuantity((q) => q + 1)} className="w-8 h-8 rounded-lg bg-[#0B1F4D] text-white shadow-sm flex items-center justify-center hover:bg-[#1a3a7a]">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCartConfirm}
                                disabled={selectedItem.status !== 'ACTIVE'}
                                className="flex-1 bg-[#2D7FF9] hover:bg-[#1a6de0] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md flex justify-between px-5 items-center"
                            >
                                <span>Add to Order</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">฿{(selectedItem.price * itemQuantity).toFixed(2)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOAST ALERT ── */}
            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0B1F4D] text-white text-sm font-semibold px-5 py-3 rounded-full shadow-2xl z-[60] whitespace-nowrap flex items-center gap-2 animate-toast">
          <span className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
                    {toastMessage}
                </div>
            )}

            <style>{`
            @keyframes modalIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
        .animate-toast { animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}