'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  notes?: string;
}

interface GroceryItem {
  name: string;
  totalQty: number;
  unit: string;
  section: string;
}

export default function GroceriesPage() {
  const [groceries, setGroceries] = useState<{ [key: string]: GroceryItem[] }>(
    {}
  );
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroceries();
  }, []);

  const loadGroceries = async () => {
    try {
      const response = await fetch('/api/plans/latest');
      const data = await response.json();

      if (!data.plan) {
        setLoading(false);
        return;
      }

      // Aggregate all ingredients from all meals
      const ingredientMap: {
        [key: string]: { qty: number; unit: string; section: string };
      } = {};

      data.plan.meals.forEach((meal: any) => {
        if (!meal.recipe) return;

        const ingredients: Ingredient[] = JSON.parse(
          meal.recipe.ingredientsJson
        );

        ingredients.forEach((ing) => {
          const key = ing.name.toLowerCase();
          const section = categorizeIngredient(ing.name);

          if (!ingredientMap[key]) {
            ingredientMap[key] = {
              qty: parseFloat(ing.qty) || 0,
              unit: ing.unit,
              section,
            };
          } else {
            // Simple aggregation (assumes same units)
            ingredientMap[key].qty += parseFloat(ing.qty) || 0;
          }
        });
      });

      // Group by section
      const grouped: { [key: string]: GroceryItem[] } = {};
      const sections = [
        'Produce',
        'Meat/Seafood',
        'Dry Pantry',
        'Sauces/Pastes',
        'Dairy/Alt',
        'Frozen',
        'Other',
      ];

      sections.forEach((section) => {
        grouped[section] = [];
      });

      Object.entries(ingredientMap).forEach(([name, data]) => {
        grouped[data.section].push({
          name,
          totalQty: data.qty,
          unit: data.unit,
          section: data.section,
        });
      });

      setGroceries(grouped);
    } catch (error) {
      console.error('Error loading groceries:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorizeIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();

    // Produce
    if (
      /vegetable|tomato|onion|garlic|ginger|chili|pepper|carrot|lettuce|cabbage|bean|pea|corn|squash|cucumber|eggplant|mushroom|potato|lemongrass|basil|cilantro|mint|lime|lemon|banana|mango|papaya/i.test(
        lowerName
      )
    ) {
      return 'Produce';
    }

    // Meat/Seafood
    if (
      /chicken|beef|pork|fish|shrimp|prawn|crab|squid|meat|sausage/i.test(
        lowerName
      )
    ) {
      return 'Meat/Seafood';
    }

    // Sauces/Pastes
    if (
      /sauce|paste|oil|vinegar|soy|fish sauce|oyster|sesame|curry|chili paste|shrimp paste/i.test(
        lowerName
      )
    ) {
      return 'Sauces/Pastes';
    }

    // Dairy/Alt
    if (
      /milk|cream|butter|cheese|yogurt|coconut milk|coconut cream/i.test(
        lowerName
      )
    ) {
      return 'Dairy/Alt';
    }

    // Dry Pantry
    if (
      /rice|flour|noodle|pasta|sugar|salt|spice|cumin|coriander|turmeric|cardamom|cinnamon|star anise|peppercorn/i.test(
        lowerName
      )
    ) {
      return 'Dry Pantry';
    }

    // Frozen
    if (/frozen/i.test(lowerName)) {
      return 'Frozen';
    }

    return 'Other';
  };

  const toggleCheck = (itemKey: string) => {
    setChecked((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const exportToText = () => {
    let text = '🛒 GROCERY LIST\n\n';

    Object.entries(groceries).forEach(([section, items]) => {
      if (items.length === 0) return;

      text += `${section.toUpperCase()}\n`;
      text += '─'.repeat(40) + '\n';

      items.forEach((item) => {
        const qty = item.totalQty > 0 ? `${item.totalQty} ${item.unit}` : '';
        text += `[ ] ${item.name} ${qty}\n`;
      });

      text += '\n';
    });

    // Create blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const hasGroceries = Object.values(groceries).some(
    (items) => items.length > 0
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">eatr-vibe</h1>
            <div className="flex gap-4">
              <Link href="/planner">
                <Button variant="outline">Planner</Button>
              </Link>
              <Link href="/recipes">
                <Button variant="outline">Recipes</Button>
              </Link>
              <Link href="/setup">
                <Button variant="secondary">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Grocery List</h2>
          {hasGroceries && (
            <Button variant="primary" onClick={exportToText}>
              Export to Text
            </Button>
          )}
        </div>

        {!hasGroceries ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No grocery list yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Generate a meal plan to create your grocery list
            </p>
            <Link href="/planner">
              <Button variant="primary">Go to Planner</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groceries).map(([section, items]) => {
              if (items.length === 0) return null;

              return (
                <Card key={section}>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {section}
                  </h3>

                  <div className="space-y-2">
                    {items.map((item, index) => {
                      const itemKey = `${section}-${item.name}-${index}`;

                      return (
                        <label
                          key={itemKey}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <input
                            type="checkbox"
                            checked={checked[itemKey] || false}
                            onChange={() => toggleCheck(itemKey)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <span
                              className={
                                checked[itemKey]
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }
                            >
                              {item.name}
                              {item.totalQty > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  ({item.totalQty} {item.unit})
                                </span>
                              )}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
