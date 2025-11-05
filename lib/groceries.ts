// Ingredient types
export interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  notes?: string;
}

export interface AggregatedIngredient {
  name: string;
  qty: number;
  unit: string;
  totalQty: string; // Formatted as "X.XX" for display
  category: GroceryCategory;
  items: Array<{
    recipe: string;
    qty: number;
    unit: string;
    notes?: string;
  }>;
}

export type GroceryCategory = 'Produce' | 'Meat' | 'Dry Goods' | 'Sauces' | 'Dairy' | 'Frozen' | 'Other';

// Ingredient categorization mapping
const INGREDIENT_CATEGORIES: Record<string, GroceryCategory> = {
  // Produce
  tomato: 'Produce',
  tomatoes: 'Produce',
  onion: 'Produce',
  onions: 'Produce',
  garlic: 'Produce',
  lettuce: 'Produce',
  spinach: 'Produce',
  basil: 'Produce',
  cilantro: 'Produce',
  parsley: 'Produce',
  carrot: 'Produce',
  carrots: 'Produce',
  'bell pepper': 'Produce',
  peppers: 'Produce',
  cucumber: 'Produce',
  cucumbers: 'Produce',
  broccoli: 'Produce',
  cabbage: 'Produce',
  potato: 'Produce',
  potatoes: 'Produce',
  celery: 'Produce',
  ginger: 'Produce',
  turmeric: 'Produce',
  lemongrass: 'Produce',
  lime: 'Produce',
  lemon: 'Produce',
  apple: 'Produce',
  banana: 'Produce',
  orange: 'Produce',

  // Meat & Seafood
  chicken: 'Meat',
  'chicken breast': 'Meat',
  beef: 'Meat',
  pork: 'Meat',
  lamb: 'Meat',
  fish: 'Meat',
  shrimp: 'Meat',
  prawns: 'Meat',
  salmon: 'Meat',
  tuna: 'Meat',
  bacon: 'Meat',
  sausage: 'Meat',
  turkey: 'Meat',

  // Dairy
  milk: 'Dairy',
  butter: 'Dairy',
  cheese: 'Dairy',
  yogurt: 'Dairy',
  cream: 'Dairy',
  'sour cream': 'Dairy',
  'greek yogurt': 'Dairy',
  mozzarella: 'Dairy',
  cheddar: 'Dairy',
  parmesan: 'Dairy',
  egg: 'Dairy',
  eggs: 'Dairy',

  // Dry Goods
  rice: 'Dry Goods',
  pasta: 'Dry Goods',
  flour: 'Dry Goods',
  sugar: 'Dry Goods',
  salt: 'Dry Goods',
  pepper: 'Dry Goods',
  'black pepper': 'Dry Goods',
  cumin: 'Dry Goods',
  paprika: 'Dry Goods',
  'chili powder': 'Dry Goods',
  'red curry paste': 'Dry Goods',
  'green curry paste': 'Dry Goods',
  'curry powder': 'Dry Goods',
  'peanut butter': 'Dry Goods',
  'almond flour': 'Dry Goods',
  oats: 'Dry Goods',
  beans: 'Dry Goods',
  lentils: 'Dry Goods',
  'baking powder': 'Dry Goods',
  'baking soda': 'Dry Goods',
  yeast: 'Dry Goods',

  // Sauces & Condiments
  'fish sauce': 'Sauces',
  'soy sauce': 'Sauces',
  'oyster sauce': 'Sauces',
  'sriracha': 'Sauces',
  'hot sauce': 'Sauces',
  'worcestershire sauce': 'Sauces',
  'olive oil': 'Sauces',
  oil: 'Sauces',
  vinegar: 'Sauces',
  'rice vinegar': 'Sauces',
  'balsamic vinegar': 'Sauces',
  ketchup: 'Sauces',
  mustard: 'Sauces',
  honey: 'Sauces',
  'coconut milk': 'Sauces',

  // Frozen
  'frozen vegetables': 'Frozen',
  'frozen peas': 'Frozen',
  'frozen corn': 'Frozen',
  'frozen mixed vegetables': 'Frozen',
  'frozen berries': 'Frozen',
};

/**
 * Parse ingredients JSON string from Recipe
 */
export function parseIngredients(ingredientsJson: string): Ingredient[] {
  try {
    return JSON.parse(ingredientsJson);
  } catch {
    return [];
  }
}

/**
 * Categorize an ingredient based on its name
 */
export function categorizeIngredient(name: string): GroceryCategory {
  const lowerName = name.toLowerCase();

  // Direct lookup
  if (INGREDIENT_CATEGORIES[lowerName]) {
    return INGREDIENT_CATEGORIES[lowerName];
  }

  // Fuzzy matching - check if name contains category keywords
  for (const [keyword, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (lowerName.includes(keyword)) {
      return category;
    }
  }

  return 'Other';
}

/**
 * Convert various units to base unit for aggregation
 * Returns standardized qty (in smallest unit)
 */
function standardizeQuantity(qty: number, unit: string): { standardQty: number; baseUnit: string } {
  // For now, keep it simple - don't convert between unit types
  // Just return as-is and use the unit as grouping key
  return {
    standardQty: qty,
    baseUnit: unit,
  };
}

/**
 * Aggregate ingredients from multiple recipes
 * Groups by name + unit, combines quantities
 */
export function aggregateIngredients(
  planMeals: Array<{
    recipe: {
      title: string;
      ingredientsJson: string;
    };
  }>
): AggregatedIngredient[] {
  const ingredientMap = new Map<string, AggregatedIngredient>();

  // Process each meal
  planMeals.forEach(({ recipe }) => {
    const ingredients = parseIngredients(recipe.ingredientsJson);

    ingredients.forEach((ingredient) => {
      const qty = parseFloat(ingredient.qty) || 0;
      if (qty <= 0) return; // Skip invalid quantities

      const key = `${ingredient.name.toLowerCase()}__${ingredient.unit}`;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.qty += qty;
        existing.items.push({
          recipe: recipe.title,
          qty,
          unit: ingredient.unit,
          notes: ingredient.notes,
        });
      } else {
        const category = categorizeIngredient(ingredient.name);
        ingredientMap.set(key, {
          name: ingredient.name,
          qty,
          unit: ingredient.unit,
          totalQty: qty.toFixed(2),
          category,
          items: [
            {
              recipe: recipe.title,
              qty,
              unit: ingredient.unit,
              notes: ingredient.notes,
            },
          ],
        });
      }
    });
  });

  // Convert map to array and update totalQty
  const aggregated = Array.from(ingredientMap.values()).map((item) => ({
    ...item,
    totalQty: item.qty.toFixed(2),
  }));

  // Sort by category then by name
  aggregated.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return aggregated;
}

/**
 * Group aggregated ingredients by category
 */
export function groupByCategory(
  ingredients: AggregatedIngredient[]
): Record<GroceryCategory, AggregatedIngredient[]> {
  const grouped: Record<GroceryCategory, AggregatedIngredient[]> = {
    Produce: [],
    Meat: [],
    'Dry Goods': [],
    Sauces: [],
    Dairy: [],
    Frozen: [],
    Other: [],
  };

  ingredients.forEach((ingredient) => {
    grouped[ingredient.category].push(ingredient);
  });

  return grouped;
}

/**
 * Convert aggregated ingredients to CSV format
 */
export function toCsv(ingredients: AggregatedIngredient[]): string {
  const headers = ['Item', 'Quantity', 'Unit', 'Category', 'From Recipes'];
  const rows = ingredients.map((ing) => [
    ing.name,
    ing.totalQty,
    ing.unit,
    ing.category,
    ing.items.map((i) => `${i.recipe} (${i.qty} ${i.unit})`).join('; '),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
