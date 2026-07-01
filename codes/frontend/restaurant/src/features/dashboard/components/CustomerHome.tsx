import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { LogoutButton } from '../../auth/components/LogoutButton.tsx';
import styles from './CustomerHome.module.css';
import { Link } from 'react-router-dom';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    menuPic: string | null;
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
}

const CATEGORIES = ['Appetizer', 'Main Dish', 'Broth', 'Side Dish', 'Dessert', 'Drink', "Chef's Special"];

export const CustomerHome = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc'>('default');

    const [cartCount, setCartCount] = useState<number>(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Custom Item Configurations Modal State
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [specialRequest, setSpecialRequest] = useState<string>('');
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [selectedChoices, setSelectedChoices] = useState<Record<number, number[]>>({});
    const [modalQuantity, setModalQuantity] = useState<number>(1); // Pre-add counter state

    // Main Shopping Cart Overlay State
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        apiClient('/customer/').catch((err) => console.error('Customer sync failed:', err));
    }, []);

    const updateCartCountBadge = () => {
        apiClient<CartItem[]>('/customer/cart')
            .then((itemsInCart) => {
                const totalItems = itemsInCart.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            })
            .catch((err) => console.error('Failed to update cart badge metrics:', err));
    };

    useEffect(() => {
        updateCartCountBadge();
    }, []);

    useEffect(() => {
        const endpoint = selectedCategory
            ? `/customer/menu?category=${encodeURIComponent(selectedCategory)}`
            : '/customer/menu';

        apiClient<MenuItem[]>(endpoint)
            .then((res) => {
                setItems(res);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Menu loading failed:', err);
                setError('Failed to load menu.');
                setLoading(false);
            });
    }, [selectedCategory]);

    const displayedItems = items
        .filter((item) => item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        .sort((a, b) => {
            if (sortOption === 'price-asc') return a.price - b.price;
            if (sortOption === 'price-desc') return b.price - a.price;
            return 0;
        });

    const openModal = async (item: MenuItem) => {
        setSelectedItem(item);
        setSpecialRequest('');
        setOptionGroups([]);
        setSelectedChoices({});
        setModalQuantity(1); // Reset counter defaults to 1 item unit

        try {
            const customizations = await apiClient<OptionGroup[]>(`/customer/menu/${item.id}/options`);
            setOptionGroups(customizations);

            const initialSelections: Record<number, number[]> = {};
            customizations.forEach((group) => {
                initialSelections[group.id] = [];
            });
            setSelectedChoices(initialSelections);
        } catch (err) {
            console.error("Failed to fetch menu option properties:", err);
        }
    };

    const closeModal = () => {
        setSelectedItem(null);
        setSpecialRequest('');
        setOptionGroups([]);
        setSelectedChoices({});
    };

    const openCartModal = async () => {
        try {
            const itemsInCart = await apiClient<CartItem[]>('/customer/cart');
            setCartItems(itemsInCart);
            setIsCartOpen(true);
        } catch (err) {
            console.error('Could not fetch active cart info:', err);
        }
    };

    const closeCartModal = () => {
        setIsCartOpen(false);
    };

    const handleChoiceSelection = (groupId: number, choiceId: number, maxChoices: number) => {
        setSelectedChoices((prev) => {
            const currentGroupSelections = prev[groupId] || [];

            if (currentGroupSelections.includes(choiceId)) {
                return { ...prev, [groupId]: currentGroupSelections.filter(id => id !== choiceId) };
            } else {
                if (maxChoices === 1) {
                    return { ...prev, [groupId]: [choiceId] };
                }
                if (currentGroupSelections.length < maxChoices) {
                    return { ...prev, [groupId]: [...currentGroupSelections, choiceId] };
                }
                return prev;
            }
        });
    };

    const calculateTotalPrice = () => {
        if (!selectedItem) return 0;
        let extrasAmount = 0;

        optionGroups.forEach((group) => {
            const activeIds = selectedChoices[group.id] || [];
            group.choices.forEach((choice) => {
                if (activeIds.includes(choice.choiceId)) {
                    extrasAmount += choice.extraPrice;
                }
            });
        });

        return (selectedItem.price + extrasAmount) * modalQuantity;
    };

    const calculateCartGrandTotal = () => {
        return cartItems.reduce((grandTotal, item) => grandTotal + (item.price * item.quantity), 0);
    };

    const handleConfirmAddToCart = async () => {
        if (!selectedItem) return;

        for (const group of optionGroups) {
            if (group.isRequired && (!selectedChoices[group.id] || selectedChoices[group.id].length === 0)) {
                alert(`Please make a choice for: "${group.groupName}"`);
                return;
            }
        }

        try {
            // Added configuration variables supporting continuous amount updates on submit requests
            await apiClient('/customer/cart/add', {
                method: 'POST',
                data: {
                    menuId: selectedItem.id,
                    specialRequest: specialRequest,
                    selectedChoices: selectedChoices,
                    quantity: modalQuantity
                }
            });

            updateCartCountBadge();
            setToastMessage(`Added ${modalQuantity}x ${selectedItem.name} to cart!`);
            setTimeout(() => setToastMessage(null), 3000);

            closeModal();
        } catch (err) {
            console.error('Failed to add to cart:', err);
            setToastMessage('Could not add item to cart.');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleUpdateQuantityInCart = async (itemIndex: number, change: number) => {
        try {
            const updatedItems = await apiClient<CartItem[]>(
                `/customer/cart/update?itemIndex=${itemIndex}&change=${change}`,
                { method: 'PATCH' }
            );
            setCartItems(updatedItems);
            updateCartCountBadge();
        } catch (err) {
            console.error("Could not modify item count row unit:", err);
        }
    };

    const handleRemoveItemFromCart = async (itemIndex: number) => {
        try {
            const updatedItems = await apiClient<CartItem[]>(
                `/customer/cart/remove/${itemIndex}`,
                { method: 'DELETE' }
            );
            setCartItems(updatedItems);
            updateCartCountBadge();
        } catch (err) {
            console.error("Could not remove cart row configuration:", err);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header row area */}
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Menu</h1>
                <div className={styles.actionsArea}>
                    <div className={styles.cartWidget} onClick={openCartModal}>
                        <svg className={styles.cartIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2m7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
                        </svg>
                        <span className={styles.cartText}>Cart</span>
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>{cartCount}</span>
                        )}
                    </div>
                    <button className={styles.orderHistoryButton}>Order History</button>
                    <LogoutButton />
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Category selection row element */}
            <div className={styles.filterRow}>
                <button
                    className={`${styles.filterButton} ${selectedCategory === null ? styles.filterButtonActive : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All Items
                </button>
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        className={`${styles.filterButton} ${selectedCategory === category ? styles.filterButtonActive : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Search & Sort Controls Row */}
            <div className={styles.controlsRow}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search menu by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className={styles.sortSelect}
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                >
                    <option value="default">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>

            {/* Product Grid - Styled via companion CSS Module file to lock 3 Columns */}
            {!loading && !error && (
                <div className={styles.menuGrid}>
                    {displayedItems.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No menu items match your search.</p>
                    ) : (
                        displayedItems.map((item) => (
                        <div key={item.id} className={styles.menuCard}>
                            <div className={styles.imageWrapper}>
                                {item.menuPic ? (
                                    <img src={item.menuPic} alt={item.name} className={styles.menuImage} />
                                ) : (
                                    <div className={styles.menuImage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style={{ marginBottom: '4px' }}>
                                            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                                        </svg>
                                        <span style={{ fontSize: '12px' }}>No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.menuInfo}>
                                <p className={styles.menuName}>{item.name}</p>
                                <p className={styles.menuPrice}>฿{item.price.toFixed(2)}</p>

                                <button
                                    className={styles.addButton}
                                    onClick={() => openModal(item)}
                                >
                                    <span>+</span> Add to Cart
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
            )}

            {/* Customizations Modal Details View Container */}
            {selectedItem && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {selectedItem.menuPic ? (
                            <img src={selectedItem.menuPic} alt={selectedItem.name} className={styles.modalHeaderImage} />
                        ) : (
                            <div className={styles.modalHeaderImage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', background: '#f3f4f6' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16" style={{ marginBottom: '6px' }}>
                                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                                </svg>
                                <span style={{ fontSize: '13px' }}>No Image Available</span>
                            </div>
                        )}

                        <div className={styles.modalBody}>
                            <div className={styles.modalTitleRow}>
                                <h2>{selectedItem.name}</h2>
                                <span className={styles.modalPrice}>฿{selectedItem.price.toFixed(2)}</span>
                            </div>

                            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                                {optionGroups.length === 0 ? (
                                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>No customization options available for this item.</p>
                                ) : (
                                    optionGroups.map((group) => (
                                        <div key={group.id} style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>{group.groupName}</span>
                                                {group.isRequired && (
                                                    <span style={{ color: '#ef4444', fontSize: '11px', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Required</span>
                                                )}
                                                <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                                                    (Max: {group.maxChoices})
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {group.choices.map((choice) => {
                                                    const isSelected = selectedChoices[group.id]?.includes(choice.choiceId);
                                                    return (
                                                        <label
                                                            key={choice.choiceId}
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '10px 14px',
                                                                border: `1px solid ${isSelected ? '#2D7FF9' : '#e5e7eb'}`,
                                                                background: isSelected ? '#f0f6ff' : '#ffffff',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                            onClick={() => handleChoiceSelection(group.id, choice.choiceId, group.maxChoices)}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                                                <input
                                                                    type={group.maxChoices === 1 ? "radio" : "checkbox"}
                                                                    name={`group-${group.id}`}
                                                                    checked={isSelected || false}
                                                                    readOnly
                                                                    style={{ accentColor: '#2D7FF9', cursor: 'pointer' }}
                                                                />
                                                                <span style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{choice.choiceName}</span>
                                                            </div>
                                                            {choice.extraPrice > 0 && (
                                                                <span style={{ color: '#2D7FF9', fontSize: '13px', fontWeight: 700 }}>
                                                                    +฿{choice.extraPrice.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className={styles.modalSectionTitle}>Special Instructions</div>
                            <textarea
                                className={styles.noteInput}
                                placeholder="E.g., Allergen alerts, swap components, extra spicy..."
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                            />

                            {/* PRE-ADD TO CART QUANTITY CONTROLLER */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '12px 0', borderTop: '1px solid #f3f4f6' }}>
                                <span style={{ fontWeight: 700, color: '#374151', fontSize: '14px' }}>Select Quantity:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d1d5db', background: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center', color: '#111827' }}>{modalQuantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setModalQuantity(q => q + 1)}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d1d5db', background: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelButton} onClick={closeModal}>Cancel</button>
                                <button className={styles.confirmButton} onClick={handleConfirmAddToCart}>
                                    Confirm - ฿{calculateTotalPrice().toFixed(2)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shopping Cart Drawer Overlay Popup View */}
            {isCartOpen && (
                <div className={styles.modalOverlay} onClick={closeCartModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0B1F4D', fontWeight: 800 }}>Your Cart</h2>
                                <button onClick={closeCartModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
                            </div>

                            {cartItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" style={{ marginBottom: '12px', color: '#d1d5db' }}>
                                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5" />
                                    </svg>
                                    <p style={{ margin: 0, fontWeight: 500 }}>Your cart is empty</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} style={{ padding: '14px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: 700, color: '#0B1F4D', fontSize: '1.05rem' }}>{item.name}</span>
                                                    </div>

                                                    {/* Selected Customization Options Text Tags */}
                                                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                                            {item.selectedCustomizations.map((customText, cIdx) => (
                                                                <span
                                                                    key={cIdx}
                                                                    style={{ fontSize: '11px', background: '#f0f6ff', color: '#2D7FF9', padding: '2px 8px', borderRadius: '12px', border: '1px solid #d0e1fd', fontWeight: 500 }}
                                                                >
                                                                    {customText}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {item.specialRequest && (
                                                        <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ef4444', fontStyle: 'italic', fontWeight: 500 }}>
                                                            Note: "{item.specialRequest}"
                                                        </p>
                                                    )}

                                                    {/* QUANTITY CONTROL & REMOVAL INSIDE CART OVERLAY */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                                        <button
                                                            onClick={() => handleUpdateQuantityInCart(idx, -1)}
                                                            style={{ border: '1px solid #d1d5db', background: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}
                                                        >
                                                            -
                                                        </button>
                                                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantityInCart(idx, 1)}
                                                            style={{ border: '1px solid #d1d5db', background: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4b5563' }}
                                                        >
                                                            +
                                                        </button>

                                                        <button
                                                            onClick={() => handleRemoveItemFromCart(idx)}
                                                            style={{ marginLeft: '12px', border: 'none', background: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: '4px', fontWeight: 600 }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontWeight: 700, color: '#0B1F4D', fontSize: '1.05rem' }}>
                                                    ฿{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '14px', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                                            <span style={{ color: '#374151' }}>Grand Total:</span>
                                            <span style={{ color: '#2D7FF9' }}>฿{calculateCartGrandTotal().toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className={styles.cancelButton} onClick={closeCartModal} style={{ flex: 1 }}>
                                            Close
                                        </button>

                                        <Link
                                            to="/order-summary"
                                            className={styles.confirmButton}
                                            style={{
                                                flex: 1,
                                                textDecoration: 'none',
                                                textAlign: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            Checkout
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sliding Feedback Toast Alert */}
            {toastMessage && (
                <div className={styles.toast}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    {toastMessage}
                </div>
            )}
        </div>
    );
};