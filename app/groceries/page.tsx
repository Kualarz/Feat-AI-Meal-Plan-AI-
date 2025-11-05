'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { AggregatedIngredient, GroceryCategory, groupByCategory, toCsv } from '@/lib/groceries';

interface Plan {
  id: string;
  weekStart: string;
  weekEnd: string;
}

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

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      fetchIngredients(selectedPlanId);
    } else {
      setIngredients([]);
    }
  }, [selectedPlanId]);

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Shopping List</h2>
            <Link href="/planner">
              <Button variant="outline">← Back to Planner</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
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

        {/* Export Buttons */}
        {ingredients.length > 0 && (
          <div className="flex gap-3 mb-8">
            <Button onClick={handleExportCsv} variant="outline" className="flex-1">
              📥 Export to CSV
            </Button>
            <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1">
              {copySuccess ? '✓ Copied!' : '📋 Copy List'}
            </Button>
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
        {!loading && ingredients.length > 0 && (
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

            {/* Summary Card */}
            <Card className="mt-8 bg-muted/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-3xl font-bold text-foreground">{ingredients.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Checked Off</p>
                  <p className="text-3xl font-bold text-foreground">{checkedItems.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-3xl font-bold text-foreground">
                    {ingredients.length > 0
                      ? Math.round((checkedItems.size / ingredients.length) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
