import { useEffect, useState, useCallback } from 'react';
import { apiClient, api } from '../api/client';
import { LogoutButton } from '../authentication/LogoutButton';
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

  const navigate = useNavigate();
  const goToDashboard = () => navigate('/');

  const [items, setItems] = useState<StockResponse[]>([]);
  const [categories, setCategories] = useState<StockCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null); // null = All

  // addAmounts holds the quantity to ADD to each item (a delta), not the new total.
  const [addAmounts, setAddAmounts] = useState<Record<number, number>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
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

  const handleAddChange = (itemId: number, addAmount: number) => {
    setAddAmounts((prev) => ({ ...prev, [itemId]: addAmount }));
  };

  // Confirm a single card's change: add the entered amount to the current stock.
  const handleConfirm = async (itemId: number, currentAmount: number) => {
    const addAmount = addAmounts[itemId];
    if (!addAmount) return; // nothing to add (undefined or 0)

    const newAmount = Math.max(0, currentAmount + addAmount);

    setSavingId(itemId);
    try {
      await api.patch('/staff/stocks/adjust', {
        adjustments: [{ itemId, newAmount }],
      });
      // Commit the new total locally and clear this item's add amount.
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

  // Cancel a single card's change: discard the entered add amount.
  const handleCancel = (itemId: number) => {
    setAddAmounts((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
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
            const isOut = currentAmount <= 0;
            const edited = addAmount !== 0;
            const isSavingThis = savingId === item.id;

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

      {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
    </div>
  );
};
