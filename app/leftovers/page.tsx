'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { LeftoverRecipeSuggestion } from '@/lib/ai-leftovers';
import { GroceryCategory } from '@/lib/groceries';

interface LeftoverIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  expirationDate: string | null;
  addedDate: string;
  used: boolean;
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

const UNITS = ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'oz', 'lb', 'whole', 'pinch', 'clove'];

const CATEGORIES: GroceryCategory[] = ['Produce', 'Meat', 'Dry Goods', 'Sauces', 'Dairy', 'Frozen', 'Other'];

export default function LeftoversPage() {
  const [ingredientInput, setIngredientInput] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('g');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [category, setCategory] = useState<GroceryCategory>('Other');
  const [leftovers, setLeftovers] = useState<LeftoverIngredient[]>([]);
  const [suggestions, setSuggestions] = useState<LeftoverRecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currency] = useState('USD');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load leftovers from localStorage
    const stored = localStorage.getItem('leftovers');
    if (stored) {
      try {
        setLeftovers(JSON.parse(stored));
      } catch {
        console.error('Failed to parse leftovers from localStorage');
      }
    }
  }, []);

  const saveLeftoversToStorage = (items: LeftoverIngredient[]) => {
    localStorage.setItem('leftovers', JSON.stringify(items));
    setLeftovers(items);
  };

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ingredientInput.trim();

    if (!trimmed || !quantity || isNaN(Number(quantity))) {
      setError('Please fill in all fields');
      return;
    }

    const newLeftover: LeftoverIngredient = {
      id: Date.now().toString(),
      name: trimmed,
      quantity: Number(quantity),
      unit,
      category,
      expirationDate: expirationDate || null,
      addedDate: new Date().toISOString().split('T')[0],
      used: false,
    };

    const updated = [...leftovers, newLeftover];
    saveLeftoversToStorage(updated);

    setIngredientInput('');
    setQuantity('1');
    setUnit('g');
    setExpirationDate('');
    setCategory('Other');
    setError('');
  };

  const removeLeftover = (id: string) => {
    const updated = leftovers.filter((item) => item.id !== id);
    saveLeftoversToStorage(updated);
  };

  const toggleUsed = (id: string) => {
    const updated = leftovers.map((item) =>
      item.id === id ? { ...item, used: !item.used } : item
    );
    saveLeftoversToStorage(updated);
  };

  const getActiveIngredients = () => leftovers.filter((item) => !item.used);

  const isExpiringSoon = (expirationDate: string | null): boolean => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
  };

  const isExpired = (expirationDate: string | null): boolean => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  const handleGenerateRecipes = async () => {
    const activeItems = getActiveIngredients();
    if (activeItems.length === 0) {
      setError('Please add at least one leftover ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const ingredients = activeItems.map((item) => `${item.quantity} ${item.unit} ${item.name}`);
      console.log('Sending ingredients:', ingredients);

      const response = await fetch('/api/ai/leftovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          currency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('API Error Response:', data);
        throw new Error(data.error || `Failed to generate recipes (${response.status})`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const recipeSuggestions = data.recipes?.suggestions || [];
      if (recipeSuggestions.length === 0) {
        setError('No recipes could be generated. Please try again.');
        return;
      }

      setSuggestions(recipeSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Generate recipes error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = () => {
    const grouped: Partial<Record<GroceryCategory, LeftoverIngredient[]>> = {};
    leftovers.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category]!.push(item);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto w-full">
              <h2 className="text-3xl font-bold text-foreground mb-8">Leftover Optimizer</h2>

              {/* Add Leftover Form */}
              <Card className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Add Leftover Ingredients
                </h3>

                <form onSubmit={addIngredient} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ingredient Name *
                      </label>
                      <Input
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        placeholder="e.g., Chicken breast"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Quantity *
                        </label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="1"
                          min="0"
                          step="0.1"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Unit *
                        </label>
                        <Select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          options={UNITS.map((u) => ({ value: u, label: u }))}
                          disabled={loading}
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
                        value={category}
                        onChange={(e) => setCategory(e.target.value as GroceryCategory)}
                        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Expiration Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button type="submit" disabled={loading || !ingredientInput.trim()}>
                      + Add Ingredient
                    </Button>
                    {leftovers.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => saveLeftoversToStorage([])}
                        disabled={loading}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </form>
              </Card>

              {/* Current Leftovers Display */}
              {leftovers.length > 0 && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        Your Leftovers
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {getActiveIngredients().length} active items
                      </div>
                    </div>

                    {Object.entries(groupByCategory()).map(([categoryKey, items]) => {
                      if (items.length === 0) return null;
                      const category = categoryKey as GroceryCategory;

                      return (
                        <div key={category} className="mb-6">
                          <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            <span>{CATEGORY_EMOJI[category]}</span>
                            <span>{category}</span>
                            <span className="text-sm font-normal text-muted-foreground">
                              ({items.filter((i) => !i.used).length}/{items.length})
                            </span>
                          </h4>

                          <Card>
                            <div className="space-y-2">
                              {items.map((item) => {
                                const isExpiredItem = isExpired(item.expirationDate);
                                const isExpiringSoonItem = isExpiringSoon(item.expirationDate);

                                return (
                                  <div
                                    key={item.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                      item.used
                                        ? 'bg-muted/50 opacity-60 border-border'
                                        : isExpiredItem
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : isExpiringSoonItem
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-muted/20 border-border hover:border-primary/50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.used}
                                      onChange={() => toggleUsed(item.id)}
                                      className="w-5 h-5 rounded border-border cursor-pointer"
                                    />

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-baseline gap-2">
                                        <p
                                          className={`font-medium ${
                                            item.used ? 'line-through text-muted-foreground' : 'text-foreground'
                                          }`}
                                        >
                                          {item.name}
                                        </p>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                                          {item.quantity} {item.unit}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs text-muted-foreground">
                                          Added {new Date(item.addedDate).toLocaleDateString()}
                                        </span>

                                        {item.expirationDate && (
                                          <span
                                            className={`text-xs px-2 py-0.5 rounded ${
                                              isExpiredItem
                                                ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                : isExpiringSoonItem
                                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                          >
                                            {isExpiredItem
                                              ? '❌ Expired'
                                              : isExpiringSoonItem
                                              ? '⚠️ Expiring soon'
                                              : `Expires ${new Date(item.expirationDate).toLocaleDateString()}`}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <Button
                                      variant="outline"
                                      onClick={() => removeLeftover(item.id)}
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        </div>
                      );
                    })}

                    {/* Generate Recipes Section */}
                    <div className="mt-6">
                      <Button
                        onClick={handleGenerateRecipes}
                        disabled={loading || getActiveIngredients().length === 0}
                        className="w-full"
                      >
                        {loading ? 'Generating recipes...' : '✨ Generate Recipe Ideas'}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Loading State */}
              {loading && (
                <Card>
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">
                      Searching for creative recipes with your leftovers...
                    </p>
                  </div>
                </Card>
              )}

              {/* Recipe Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    Recipe Ideas Using Your Leftovers
                  </h3>

                  <div className="grid gap-6">
                    {suggestions.map((recipe, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-bold text-foreground mb-2">
                              {recipe.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {recipe.why}
                            </p>

                            <div className="flex flex-wrap gap-3 mb-4">
                              <div className="text-sm">
                                <p className="text-muted-foreground">Cuisine</p>
                                <p className="font-medium text-foreground">{recipe.cuisine}</p>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Difficulty</p>
                                <p className="font-medium text-foreground capitalize">
                                  {recipe.difficulty}
                                </p>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Time</p>
                                <p className="font-medium text-foreground">{recipe.time_mins} min</p>
                              </div>
                            </div>
                          </div>

                          {/* Ingredients Section */}
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Uses your leftovers:
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {recipe.ingredients_used.map((ing, i) => (
                                <span
                                  key={i}
                                  className="bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs"
                                >
                                  ✓ {ing}
                                </span>
                              ))}
                            </div>

                            {recipe.additional_items_needed.length > 0 && (
                              <>
                                <p className="text-sm font-medium text-foreground mb-2">
                                  Need to buy:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {recipe.additional_items_needed.map((item, i) => (
                                    <span
                                      key={i}
                                      className="bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Steps */}
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Steps:</p>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                              {recipe.steps}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="outline" className="flex-1">
                              Save Recipe
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {suggestions.length === 0 && leftovers.length === 0 && (
                <Card className="bg-muted/50">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">How it works</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>List the ingredients you have leftover in your kitchen</li>
                      <li>Our AI generates creative Southeast Asian recipes using those ingredients</li>
                      <li>See which recipes minimize additional purchases</li>
                      <li>Mark ingredients as used when you cook with them</li>
                    </ol>
                  </div>
                </Card>
              )}

              {/* No Suggestions State */}
              {!loading && suggestions.length === 0 && leftovers.length > 0 && !showSuggestions && (
                <Card className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to cook?</h3>
                  <p className="text-muted-foreground">
                    Click "Generate Recipe Ideas" above to find recipes using your leftovers.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
