import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LogoutButton } from '../authentication/LogoutButton';
import styles from './CustomerHome.module.css';

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

const CATEGORIES = ['Appetizer', 'Main Dish', 'Broth', 'Side Dish', 'Dessert', 'Drink', "Chef's Special"];

export const CustomerHome = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [cartCount, setCartCount] = useState<number>(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [specialRequest, setSpecialRequest] = useState<string>('');
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);

    const [selectedChoices, setSelectedChoices] = useState<Record<number, number[]>>({});

    useEffect(() => {
        apiClient('/customer/').catch((err) => console.error('Customer sync failed:', err));
    }, []);

    // Load items in active cart on refresh to keep badge accurate
    useEffect(() => {
        apiClient<any[]>('/customer/cart')
            .then((cartItems) => {
                const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            })
            .catch((err) => console.error('Failed to pre-fetch cart size:', err));
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

    const openModal = async (item: MenuItem) => {
        setSelectedItem(item);
        setSpecialRequest('');
        setOptionGroups([]);
        setSelectedChoices({});

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

        return selectedItem.price + extrasAmount;
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
            await apiClient('/customer/cart/add', {
                method: 'POST',
                data: {
                    menuId: selectedItem.id,
                    specialRequest: specialRequest,
                    selectedChoices: selectedChoices
                }
            });

            setCartCount((prev) => prev + 1);
            setToastMessage(`Added ${selectedItem.name} to cart!`);
            setTimeout(() => setToastMessage(null), 3000);

            closeModal();
        } catch (err) {
            console.error('Failed to add to cart:', err);
            setToastMessage('Could not add item to cart.');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    return (
        <div className={styles.container}>
            {/* Navigation Header View */}
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Menu</h1>
                <div className={styles.actionsArea}>
                    <div className={styles.cartWidget}>
                        {/* Bootstrap Icon equivalent SVG for Cart */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2m7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
                        </svg>
                        <span className={styles.cartText}>Cart</span>
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>{cartCount}</span>
                        )}
                    </div>
                    <LogoutButton />
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Category selection row navigation */}
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

            {/* Menu Items Showcase Cards Grid Layout */}
            {!loading && !error && (
                <div className={styles.menuGrid}>
                    {items.map((item) => (
                        <div key={item.id} className={styles.menuCard}>
                            <div className={styles.imageWrapper}>
                                {item.menuPic ? (
                                    <img src={item.menuPic} alt={item.name} className={styles.menuImage} />
                                ) : (
                                    <div className={styles.menuImage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                        {/* Bootstrap Icon image placeholder */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style={{ marginBottom: '4px' }}>
                                            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                                        </svg>
                                        <span style={{ fontSize: '12px' }}>No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.menuInfo}>
                                <p className={styles.menuName}>{item.name}</p>
                                <p className={styles.menuPrice}>${item.price.toFixed(2)}</p>

                                <button
                                    className={styles.addButton}
                                    onClick={() => openModal(item)}
                                >
                                    <span>+</span> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dynamic Customization Intermediary Processing Modal Overlay view block */}
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
                                <span className={styles.modalPrice}>${selectedItem.price.toFixed(2)}</span>
                            </div>

                            {/* Dynamic Real DB Option Selections Loop Rendering Block */}
                            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
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
                                                                    +${choice.extraPrice.toFixed(2)}
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

                            {/* Customer special comments field text entry */}
                            <div className={styles.modalSectionTitle}>Special Instructions</div>
                            <textarea
                                className={styles.noteInput}
                                placeholder="E.g., Allergen alerts, swap components, extra spicy..."
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                            />

                            <div className={styles.modalActions}>
                                <button className={styles.cancelButton} onClick={closeModal}>Cancel</button>
                                <button className={styles.confirmButton} onClick={handleConfirmAddToCart}>
                                    Confirm - ${calculateTotalPrice().toFixed(2)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sliding Feedback Toast Notification window popup banner */}
            {toastMessage && (
                <div className={styles.toast}>
                    {/* Bootstrap check-circle equivalent SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'text-bottom' }}>
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    {toastMessage}
                </div>
            )}
        </div>
    );
};