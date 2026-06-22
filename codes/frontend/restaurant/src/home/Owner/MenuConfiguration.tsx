import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Trash2, X, Search, UtensilsCrossed, EyeClosed, Check, AlertTriangle, Filter } from 'lucide-react';
import { Dialog } from '../../ui/Dialog';
import { OwnerTopNav } from './OwnerTopNav';
import { apiClient } from '../../api/client.ts';
import styles from './MenuConfiguration.module.css';

export const MENU_CATEGORIES = [
    'Appetizer',
    'Main Dish',
    'Broth',
    'Side Dish',
    'Dessert',
    'Drink',
    "Chef's Special",
];

const UNIT_LABELS: Record<string, string> = {
    GRAM: 'g',
    KILOGRAM: 'kg',
    MILLIGRAM: 'mg',
    MILLILITER: 'ml',
    LITER: 'L',
    TEASPOON: 'tsp',
    TABLESPOON: 'tbsp',
    PIECE: 'pc',
    SLICE: 'slice',
    BUNCH: 'bunch',
    EACH: 'each',
};

export interface Stock {
    id: number;
    name: string;
    category: string;
    amount: number;
    measureUnit: string;
}

export interface MenuRecipeLine {
    stockId: number;
    stockName: string;
    amount: number;
    measureUnit: string;
}

export interface MenuItem {
    id?: number;
    name: string;
    price: number;
    category: string;
    description: string;
    menuPic: string;
    status: string;
    recipe: MenuRecipeLine[];
}

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Active',
    OUT_OF_ORDER: 'Out of Stock',
    DEACTIVATED: 'Deactivated',
};

const STATUS_FILTER_OPTIONS = ['All', 'ACTIVE', 'OUT_OF_ORDER', 'DEACTIVATED'];

interface RecipeFormLine {
    stockId: string;
    amount: string;
}

export function MenuConfiguration() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [insufficientItem, setInsufficientItem] = useState<MenuItem | null>(null);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    const emptyForm = { name: '', price: '', category: '', description: '', menuPic: '', recipe: [] as RecipeFormLine[] };
    const [form, setForm] = useState(emptyForm);

    const [stockSearch, setStockSearch] = useState('');
    const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
    const stockDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isStockDropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (stockDropdownRef.current && !stockDropdownRef.current.contains(e.target as Node)) {
                setIsStockDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStockDropdownOpen]);

    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
    const statusFilterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isStatusFilterOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) {
                setIsStatusFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isStatusFilterOpen]);

    const fetchMenu = () => {
        setIsLoading(true);
        apiClient<MenuItem[]>('/owner/menu')
            .then(setMenuItems)
            .catch(err => console.error("Failed to load menu", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchMenu();
        apiClient<Stock[]>('/owner/stock')
            .then(setStocks)
            .catch(err => console.error("Failed to load stock", err));
    }, []);

    const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))];

    const displayed = useMemo(() => {
        const query = search.toLowerCase();
        return menuItems.filter((m) => {
            const matchesCategory = filterCat === 'All' || m.category === filterCat;
            const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
            const matchesSearch =
                m.name.toLowerCase().includes(query) ||
                m.recipe.some((r) => r.stockName.toLowerCase().includes(query));
            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [menuItems, filterCat, filterStatus, search]);

    const resetForm = () => setForm(emptyForm);
    const closeForm = () => {
        setIsAdding(false);
        setEditingMenu(null);
        resetForm();
        setIsStockDropdownOpen(false);
        setStockSearch('');
    };

    const handleEdit = (item: MenuItem) => {
        setEditingMenu(item);
        setForm({
            name: item.name,
            price: String(item.price),
            category: item.category,
            description: item.description || '',
            menuPic: item.menuPic,
            recipe: item.recipe?.length
                ? item.recipe.map((r) => ({ stockId: String(r.stockId), amount: String(r.amount) }))
                : []
        });
    };

    const toggleStockSelection = (stockId: number) => {
        const idStr = String(stockId);
        const isSelected = form.recipe.some((r) => r.stockId === idStr);
        setForm({
            ...form,
            recipe: isSelected
                ? form.recipe.filter((r) => r.stockId !== idStr)
                : [...form.recipe, { stockId: idStr, amount: '' }]
        });
    };

    const removeRecipeLine = (stockId: string) => {
        setForm({ ...form, recipe: form.recipe.filter((r) => r.stockId !== stockId) });
    };

    const updateRecipeAmount = (stockId: string, amount: string) => {
        setForm({ ...form, recipe: form.recipe.map((r) => (r.stockId === stockId ? { ...r, amount } : r)) });
    };

    const stockLevel = (amount: number): 'High' | 'Mid' | 'Low' => {
        if (amount >= 10) return 'High';
        if (amount >= 5) return 'Mid';
        return 'Low';
    };

    const filteredStocks = stocks.filter((s) => s.name.toLowerCase().includes(stockSearch.toLowerCase()));

    const getInsufficientIngredients = (item: MenuItem) => {
        return item.recipe
            .map((r) => ({ ...r, available: stocks.find((s) => s.id === r.stockId)?.amount ?? 0 }))
            .filter((r) => r.available < r.amount);
    };

    const handleSubmit = async () => {
        const recipe = form.recipe
            .filter((r) => r.stockId !== '' && r.amount.trim())
            .map((r) => ({ stockId: Number(r.stockId), amount: parseFloat(r.amount) }));

        const payload = {
            id: editingMenu?.id,
            name: form.name,
            price: parseFloat(form.price),
            category: form.category,
            description: form.description,
            menuPic: form.menuPic || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            recipe,
        };

        try {
            if (editingMenu) {
                await apiClient(`/owner/menu/${editingMenu.id}`, { method: 'PUT', data: payload });
            } else {
                await apiClient('/owner/menu', { method: 'POST', data: payload });
            }
            fetchMenu();
            closeForm();
        } catch (error) {
            console.error("Failed to save item", error);
            alert("Failed to save menu item.");
        }
    };

    const toggleStatus = async (item: MenuItem) => {
        const nextStatus = item.status === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED';
        try {
            await apiClient(`/owner/menu/${item.id}/status`, { method: 'PATCH', data: { status: nextStatus } });
            fetchMenu();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update menu status.");
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await apiClient(`/owner/menu/${deletingId}`, { method: 'DELETE' });
            setMenuItems((prev) => prev.filter((m) => m.id !== deletingId));
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete item.");
        }
    };

    const hasInvalidRecipeAmount = form.recipe.some((r) => r.amount.trim() !== '' && Number(r.amount) <= 0);
    const isValid = form.name && form.category && Number(form.price) > 0 && !hasInvalidRecipeAmount;

    if (isLoading) return <div style={{ minHeight: '100vh', paddingTop: '100px', textAlign: 'center', fontWeight: 'bold' }}>Loading Menu...</div>;

    return (
        <div className={styles.pageContainer}>
            <OwnerTopNav />

            {/* Page header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <p className={styles.managementLabel}>Management</p>
                        <h1 className={styles.pageTitle}>Menu Configuration</h1>
                    </div>
                    <button onClick={() => setIsAdding(true)} className={styles.addBtn}>
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Add Menu</span>
                    </button>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* Search + filter */}
                <div className={styles.searchFilterRow}>
                    <div className={styles.searchWrapper}>
                        <Search size={15} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search menu or ingredient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.statusFilterWrapper} ref={statusFilterRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusFilterOpen((open) => !open)}
                            className={`${styles.statusFilterTrigger} ${filterStatus !== 'All' ? styles.statusFilterTriggerActive : ''}`}
                        >
                            <Filter size={13} />
                            <span>{filterStatus === 'All' ? 'Status' : STATUS_LABELS[filterStatus]}</span>
                            {filterStatus !== 'All' && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); setFilterStatus('All'); }}
                                    className={styles.statusFilterClear}
                                >
                                    <X size={11} />
                                </span>
                            )}
                        </button>
                        {isStatusFilterOpen && (
                            <div className={styles.statusFilterPanel}>
                                {STATUS_FILTER_OPTIONS.map((s) => (
                                    <div
                                        key={s}
                                        onClick={() => { setFilterStatus(s); setIsStatusFilterOpen(false); }}
                                        className={`${styles.statusFilterOption} ${filterStatus === s ? styles.statusFilterOptionActive : ''}`}
                                    >
                                        {s === 'All' ? 'All' : STATUS_LABELS[s]}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.filterContainer}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCat(cat)}
                                className={`${styles.filterBtn} ${filterCat === cat ? styles.filterBtnActive : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <p className={styles.itemCount}>{displayed.length} item{displayed.length !== 1 ? 's' : ''}</p>

                {/* Menu grid */}
                {displayed.length === 0 ? (
                    <div className={styles.emptyState}>
                        <UtensilsCrossed size={48} className={styles.emptyIcon} />
                        <p className={styles.emptyText}>No menu items found.</p>
                    </div>
                ) : (
                    <div className={styles.menuGrid}>
                        {displayed.map((item) => (
                            <div key={item.id} className={styles.card}>
                                {/* Image */}
                                <div className={styles.cardImageWrapper}>
                                    <img src={item.menuPic} alt={item.name} className={styles.cardImage} />
                                    <div className={styles.cardGradient} />
                                    <span className={styles.cardCategory}>{item.category}</span>

                                    <div className={styles.cardHoverActions}>
                                        <button
                                            onClick={() => toggleStatus(item)}
                                            className={`${styles.iconBtn} ${item.status === 'DEACTIVATED' ? styles.iconBtnActivate : styles.iconBtnDeactivate}`}
                                            title={item.status === 'DEACTIVATED' ? 'Activate' : 'Deactivate'}
                                        >
                                            <EyeClosed size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className={styles.cardInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <p className={styles.cardName} style={{ margin: 0 }}>{item.name}</p>
                                        {item.status === 'OUT_OF_ORDER' ? (
                                            <button
                                                onClick={() => setInsufficientItem(item)}
                                                className={`${styles.statusBadge} ${styles.statusOUT_OF_ORDER} ${styles.statusBadgeBtn}`}
                                                title="Click to see which ingredients are short"
                                            >
                                                {STATUS_LABELS[item.status]}
                                            </button>
                                        ) : (
                                            <span className={`${styles.statusBadge} ${styles[`status${item.status}`] || ''}`}>
                                                {STATUS_LABELS[item.status] || item.status}
                                            </span>
                                        )}
                                    </div>
                                    {item.description && <p className={styles.cardDesc}>{item.description}</p>}

                                    {item.recipe && item.recipe.length > 0 && (
                                        <div className={styles.recipeList}>
                                            {item.recipe.slice(0, 3).map((r) => (
                                                <span key={r.stockId} className={styles.recipeTag}>
                                                    {r.stockName} {r.amount}{UNIT_LABELS[r.measureUnit] || r.measureUnit}
                                                </span>
                                            ))}
                                            {item.recipe.length > 3 && <span className={styles.recipeTag}>+{item.recipe.length - 3}</span>}
                                        </div>
                                    )}

                                    <div className={styles.cardFooter}>
                                        <span className={styles.cardPrice}>฿{item.price}</span>
                                        <div className={styles.footerActions}>
                                            <button onClick={() => handleEdit(item)} className={`${styles.textBtn} ${styles.textBtnEdit}`}>
                                                Edit
                                            </button>
                                            <button onClick={() => setDeletingId(item.id!)} className={`${styles.textBtn} ${styles.textBtnDelete}`}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit modal */}
            {(isAdding || !!editingMenu) && (
                <Dialog open={isAdding || !!editingMenu} onClose={closeForm}>
                    <div className={`${styles.modalBox} ${styles.modalBoxLarge}`}>
                        <div className={styles.modalHeader}>
                            <div>
                                <p className={styles.modalTitleSub}>Menu</p>
                                <h2 className={styles.modalTitle}>{editingMenu ? 'Edit Menu' : 'Add New Menu'}</h2>
                            </div>
                            <button onClick={closeForm} className={styles.modalCloseBtn}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className={`${styles.modalBody} ${styles.modalBodyFixed}`}>
                            {[
                                { label: 'Name *', key: 'name', placeholder: 'Pad Thai' },
                                { label: 'Price (฿) *', key: 'price', placeholder: '99', type: 'number', min: 0, step: 0.01 },
                                { label: 'Image URL', key: 'menuPic', placeholder: 'https://...' },
                            ].map(({ label, key, placeholder, type, min, step }) => (
                                <div key={key} className={styles.formGroup}>
                                    <label className={styles.formLabel}>{label}</label>
                                    <input
                                        type={type || 'text'}
                                        value={(form as any)[key]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className={styles.formInput}
                                        min={min}
                                        step={step}
                                    />
                                </div>
                            ))}

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Category *</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className={styles.formInput}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Short description..."
                                    rows={2}
                                    className={`${styles.formInput} ${styles.formTextarea}`}
                                />
                            </div>

                            {/* Recipe / ingredients section */}
                            <div>
                                <label className={styles.formLabel}>Ingredients</label>

                                <div className={styles.chipsRow}>
                                    {form.recipe.length === 0 ? (
                                        <span className={styles.chipsPlaceholder}>No ingredients selected</span>
                                    ) : (
                                        form.recipe.map((line) => {
                                            const stock = stocks.find((s) => String(s.id) === line.stockId);
                                            const isInvalidAmount = line.amount.trim() !== '' && Number(line.amount) <= 0;
                                            return (
                                                <div key={line.stockId} className={styles.chip}>
                                                    <span className={styles.chipName}>{stock?.name || 'Unknown'}</span>
                                                    <input
                                                        type="number"
                                                        value={line.amount}
                                                        onChange={(e) => updateRecipeAmount(line.stockId, e.target.value)}
                                                        className={`${styles.chipAmountInput} ${isInvalidAmount ? styles.chipAmountInvalid : ''}`}
                                                        min={0}
                                                        title={isInvalidAmount ? 'Amount must be greater than 0' : undefined}
                                                    />
                                                    <span className={styles.chipUnit}>
                                                        {stock ? UNIT_LABELS[stock.measureUnit] || stock.measureUnit : ''}
                                                    </span>
                                                    <button onClick={() => removeRecipeLine(line.stockId)} className={styles.chipRemoveBtn}>
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className={styles.stockDropdownWrapper} ref={stockDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsStockDropdownOpen((open) => !open)}
                                        className={styles.stockDropdownTrigger}
                                    >
                                        + Add from stock...
                                    </button>
                                    {isStockDropdownOpen && (
                                        <div className={styles.stockDropdownPanel}>
                                            <input
                                                type="text"
                                                value={stockSearch}
                                                onChange={(e) => setStockSearch(e.target.value)}
                                                placeholder="Search stock..."
                                                className={styles.stockSearchInput}
                                                autoFocus
                                            />
                                            <div className={styles.stockDropdownList}>
                                                {filteredStocks.length === 0 ? (
                                                    <div className={styles.stockDropdownEmpty}>No matching stock items.</div>
                                                ) : (
                                                    filteredStocks.map((s) => {
                                                        const isSelected = form.recipe.some((r) => r.stockId === String(s.id));
                                                        const level = stockLevel(s.amount);
                                                        return (
                                                            <div
                                                                key={s.id}
                                                                onClick={() => toggleStockSelection(s.id)}
                                                                className={`${styles.stockDropdownRow} ${isSelected ? styles.stockDropdownRowSelected : ''}`}
                                                            >
                                                                <span className={`${styles.stockCheckbox} ${isSelected ? styles.stockCheckboxChecked : ''}`}>
                                                                    {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                                                                </span>
                                                                <span className={`${styles.stockItemName} ${isSelected ? styles.stockItemNameSelected : ''}`}>
                                                                    {s.name}
                                                                </span>
                                                                <span className={`${styles.stockLevelBadge} ${styles[`stockLevel${level}`]}`}>
                                                                    {s.amount} {UNIT_LABELS[s.measureUnit] || s.measureUnit}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.modalActions}>
                                <button onClick={closeForm} className={styles.btnCancel}>Cancel</button>
                                <button onClick={handleSubmit} disabled={!isValid} className={styles.btnSubmit}>
                                    {editingMenu ? 'Update Menu' : 'Add to Menu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}

            {/* Delete confirm modal */}
            <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}>
                <div className={`${styles.modalBox} ${styles.modalBoxSmall}`}>
                    <div className={`${styles.modalHeader} ${styles.modalHeaderRed}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={18} color="white" />
                            </div>
                            <h2 className={styles.modalTitle}>Delete Menu?</h2>
                        </div>
                    </div>
                    <div className={styles.modalBody}>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                            Remove <strong style={{ color: '#111827' }}>{menuItems.find((m) => m.id === deletingId)?.name}</strong> from the menu? This cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setDeletingId(null)} className={styles.btnCancel}>Cancel</button>
                            <button onClick={confirmDelete} className={styles.btnDeleteConfirm}>Delete</button>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Insufficient stock detail modal */}
            <Dialog open={!!insufficientItem} onClose={() => setInsufficientItem(null)}>
                <div className={`${styles.modalBox} ${styles.modalBoxSmall}`}>
                    <div className={`${styles.modalHeader} ${styles.modalHeaderAmber}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={18} color="white" />
                            </div>
                            <h2 className={styles.modalTitle}>Insufficient Stock</h2>
                        </div>
                    </div>
                    <div className={styles.modalBody}>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                            <strong style={{ color: '#111827' }}>{insufficientItem?.name}</strong> went out of stock because of these ingredients:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            {insufficientItem && getInsufficientIngredients(insufficientItem).map((r) => (
                                <div key={r.stockId} className={styles.insufficientRow}>
                                    <span className={styles.insufficientName}>{r.stockName}</span>
                                    <span className={styles.insufficientAmounts}>
                                        need {r.amount}{UNIT_LABELS[r.measureUnit] || r.measureUnit}, have {r.available}{UNIT_LABELS[r.measureUnit] || r.measureUnit}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setInsufficientItem(null)} className={styles.btnCancel}>Close</button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}