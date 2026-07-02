import { useEffect, useState, useCallback } from 'react';
import { apiClient, api } from "../lib/api-client";
import { LogoutButton } from "../features/auth/components/LogoutButton";
import styles from './StaffStock.module.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface StockCategoryResponse {
  id: number;
  name: string;
}

interface StockResponse {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  measureUnit: string;
  categoryId: number;
}

export const StaffStock = () => {

  const MEASURE_UNITS = ['GRAM', 'KILOGRAM', 'MILLILITER', 'LITER', 'PIECE'];
  const navigate = useNavigate();
  const goToDashboard = () => navigate('/');

  const [items, setItems] = useState<StockResponse[]>([]);
  const [categories, setCategories] = useState<StockCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const [addAmounts, setAddAmounts] = useState<Record<number, number>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockResponse | null>(null);

  const emptyNewItem = {
    name: '',
    categoryId: '',
    amount: '',
    measureUnit: '',
    description: '',
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState(emptyNewItem);
  const [creating, setCreating] = useState(false);

  const fetchStockData = useCallback(async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        apiClient<StockResponse[]>('/staff/stocks/items'),
        apiClient<StockCategoryResponse[]>('/staff/stocks/categories'),
      ]);
      setItems(itemsRes);
      setCategories(categoriesRes);
      setError(null);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError('Could not retrieve stock data from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStockData();
  }, [fetchStockData]);

  const handleAddChange = (itemId: number, addAmount: number) => {
    setAddAmounts((prev) => ({ ...prev, [itemId]: addAmount }));
  };

  const handleConfirm = async (itemId: number, currentAmount: number) => {
    const addAmount = addAmounts[itemId];
    if (!addAmount) return;

    const newAmount = Math.max(0, currentAmount + addAmount);

    setSavingId(itemId);
    try {
      await api.patch('/staff/stocks/adjust', {
        adjustments: [{ itemId, newAmount }],
      });

      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, amount: newAmount } : it))
      );
      setAddAmounts((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      setToastMessage('Stock updated!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update stock:', err);
      alert('An error occurred while saving this item.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = (itemId: number) => {
    setAddAmounts((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const openAddModal = () => {
    setNewItem(emptyNewItem);
    setShowAddModal(true);
  };

  const handleCreateItem = async () => {
    if (!newItem.name.trim() || !newItem.categoryId || !newItem.measureUnit.trim()) {
      alert('Please fill in name, category and unit.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/staff/stocks/items', {
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        amount: parseFloat(newItem.amount) || 0,
        measureUnit: newItem.measureUnit.trim(),
        categoryId: parseInt(newItem.categoryId, 10),
      });
      await fetchStockData();
      setShowAddModal(false);
      setNewItem(emptyNewItem);
      setToastMessage('Item added!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to add item:', err);
      alert('An error occurred while adding the item.');
    } finally {
      setCreating(false);
    }
  };

  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  if (loading)
    return <div className={styles.centeredContainer}><div className={styles.loadingText}>Loading inventory...</div></div>;
  if (error)
    return <div className={styles.centeredContainer}><div className={styles.errorText}>{error}</div></div>;

  const visibleItems = items
    .filter((item) => activeCategory === null || item.categoryId === activeCategory)
    .filter((item) => item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <button className={styles.backButton} onClick={goToDashboard}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className={styles.title}>Stock Management</h1>
          <p className={styles.subtitle}>Monitor and adjust real-time inventory levels</p>
        </div>
        <div className={styles.actionsArea}>
          <button className={styles.addItemBtn} onClick={openAddModal}>
            + Add Item
          </button>
          <LogoutButton />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.controlsRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search inventory by item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.filterRow}>
        <button
          className={`${styles.filterButton} ${activeCategory === null ? styles.filterButtonActive : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.filterButton} ${activeCategory === c.id ? styles.filterButtonActive : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className={styles.emptyState}>No stock items match your filters.</div>
      ) : (
        <div className={styles.stockGrid}>
          {visibleItems.map((item) => {
            const currentAmount = item.amount;
            const addAmount = addAmounts[item.id] ?? 0;
            const newTotal = Math.max(0, currentAmount + addAmount);
            const edited = addAmount !== 0;
            const isSavingThis = savingId === item.id;

            return (
              <div key={item.id} className={`${styles.stockCard} ${edited ? styles.cardEdited : ''}`}>
                <div className={styles.cardTop}>
                  <div>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <span className={styles.cardCategory}>{categoryName(item.categoryId)}</span>
                  </div>
                </div>

                <div className={styles.cardAmount}>
                  <span className={styles.amountValue}>{currentAmount}</span>
                  <span className={styles.amountUnit}>{item.measureUnit}</span>
                  {edited && (
                    <span className={styles.amountProjection}>→ {newTotal} {item.measureUnit}</span>
                  )}
                </div>

                <div className={styles.cardControls}>
                  <div className={styles.inlineCounter}>
                    <button className={styles.counterBtn} onClick={() => handleAddChange(item.id, addAmount - 1)}>−</button>
                    <input
                      type="number"
                      step="0.1"
                      className={styles.counterInput}
                      placeholder="0"
                      value={addAmount === 0 ? '' : addAmount}
                      onChange={(e) => handleAddChange(item.id, parseFloat(e.target.value) || 0)}
                    />
                    <button className={styles.counterBtn} onClick={() => handleAddChange(item.id, addAmount + 1)}>+</button>
                  </div>
                  <button className={styles.detailsBtn} onClick={() => setSelectedItem(item)}>Details</button>
                </div>

                <span className={styles.addHint}>Amount to add (use − for removing)</span>

                {edited && (
                  <div className={styles.confirmRow}>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleCancel(item.id)}
                      disabled={isSavingThis}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.confirmBtn}
                      onClick={() => handleConfirm(item.id, currentAmount)}
                      disabled={isSavingThis}
                    >
                      {isSavingThis ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedItem.name}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>System ID</span>
                  <span className={styles.detailValue}>#{selectedItem.id}</span>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{categoryName(selectedItem.categoryId)}</span>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Unit</span>
                  <span className={styles.detailValue}>{selectedItem.measureUnit}</span>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Current Amount</span>
                  <span className={styles.detailValue}>{selectedItem.amount} {selectedItem.measureUnit}</span>
                </div>
                <div className={styles.detailCard} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.detailLabel}>Description</span>
                  <span className={styles.detailValue}>{selectedItem.description || 'No description provided.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => !creating && setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New Item</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
                disabled={creating}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.addForm}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Name *</label>
                  <input
                    className={styles.formControl}
                    type="text"
                    placeholder="e.g. Chicken Breast"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Category *</label>
                  <select
                    className={styles.formControl}
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Starting Amount</label>
                    <input
                      className={styles.formControl}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Unit *</label>
                    <select
                      className={styles.formControl}
                      value={newItem.measureUnit}
                      onChange={(e) => setNewItem({ ...newItem, measureUnit: e.target.value })}
                    >
                      <option value="">Select a unit…</option>
                      {MEASURE_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Description (optional)</label>
                  <textarea
                    className={styles.formControl}
                    rows={3}
                    placeholder="Notes about this item…"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowAddModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleCreateItem}
                    disabled={creating}
                  >
                    {creating ? 'Adding…' : 'Add Item'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
};
