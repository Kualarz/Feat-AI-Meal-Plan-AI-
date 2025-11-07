'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { AggregatedIngredient, GroceryCategory, groupByCategory, toCsv } from '@/lib/groceries';

interface Plan {
  id: string;
  weekStart: string;
  weekEnd: string;
}

interface CustomShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  price?: number;
}

const COMMON_ITEMS = [
  'Apples', 'Bananas', 'Milk', 'Eggs', 'Bread', 'Chicken', 'Beef', 'Pasta', 'Rice', 'Tomatoes',
  'Onions', 'Garlic', 'Olive Oil', 'Salt', 'Pepper', 'Sugar', 'Flour', 'Butter', 'Cheese', 'Yogurt',
  'Lettuce', 'Carrots', 'Potatoes', 'Broccoli', 'Bell Peppers', 'Mushrooms', 'Lemon', 'Lime',
  'Soy Sauce', 'Fish Sauce', 'Vinegar', 'Honey', 'Ginger', 'Chili', 'Cinnamon', 'Turmeric',
  'Basil', 'Thyme', 'Oregano', 'Cumin', 'Paprika', 'Black Beans', 'Chickpeas', 'Lentils',
];

const CATEGORY_EMOJI: Record<GroceryCategory, string> = {
  Produce: '🥬',
  Meat: '🥩',
  'Dry Goods': '🌾',
  Sauces: '🍶',
  Dairy: '🥛',
  Frozen: '❄️',
  Other: '📦',
};

export default function GroceriesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [ingredients, setIngredients] = useState<AggregatedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState('');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);
  const [customItems, setCustomItems] = useState<CustomShoppingItem[]>([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState('1');
  const [customItemUnit, setCustomItemUnit] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<GroceryCategory>('Other');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchPlans();
    loadCustomItems();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      fetchIngredients(selectedPlanId);
    } else {
      setIngredients([]);
    }
  }, [selectedPlanId]);

  const loadCustomItems = () => {
    try {
      const stored = localStorage.getItem('customShoppingItems');
      if (stored) {
        setCustomItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load custom items:', err);
    }
  };

  const saveCustomItems = (items: CustomShoppingItem[]) => {
    try {
      localStorage.setItem('customShoppingItems', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save custom items:', err);
    }
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const newItem: CustomShoppingItem = {
      id: `custom-${Date.now()}`,
      name: customItemName.trim(),
      quantity: parseFloat(customItemQuantity) || 1,
      unit: customItemUnit.trim() || 'unit',
      category: customItemCategory,
      price: customItemPrice ? parseFloat(customItemPrice) : undefined,
    };

    const updated = [...customItems, newItem];
    setCustomItems(updated);
    saveCustomItems(updated);

    setCustomItemName('');
    setCustomItemQuantity('1');
    setCustomItemUnit('');
    setCustomItemCategory('Other');
    setCustomItemPrice('');
  };

  const removeCustomItem = (id: string) => {
    const updated = customItems.filter((item) => item.id !== id);
    setCustomItems(updated);
    saveCustomItems(updated);
  };

  const startEditItem = (item: CustomShoppingItem) => {
    setEditingItemId(item.id);
    setCustomItemName(item.name);
    setCustomItemQuantity(item.quantity.toString());
    setCustomItemUnit(item.unit);
    setCustomItemCategory(item.category);
    setCustomItemPrice(item.price?.toString() || '');
  };

  const saveEditedItem = () => {
    if (!customItemName.trim() || !editingItemId) return;

    const updated = customItems.map((item) =>
      item.id === editingItemId
        ? {
            ...item,
            name: customItemName.trim(),
            quantity: parseFloat(customItemQuantity) || 1,
            unit: customItemUnit.trim() || 'unit',
            category: customItemCategory,
            price: customItemPrice ? parseFloat(customItemPrice) : undefined,
          }
        : item
    );

    setCustomItems(updated);
    saveCustomItems(updated);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setCustomItemName('');
    setCustomItemQuantity('1');
    setCustomItemUnit('');
    setCustomItemCategory('Other');
    setCustomItemPrice('');
  };

  const handleItemNameChange = (value: string) => {
    setCustomItemName(value);
    if (value.length > 0) {
      const filtered = COMMON_ITEMS.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (item: string) => {
    setCustomItemName(item);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearAllChecked = () => {
    setCheckedItems(new Set());
  };

  const deleteAllCustomItems = () => {
    if (confirm('Are you sure you want to delete all custom items?')) {
      setCustomItems([]);
      saveCustomItems([]);
      setCheckedItems(new Set());
    }
  };

  const calculateTotalPrice = () => {
    return customItems.reduce((total, item) => total + (item.price || 0), 0);
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch('/api/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await response.json();
      setPlans(data.plans || []);
      if (data.plans && data.plans.length > 0) {
        setSelectedPlanId(data.plans[0].id);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchIngredients = async (planId: string) => {
    setLoading(true);
    setError('');
    setCheckedItems(new Set());

    try {
      const response = await fetch(`/api/groceries?planId=${planId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch groceries');
      }
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groceries');
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecked = (key: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  const handleExportCsv = () => {
    const csv = toCsv(ingredients);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `grocery-list-${selectedPlanId}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = ingredients
        .map((ing) => `${ing.name} - ${ing.totalQty} ${ing.unit}`)
        .join('\n');

      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const grouped = groupByCategory(ingredients);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl font-bold text-foreground mb-8">Shopping List</h2>
        {/* Error State */}
        {error && !loadingPlans && (
          <Card className="mb-8 bg-red-50 dark:bg-red-950 border-red-500/30">
            <div className="flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Groceries</h3>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchPlans}
                  className="mt-3 text-sm"
                >
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Plan Selector Card */}
        <Card className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Meal Plan
              </label>
              {loadingPlans ? (
                <div className="p-3 bg-muted rounded text-muted-foreground text-sm">
                  Loading plans...
                </div>
              ) : plans.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
                    No meal plans found yet.
                  </p>
                  <Link href="/planner">
                    <Button variant="outline" className="text-sm">
                      Create Your First Plan
                    </Button>
                  </Link>
                </div>
              ) : (
                <Select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  options={plans.map((plan) => ({
                    value: plan.id,
                    label: `${new Date(plan.weekStart).toLocaleDateString()} - ${new Date(plan.weekEnd).toLocaleDateString()}`,
                  }))}
                />
              )}
            </div>

            {selectedPlan && (
              <div className="p-3 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Plan Period</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(selectedPlan.weekStart).toLocaleDateString()} to{' '}
                  {new Date(selectedPlan.weekEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Add/Edit Custom Item Section */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {editingItemId ? 'Edit Item' : 'Add Custom Items'}
          </h3>
          <form onSubmit={editingItemId ? (e) => { e.preventDefault(); saveEditedItem(); } : addCustomItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Item Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Salt, Spices, Tools"
                  value={customItemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-muted border border-border rounded-lg shadow-lg z-10">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-primary/10 text-sm text-foreground first:rounded-t-lg last:rounded-b-lg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Qty
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={customItemQuantity}
                    onChange={(e) => setCustomItemQuantity(e.target.value)}
                    step="0.5"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit
                  </label>
                  <Input
                    type="text"
                    placeholder="kg, pcs, box"
                    value={customItemUnit}
                    onChange={(e) => setCustomItemUnit(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <Select
                  value={customItemCategory}
                  onChange={(e) => setCustomItemCategory(e.target.value as GroceryCategory)}
                  options={[
                    { value: 'Produce', label: '🥬 Produce' },
                    { value: 'Meat', label: '🥩 Meat' },
                    { value: 'Dry Goods', label: '🌾 Dry Goods' },
                    { value: 'Sauces', label: '🍶 Sauces' },
                    { value: 'Dairy', label: '🥛 Dairy' },
                    { value: 'Frozen', label: '❄️ Frozen' },
                    { value: 'Other', label: '📦 Other' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingItemId ? '💾 Save Changes' : '➕ Add Item'}
              </Button>
              {editingItemId && (
                <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Action Buttons */}
        {(ingredients.length > 0 || customItems.length > 0) && (
          <div className="space-y-3 mb-8">
            {/* Export and Share Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 min-w-max">
                📥 Export to CSV
              </Button>
              <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1 min-w-max">
                {copySuccess ? '✓ Copied!' : '📋 Copy List'}
              </Button>
              <Button
                onClick={() => {
                  const text = customItems
                    .map((item) => `${item.name} - ${item.quantity} ${item.unit}${item.price ? ` ($${item.price.toFixed(2)})` : ''}`)
                    .join('\n');
                  navigator.clipboard.writeText(text);
                  alert('Shopping list copied to clipboard!');
                }}
                variant="outline"
                className="flex-1 min-w-max"
              >
                📤 Share
              </Button>
            </div>

            {/* Bulk Action Buttons */}
            {(checkedItems.size > 0 || customItems.length > 0) && (
              <div className="flex gap-2 flex-wrap">
                {checkedItems.size > 0 && (
                  <Button onClick={clearAllChecked} variant="outline" className="flex-1 min-w-max">
                    ↺ Clear Checked ({checkedItems.size})
                  </Button>
                )}
                {customItems.length > 0 && (
                  <Button onClick={deleteAllCustomItems} variant="outline" className="flex-1 min-w-max text-destructive hover:bg-destructive/10">
                    🗑️ Delete All Custom
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && selectedPlanId && (
          <Card>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading ingredients...</p>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State - No Recipes in Plan */}
        {!loading && ingredients.length === 0 && selectedPlanId && !error && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Recipes Yet</h3>
              <p className="text-muted-foreground mb-6">
                This meal plan has no recipes. Add some recipes to see your shopping list.
              </p>
              <Link href="/recipes">
                <Button>Browse Recipes</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Empty State - No Plan Selected */}
        {!loading && selectedPlanId === '' && !error && plans.length > 0 && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a Plan</h3>
              <p className="text-muted-foreground">
                Choose a meal plan above to view its shopping list.
              </p>
            </div>
          </Card>
        )}

        {/* Grouped Ingredients Display */}
        {!loading && (ingredients.length > 0 || customItems.length > 0) && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[category as GroceryCategory]}</span>
                    <span>{category}</span>
                    <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                  </h3>
                  <Card>
                    <div className="space-y-2">
                      {items.map((ingredient) => {
                        const key = `${ingredient.name}-${ingredient.unit}`;
                        const isChecked = checkedItems.has(key);

                        return (
                          <div
                            key={key}
                            className={`flex items-start gap-3 p-3 rounded transition-colors ${
                              isChecked ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/30'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChecked(key)}
                              className="w-5 h-5 rounded border-border mt-0.5 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <p
                                  className={`font-medium ${
                                    isChecked ? 'line-through text-muted-foreground' : 'text-foreground'
                                  }`}
                                >
                                  {ingredient.name}
                                </p>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {ingredient.totalQty} {ingredient.unit}
                                </span>
                              </div>

                              {ingredient.items.length > 1 && (
                                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                  {ingredient.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <span className="inline-block w-1 h-1 bg-muted-foreground rounded-full"></span>
                                      <span>
                                        {item.recipe}: {item.qty} {item.unit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              );
            })}

            {/* Custom Items Grouped by Category */}
            {customItems.length > 0 && (
              <>
                {(['Produce', 'Meat', 'Dry Goods', 'Sauces', 'Dairy', 'Frozen', 'Other'] as GroceryCategory[]).map(
                  (category) => {
                    const customInCategory = customItems.filter(
                      (item) => item.category === category
                    );
                    if (customInCategory.length === 0) return null;

                    // Check if this category already has plan ingredients
                    const hasPlanItems = Object.keys(grouped).includes(category);

                    return (
                      <div key={`custom-${category}`}>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <span>{CATEGORY_EMOJI[category as GroceryCategory]}</span>
                          <span>{category}</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            ({hasPlanItems ? `${(grouped[category] || []).length} + ` : ''}{customInCategory.length} custom)
                          </span>
                        </h3>
                        <Card>
                          <div className="space-y-2">
                            {customInCategory.map((item) => {
                              const key = `custom-${item.id}`;
                              const isChecked = checkedItems.has(key);

                              return (
                                <div
                                  key={item.id}
                                  className={`flex items-start gap-3 p-3 rounded transition-colors ${
                                    isChecked ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/30'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleChecked(key)}
                                    className="w-5 h-5 rounded border-border mt-0.5 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <p
                                        className={`font-medium ${
                                          isChecked ? 'line-through text-muted-foreground' : 'text-foreground'
                                        }`}
                                      >
                                        {item.name}
                                      </p>
                                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        {item.quantity} {item.unit}
                                      </span>
                                      {item.price && (
                                        <span className="text-sm font-medium text-primary">
                                          ${item.price.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="outline"
                                      onClick={() => startEditItem(item)}
                                      className="px-3 text-sm"
                                      title="Edit item"
                                    >
                                      ✎
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => removeCustomItem(item.id)}
                                      className="px-3 text-sm text-destructive hover:bg-destructive/10"
                                      title="Delete item"
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </div>
                    );
                  }
                )}
              </>
            )}

            {/* Summary Card */}
            <Card className="mt-8 bg-muted/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{ingredients.length + customItems.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Checked Off</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{checkedItems.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {ingredients.length + customItems.length > 0
                      ? Math.round(
                          (checkedItems.size / (ingredients.length + customItems.length)) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                {calculateTotalPrice() > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Cost</p>
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      ${calculateTotalPrice().toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
