import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { apiClient } from "../lib/api-client";
import { StaffTopNav } from "../features/dashboard/components/StaffDashboard/StaffTopNav.tsx";
import {
  PackagePlus, Plus, Minus, Search,
  AlertTriangle, Package, ArrowUpDown, ChevronDown, X, Trash2
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

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

const CATEGORY_COLORS: Record<string, { light: string; dot: string }> = {
  Vegetables:    { light: 'bg-green-100  text-green-700',  dot: 'bg-green-500'  },
  Spices:        { light: 'bg-amber-100  text-amber-700',  dot: 'bg-amber-500'  },
  Carbohydrates: { light: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  Proteins:      { light: 'bg-red-100    text-red-700',    dot: 'bg-red-500'    },
  Dairy:         { light: 'bg-blue-100   text-blue-700',   dot: 'bg-blue-400'   },
};
const DEFAULT_CAT_COLOR = { light: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
const getCatColor = (catName: string) => CATEGORY_COLORS[catName] ?? DEFAULT_CAT_COLOR;

function stockLevel(amount: number): 'ok' | 'low' | 'critical' {
  if (amount <= 5) return 'critical';
  if (amount <= 15) return 'low';
  return 'ok';
}

const LEVEL_CFG = {
  ok:       { bar: 'bg-green-400', badge: '',                        label: '' },
  low:      { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'Low' },
  critical: { bar: 'bg-red-400',   badge: 'bg-red-100 text-red-600',     label: 'Critical' },
};

const MEASURE_UNITS = [
  'GRAM', 'KILOGRAM', 'MILLIGRAM', 'MILLILITER', 'LITER',
  'TEASPOON', 'TABLESPOON', 'PIECE', 'SLICE', 'BUNCH', 'EACH'
];

type SortKey = 'name-asc' | 'name-desc' | 'qty-asc' | 'qty-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name-asc',      label: 'Name A → Z'           },
  { value: 'name-desc',     label: 'Name Z → A'           },
  { value: 'qty-asc',       label: 'Quantity: Low → High' },
  { value: 'qty-desc',      label: 'Quantity: High → Low' },
];

export const StaffStock = () => {
  // ── States ─────────────────────────────────────────────────────────────────
  const [items, setItems] = useState<StockResponse[]>([]);
  const [categories, setCategories] = useState<StockCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<StockResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingQty, setEditingQty] = useState<Record<number, string>>({});

  // Form state
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    amount: 1,
    measureUnit: 'PIECE',
    description: ''
  });

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── Toast Utility ──────────────────────────────────────────────────────────
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [categoriesData, itemsData] = await Promise.all([
        apiClient<StockCategoryResponse[]>('/staff/stocks/categories'),
        apiClient<StockResponse[]>('/staff/stocks/items')
      ]);
      setCategories(categoriesData);
      setItems(itemsData);

      // Select default category for form if categories exist
      if (categoriesData.length > 0) {
        setForm(f => ({ ...f, categoryId: String(categoriesData[0].id) }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch stock system data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Close sort menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category map helper for quick ID -> Name resolution
  const categoryMap = useMemo(() => {
    return Object.fromEntries(categories.map(c => [c.id, c.name]));
  }, [categories]);

  // ── Filter & Sort Processing ───────────────────────────────────────────────
  const compareFn = useMemo(() => {
    switch (sortKey) {
      case 'name-asc':   return (a: StockResponse, b: StockResponse) => a.name.localeCompare(b.name);
      case 'name-desc':  return (a: StockResponse, b: StockResponse) => b.name.localeCompare(a.name);
      case 'qty-asc':    return (a: StockResponse, b: StockResponse) => a.amount - b.amount;
      case 'qty-desc':   return (a: StockResponse, b: StockResponse) => b.amount - a.amount;
    }
  }, [sortKey]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => {
        const itemCatName = categoryMap[item.categoryId] || 'Unknown';
        const matchesCategory = activeCategory === 'All' || itemCatName === activeCategory;
        const matchesSearch = !query || item.name.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort(compareFn);
  }, [items, activeCategory, search, compareFn, categoryMap]);

  const grouped = useMemo(() => {
    const dynamicCats = activeCategory === 'All'
      ? Array.from(new Set(filteredItems.map((s) => categoryMap[s.categoryId] || 'Unknown')))
      : [activeCategory];

    return dynamicCats
      .map((catName) => ({
        catName,
        items: filteredItems.filter((s) => (categoryMap[s.categoryId] || 'Unknown') === catName)
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredItems, activeCategory, categoryMap]);

  // Stock statistics
  const lowCount = useMemo(() => items.filter((s) => stockLevel(s.amount) === 'low').length, [items]);
  const criticalCount = useMemo(() => items.filter((s) => stockLevel(s.amount) === 'critical').length, [items]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const updateQty = async (id: number, delta: number) => {
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

    const nextAmount = Math.max(0, targetItem.amount + delta);
    const appliedDelta = nextAmount - targetItem.amount;
    if (appliedDelta === 0) return;

    try {
      setSavingId(id);
      const updated = await apiClient<StockResponse>(`/staff/stocks/${id}/adjust`, {
        method: 'PATCH',
        data: { delta: appliedDelta }
      });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      triggerToast(`Updated quantity for ${targetItem.name}`);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update stock quantity');
    } finally {
      setSavingId(null);
    }
  };

  const commitQty = async (id: number) => {
    const raw = editingQty[id];
    setEditingQty(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (raw === undefined) return;

    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

    const parsed = Math.floor(Number(raw));
    if (!Number.isFinite(parsed)) return;

    await updateQty(id, Math.max(0, parsed) - targetItem.amount);
  };

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    if (catName !== 'All') {
      setTimeout(() => sectionRefs.current[catName]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  const handleCreateItem = async () => {
    if (!form.name.trim() || !form.categoryId) return;
    try {
      setCreating(true);
      const newItem = await apiClient<StockResponse>('/staff/stocks/items', {
        method: 'POST',
        data: {
          name: form.name.trim(),
          description: form.description.trim() || null,
          amount: form.amount,
          measureUnit: form.measureUnit,
          categoryId: parseInt(form.categoryId)
        }
      });
      setItems(prev => [...prev, newItem]);
      triggerToast(`Added ${form.name} successfully`);
      setForm({
        name: '',
        categoryId: categories[0]?.id ? String(categories[0].id) : '',
        amount: 1,
        measureUnit: 'PIECE',
        description: ''
      });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to add material item');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      setDeleting(true);
      await apiClient(`/staff/stocks/items/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      setConfirmDeleteItem(null);
      triggerToast('Item deleted!');
    } catch (err) {
      console.error('Failed to delete item:', err);
      triggerToast('Failed to delete item.');
    } finally {
      setDeleting(false);
    }
  };

  // Keep active category pill scrolled into view
  useEffect(() => {
    const bar = categoryBarRef.current;
    if (!bar) return;
    const btn = bar.querySelector(`[data-cat="${activeCategory}"]`) as HTMLElement | null;
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeCategory]);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center p-6">
        <Package className="w-12 h-12 text-blue-500 animate-pulse mb-3" />
        <p className="text-gray-600 font-medium italic">Loading stock metrics and classifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Shared Staff Nav ── */}
      <StaffTopNav />

      {/* ── Real-Time Stat Strip ── */}
      <div className="bg-[#0B1F4D] pt-20 pb-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-white font-extrabold text-lg leading-tight mt-1">Stock Management</p>
          </div>
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1.5 bg-[#2D7FF9] hover:bg-[#1a6de0] text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-md flex-shrink-0">
            <PackagePlus size={16} />
            <span className="hidden sm:block">Add Material</span>
          </button>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3">
          <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3">
            <p className="text-blue-300 text-xs font-semibold">Total Items</p>
            <p className="text-white text-2xl font-extrabold">{items.length}</p>
          </div>
          <div className={`rounded-2xl px-4 py-3 border transition-colors ${lowCount > 0 ? 'bg-amber-500/20 border-amber-400/30' : 'bg-white/10 border-white/15'}`}>
            <p className={`text-xs font-semibold ${lowCount > 0 ? 'text-amber-300' : 'text-blue-300'}`}>Low Stock</p>
            <p className="text-white text-2xl font-extrabold">{lowCount}</p>
          </div>
          <div className={`rounded-2xl px-4 py-3 border transition-colors ${criticalCount > 0 ? 'bg-red-500/20 border-red-400/30' : 'bg-white/10 border-white/15'}`}>
            <p className={`text-xs font-semibold ${criticalCount > 0 ? 'text-red-300' : 'text-blue-300'}`}>Need to restock</p>
            <p className="text-white text-2xl font-extrabold">{criticalCount}</p>
          </div>
        </div>
      </div>

      {/* ── Sticky Filter / Search Bar ── */}
      <div className="sticky top-16 z-40 bg-[#f0f2f7] border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 pt-3 pb-2 space-y-2">

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search material stock..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 transition-all"
              />
            </div>

            <div ref={sortMenuRef} className="relative flex-shrink-0">
              <button
                onClick={() => setShowSortMenu((o) => !o)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap ${
                  showSortMenu ? 'bg-[#0B1F4D] text-white border-[#0B1F4D]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B1F4D]/40'
                }`}
              >
                <ArrowUpDown size={14} />
                <span className="hidden sm:block max-w-[140px] truncate">
                  {SORT_OPTIONS.find((o) => o.value === sortKey)?.label}
                </span>
                <ChevronDown size={13} className={`transition-transform flex-shrink-0 ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden min-w-[210px]">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by</p>
                  </div>
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortKey === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setSortKey(opt.value); setShowSortMenu(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#f0f2f7] ${
                          active ? 'bg-[#f0f2f7] text-[#0B1F4D] font-bold' : 'text-gray-600'
                        }`}
                      >
                        {opt.label}
                        {active && <span className="w-2 h-2 rounded-full bg-[#2D7FF9] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Category Horizon Strip */}
          <div ref={categoryBarRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', ...categories.map(c => c.name)].map((catName) => {
              const active = activeCategory === catName;
              const belongsToCat = items.filter(s => catName === 'All' || (categoryMap[s.categoryId] || 'Unknown') === catName);
              const hasCritical = belongsToCat.some(s => stockLevel(s.amount) === 'critical');
              const hasLow = !hasCritical && belongsToCat.some(s => stockLevel(s.amount) === 'low');

              return (
                <button
                  key={catName}
                  data-cat={catName}
                  onClick={() => handleCategoryClick(catName)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#0B1F4D] text-white border-[#0B1F4D] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B1F4D]/40 hover:text-[#0B1F4D]'
                  }`}
                >
                  {catName}
                  {(hasCritical || hasLow) && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasCritical ? 'bg-red-400' : 'bg-amber-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Table & Data Sections ── */}
      <div className="max-w-7xl mx-auto px-5 py-6 space-y-8">

        {grouped.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <Package size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 font-medium">No stock matching criteria discovered.</p>
          </div>
        )}

        {grouped.map(({ catName, items: sectionItems }) => {
          const catColor = getCatColor(catName);
          const blockHasCritical = sectionItems.some((s) => stockLevel(s.amount) === 'critical');

          return (
            <section key={catName} ref={(el) => { sectionRefs.current[catName] = el; }}>

              {/* Category Section Title Banner */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-4 rounded-full ${catColor.dot}`} />
                <h2 className="text-[#0B1F4D] font-extrabold text-base">{catName}</h2>
                <span className="text-gray-400 text-sm">({sectionItems.length} items)</span>
                {blockHasCritical && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full ml-auto animate-pulse">
                    <AlertTriangle size={11} /> Needs Restock
                  </span>
                )}
              </div>

              {/* Data Table Container */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-[35%]">Material Item</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-[40%]">Stock</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-[25%]">Qualities</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                  {sectionItems.map((item) => {
                    const level = stockLevel(item.amount);
                    const cfg = LEVEL_CFG[level];
                    // Assume a threshold baseline mapping metric score (e.g. 50 max metric)
                    const pct = Math.min(100, (item.amount / 50) * 100);
                    const isSaving = savingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-gray-50/80 ${
                          level === 'critical' ? 'bg-red-50/30' : level === 'low' ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Item Identity and Description */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#0B1F4D] leading-snug">{item.name}</p>
                          {item.description && (
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                        </td>

                        {/* Progress Stock Level Indicator */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs font-extrabold tabular-nums ${
                                    level === 'critical' ? 'text-red-600' :
                                      level === 'low'      ? 'text-amber-700' : 'text-[#0B1F4D]'
                                  }`}>
                                    {item.amount} <span className="text-[10px] text-gray-400 font-normal">{item.measureUnit.toLowerCase()}</span>
                                  </span>
                                {cfg.label && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                                      {cfg.label}
                                    </span>
                                )}
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${cfg.bar}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Adjustment Control Block */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              disabled={item.amount === 0 || isSaving}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors disabled:opacity-30 flex-shrink-0"
                            >
                              <Minus size={13} />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={editingQty[item.id] ?? String(item.amount)}
                              disabled={isSaving}
                              onChange={(e) => setEditingQty(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onBlur={() => commitQty(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                if (e.key === 'Escape') setEditingQty(prev => { const next = { ...prev }; delete next[item.id]; return next; });
                              }}
                              className="w-12 text-center font-extrabold text-[#0B1F4D] text-sm tabular-nums bg-transparent border border-transparent rounded-md focus:border-[#2D7FF9] focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              disabled={isSaving}
                              className="w-7 h-7 rounded-lg bg-[#0B1F4D] hover:bg-[#2D7FF9] flex items-center justify-center text-white transition-colors flex-shrink-0"
                            >
                              <Plus size={13} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteItem(item)}
                              disabled={isSaving}
                              title="Delete item"
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors disabled:opacity-30 flex-shrink-0 ml-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDeleteItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !deleting && setConfirmDeleteItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h2 className="text-[#0B1F4D] text-lg font-extrabold mb-1.5">Delete this item?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                <span className="font-semibold text-gray-700">{confirmDeleteItem.name}</span> will be permanently removed from your stock. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                type="button"
                onClick={() => setConfirmDeleteItem(null)}
                disabled={deleting}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(confirmDeleteItem.id)}
                disabled={deleting}
                className="flex-1 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Stock Structural Modal Overlay ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl transition-all"
            style={{ animation: 'modalIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}
          >
            <div className="bg-[#0B1F4D] px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Inventory Matrix</p>
                <h2 className="text-white text-xl font-extrabold">Add New Material</h2>
              </div>
              <button onClick={() => setShowAdd(false)}
                      className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Material Label <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Fresh Mushrooms"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D7FF9] focus:ring-2 focus:ring-[#2D7FF9]/20 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Classification Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D7FF9] transition-all text-gray-700"
                >
                  <option value="" disabled>Select category group...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Initial Inventory</label>
                  <div className="flex items-center gap-2">
                    <button type="button"
                            onClick={() => setForm({ ...form, amount: Math.max(0, form.amount - 1) })}
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Minus size={14} />
                    </button>
                    <input
                      type="number" min={0} value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full border border-gray-200 rounded-xl py-2 text-sm text-center font-bold focus:outline-none focus:border-[#2D7FF9]"
                    />
                    <button type="button"
                            onClick={() => setForm({ ...form, amount: form.amount + 1 })}
                            className="w-9 h-9 rounded-xl bg-[#0B1F4D] hover:bg-[#2D7FF9] text-white flex items-center justify-center transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Measure Metric Unit</label>
                  <select
                    value={form.measureUnit}
                    onChange={(e) => setForm({ ...form, measureUnit: e.target.value })}
                    className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#2D7FF9] text-gray-700 font-medium"
                  >
                    {MEASURE_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Operational handling instructions or notes..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#2D7FF9] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  disabled={creating}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateItem}
                  disabled={!form.name.trim() || !form.categoryId || creating}
                  className="flex-1 py-3 bg-[#2D7FF9] hover:bg-[#1a6de0] text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {creating ? 'Saving...' : 'Add Material'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Toast Notifications ── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0B1F4D] text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 border border-white/10 animate-bounce">
          <Package size={16} className="text-blue-400" />
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};