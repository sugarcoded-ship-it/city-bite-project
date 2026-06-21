import { useEffect, useState, useCallback } from 'react';
import { apiClient, api } from '../api/client';
import { LogoutButton } from '../authentication/LogoutButton';
import styles from './StaffStock.module.css';

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
  const [items, setItems] = useState<StockResponse[]>([]);
  const [categories, setCategories] = useState<StockCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null); // null = All

  const [pendingChanges, setPendingChanges] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockResponse | null>(null);

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

  const handleAmountChange = (itemId: number, newAmount: number) => {
    if (newAmount < 0) return;
    setPendingChanges((prev) => ({ ...prev, [itemId]: newAmount }));
  };

  const handleSaveChanges = async () => {
    const adjustments = Object.keys(pendingChanges).map((id) => ({
      itemId: parseInt(id),
      newAmount: pendingChanges[parseInt(id)],
    }));
    if (adjustments.length === 0) return;

    setIsSaving(true);
    try {
      await api.patch('/staff/stocks/adjust', { adjustments });
      setToastMessage('Inventory successfully updated!');
      setPendingChanges({});
      await fetchStockData();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update stock:', err);
      alert('An error occurred while saving inventory changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const categoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  if (loading)
    return <div className={styles.centeredContainer}><div className={styles.loadingText}>Loading inventory...</div></div>;
  if (error)
    return <div className={styles.centeredContainer}><div className={styles.errorText}>{error}</div></div>;

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  const visibleItems = items
    .filter((item) => activeCategory === null || item.categoryId === activeCategory)
    .filter((item) => item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Stock Management</h1>
          <p className={styles.subtitle}>Monitor and adjust real-time inventory levels</p>
        </div>
        <div className={styles.actionsArea}>
          <button
            className={`${styles.saveButton} ${hasPendingChanges ? styles.saveButtonActive : ''}`}
            onClick={handleSaveChanges}
            disabled={!hasPendingChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
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
            const displayAmount =
              pendingChanges[item.id] !== undefined ? pendingChanges[item.id] : item.amount;
            const isOut = displayAmount <= 0;
            const edited = pendingChanges[item.id] !== undefined;

            return (
              <div key={item.id} className={`${styles.stockCard} ${edited ? styles.cardEdited : ''}`}>
                <div className={styles.cardTop}>
                  <div>
                    <h3 className={styles.cardTitle}>{item.name}</h3>
                    <span className={styles.cardCategory}>{categoryName(item.categoryId)}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${isOut ? styles.badgeOut : styles.badgeOk}`}>
                    {isOut ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>

                <div className={styles.cardAmount}>
                  <span className={styles.amountValue}>{displayAmount}</span>
                  <span className={styles.amountUnit}>{item.measureUnit}</span>
                </div>

                <div className={styles.cardControls}>
                  <div className={styles.inlineCounter}>
                    <button className={styles.counterBtn} onClick={() => handleAmountChange(item.id, Math.max(0, displayAmount - 1))}>−</button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className={styles.counterInput}
                      value={displayAmount}
                      onChange={(e) => handleAmountChange(item.id, parseFloat(e.target.value) || 0)}
                    />
                    <button className={styles.counterBtn} onClick={() => handleAmountChange(item.id, displayAmount + 1)}>+</button>
                  </div>
                  <button className={styles.detailsBtn} onClick={() => setSelectedItem(item)}>Details</button>
                </div>
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

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
};