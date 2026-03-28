'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { YouTubeImportModal } from '@/components/YouTubeImportModal';
import { AddRecipeModal } from '@/components/AddRecipeModal';
import { FilterBar } from '@/components/FilterBar';
import { RecipeCard } from '@/components/RecipeCard';
import { CuratedCollectionRow } from '@/components/CuratedCollectionRow';
import { Plus } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  dietTags: string | null;
  difficulty: string | null;
  timeMins: number | null;
  estimatedPrice: number | null;
  currency: string | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  fiberG?: number | null;
  sugarG?: number | null;
  sodiumMg?: number | null;
  ingredientsJson?: string | null;
  imageUrl: string | null;
  tags: string | null;
}

const CUISINE_GROUPS: { continent: string; cuisines: string[] }[] = [
  { continent: 'Asia', cuisines: ['Cambodian', 'Thai', 'Vietnamese', 'Indonesian', 'Malaysian', 'Filipino', 'Chinese', 'Japanese', 'Korean', 'Indian', 'Sri Lankan', 'Burmese', 'Laotian'] },
  { continent: 'Middle East', cuisines: ['Lebanese', 'Turkish', 'Persian', 'Israeli', 'Moroccan'] },
  { continent: 'Europe', cuisines: ['Italian', 'French', 'Spanish', 'Greek', 'British', 'German', 'Eastern European'] },
  { continent: 'Americas', cuisines: ['American', 'Mexican', 'Brazilian', 'Peruvian', 'Caribbean'] },
  { continent: 'Oceania', cuisines: ['Australian', 'New Zealand'] },
  { continent: 'Africa', cuisines: ['Ethiopian', 'Nigerian', 'South African', 'Egyptian'] },
];

const MAIN_INGREDIENTS = [
  'Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Tofu', 'Eggs',
  'Rice', 'Noodles', 'Pasta', 'Potato', 'Mushroom', 'Tomato',
  'Spinach', 'Broccoli', 'Carrot', 'Onion', 'Garlic', 'Ginger', 'Coconut Milk',
];

const DISH_TYPES = [
  'Appetizer', 'Breakfast', 'Brunch', 'Burrito', 'Cake', 'Casserole', 'Curry',
  'Dessert', 'Dip', 'Dumpling', 'Fried Rice', 'Grilled', 'Noodles', 'Pasta',
  'Pizza', 'Porridge', 'Salad', 'Sandwich', 'Seafood', 'Smoothie', 'Soup',
  'Stew', 'Stir-fry', 'Sushi', 'Tacos', 'Wrap',
];

const NUTRITION_TAGS = [
  'Low Carb', 'High Protein', 'Low Fat', 'Low Sodium',
  'Low Cholesterol', 'High Fiber', 'Low Sugar', 'Well Balanced',
];

const COOK_TIME_OPTIONS = [
  { label: '30 minutes or less', maxTime: '30', minTime: '' },
  { label: '45 minutes or less', maxTime: '45', minTime: '' },
  { label: '1 hour or less', maxTime: '60', minTime: '' },
  { label: 'More than 1 hour', maxTime: '', minTime: '61' },
];

const FILTER_OPTIONS = [
  { key: 'cookTime', label: 'Time', emoji: '⏰', options: COOK_TIME_OPTIONS.map((o) => o.label), singleSelect: true },
  { key: 'mainIngredients', label: 'Main Ingredient', emoji: '🥕', options: MAIN_INGREDIENTS },
  { key: 'cuisines', label: 'Cuisine', emoji: '🌍', options: CUISINE_GROUPS.flatMap((g) => g.cuisines) },
  { key: 'dishTypes', label: 'Dish Type', emoji: '🍽️', options: DISH_TYPES },
  { key: 'nutritionTags', label: 'Nutrition', emoji: '💪', options: NUTRITION_TAGS },
];

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="motion-safe:animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    }>
      <RecipesContent />
    </Suspense>
  );
}

function RecipesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [curatedCollections, setCuratedCollections] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    q: '',
    cuisine: '',
    difficulty: '',
    vegetarian: false,
    vegan: false,
    halal: false,
    maxTime: '',
    minTime: '',
    maxPrice: '',
    mainIngredients: [] as string[],
    cuisines: [] as string[],
    dishTypes: [] as string[],
    nutritionTags: [] as string[],
  });

  useEffect(() => {
    if (searchParams.get('add') === 'true') setAddModalOpen(true);
    const qParam = searchParams.get('q');
    if (qParam) setFilters(p => ({ ...p, q: qParam }));
  }, [searchParams]);

  useEffect(() => {
    loadRecipes();
    loadCuratedCollections();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recipes, filters]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : data.recipes || []);
    } catch {
      console.error('Error loading recipes');
    } finally {
      setLoading(false);
    }
  };

  const loadCuratedCollections = async () => {
    try {
      const res = await fetch('/api/curated-collections');
      if (res.ok) setCuratedCollections(await res.json());
    } catch {}
  };

  const applyFilters = () => {
    let filtered = recipes;

    if (filters.q) {
      const q = filters.q.toLowerCase();
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      );
    }
    if (filters.cuisine) filtered = filtered.filter((r) => r.cuisine === filters.cuisine);
    if (filters.difficulty) filtered = filtered.filter((r) => r.difficulty === filters.difficulty);
    if (filters.vegetarian) filtered = filtered.filter((r) => r.dietTags?.toLowerCase().includes('vegetarian'));
    if (filters.vegan) filtered = filtered.filter((r) => r.dietTags?.toLowerCase().includes('vegan'));
    if (filters.halal) filtered = filtered.filter((r) => r.dietTags?.toLowerCase().includes('halal'));

    if (filters.minTime) {
      filtered = filtered.filter((r) => r.timeMins != null && r.timeMins > 60);
    } else if (filters.maxTime) {
      filtered = filtered.filter((r) => r.timeMins != null && r.timeMins <= Number(filters.maxTime));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((r) => r.estimatedPrice != null && r.estimatedPrice <= Number(filters.maxPrice));
    }

    if (filters.mainIngredients.length > 0) {
      filtered = filtered.filter((r) => {
        const tagsLower = (r.tags || '').toLowerCase();
        let firstName = '';
        if (r.ingredientsJson) {
          try {
            const p = JSON.parse(r.ingredientsJson);
            if (Array.isArray(p) && p.length > 0) firstName = (p[0].name || '').toLowerCase();
          } catch {}
        }
        return filters.mainIngredients.some(
          (ing) => tagsLower.includes(ing.toLowerCase()) || firstName.includes(ing.toLowerCase())
        );
      });
    }

    if (filters.cuisines.length > 0) {
      filtered = filtered.filter(
        (r) => r.cuisine != null && filters.cuisines.some((c) => c.toLowerCase() === r.cuisine!.toLowerCase())
      );
    }

    if (filters.dishTypes.length > 0) {
      filtered = filtered.filter((r) =>
        filters.dishTypes.some((dt) => (r.tags || '').toLowerCase().includes(dt.toLowerCase()))
      );
    }

    if (filters.nutritionTags.length > 0) {
      filtered = filtered.filter((r) =>
        filters.nutritionTags.every((tag) => {
          switch (tag) {
            case 'Low Carb': return r.carbsG != null && r.carbsG < 30;
            case 'High Protein': return r.proteinG != null && r.proteinG > 25;
            case 'Low Fat': return r.fatG != null && r.fatG < 10;
            case 'Low Sodium': return r.sodiumMg != null && r.sodiumMg < 600;
            case 'Low Cholesterol': return r.sodiumMg != null && r.sodiumMg < 400;
            case 'High Fiber': return r.fiberG != null && r.fiberG > 5;
            case 'Low Sugar': return r.sugarG != null && r.sugarG < 5;
            case 'Well Balanced': return r.kcal != null && r.kcal >= 300 && r.kcal <= 700 && r.proteinG != null && r.proteinG > 15;
            default: return true;
          }
        })
      );
    }

    setFilteredRecipes(filtered);
  };

  const selectedCookTimeLabel = COOK_TIME_OPTIONS.find(
    (o) => o.maxTime === filters.maxTime && o.minTime === filters.minTime
  )?.label;

  const pillFilters: Record<string, string[]> = {
    cookTime: selectedCookTimeLabel ? [selectedCookTimeLabel] : [],
    mainIngredients: filters.mainIngredients,
    cuisines: filters.cuisines,
    dishTypes: filters.dishTypes,
    nutritionTags: filters.nutritionTags,
  };

  const handlePillFilterChange = (key: string, values: string[]) => {
    if (key === 'cookTime') {
      const opt = COOK_TIME_OPTIONS.find((o) => o.label === values[0]);
      setFilters((p) => ({ ...p, maxTime: opt?.maxTime ?? '', minTime: opt?.minTime ?? '' }));
    } else {
      setFilters((p) => ({ ...p, [key]: values }));
    }
  };

  const hasActiveFilters = !!(
    filters.q || filters.maxTime || filters.minTime ||
    filters.mainIngredients.length || filters.cuisines.length ||
    filters.dishTypes.length || filters.nutritionTags.length
  );

  return (
    <div className="min-h-screen bg-background">
      <FilterBar
        search={filters.q}
        onSearchChange={(v) => setFilters((p) => ({ ...p, q: v }))}
        activeFilters={pillFilters}
        onFilterChange={handlePillFilterChange}
        filterOptions={FILTER_OPTIONS}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-display text-primary tracking-tight">Recipe Browser</h2>
            <p className="text-sm text-muted-foreground font-body">Find your next meal or import from anywhere</p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 rounded-pill h-12 px-6 font-display shadow-lg shadow-accent/20"
          >
            <Plus className="h-5 w-5" />
            <span>Add Recipe</span>
          </Button>
        </div>

        <RecipeBrowseTab
          recipes={filteredRecipes}
          loading={loading}
          curatedCollections={curatedCollections}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <YouTubeImportModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onSuccess={(id) => { setYoutubeModalOpen(false); router.push(`/recipes/${id}`); }}
      />

      <AddRecipeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(id) => router.push(`/recipes/${id}`)}
      />
    </div>
  );
}

interface RecipeBrowseTabProps {
  recipes: Recipe[];
  loading: boolean;
  curatedCollections: any[];
  hasActiveFilters: boolean;
}

function RecipeBrowseTab({ recipes, loading, curatedCollections, hasActiveFilters }: RecipeBrowseTabProps) {
  const [likedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    fetch('/api/recipes/library', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((lib) => {
        if (!lib) return;
        const ids = new Set<string>();
        lib.uncategorized?.forEach((r: any) => ids.add(r.id));
        lib.collections?.forEach((c: any) => c.recipes?.forEach((r: any) => ids.add(r.id)));
        setSavedIds(ids);
      })
      .catch(() => {});
  }, [recipes]);

  return (
    <div>
      {/* Curated collection rows — shown only when no search/filter active */}
      {!loading && !hasActiveFilters && curatedCollections.map((col: any) => (
        <CuratedCollectionRow
          key={col.id}
          title={col.title}
          emoji={col.emoji}
          tagline={col.tagline}
          recipes={col.recipes}
          likedIds={likedIds}
          savedIds={savedIds}
        />
      ))}

      {!loading && (
        <p className="text-sm font-body font-medium text-muted-foreground mb-5 italic">
          Found <span className="text-brand-green font-bold">{recipes.length}</span>{' '}
          {recipes.length === 1 ? 'delicious recipe' : 'delicious recipes'}
        </p>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block motion-safe:animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent mb-4" />
          <p className="font-display text-muted-foreground uppercase tracking-widest text-xs">Simmering recipes…</p>
        </div>
      ) : recipes.length === 0 ? (
        <Card className="text-center py-16 border-2 border-dashed border-border/60">
          <div className="text-6xl mb-6 motion-safe:animate-bounce">🍜</div>
          <h3 className="text-2xl font-display text-foreground mb-2">No recipes found</h3>
          <p className="text-muted-foreground font-body italic">Try adjusting your filters or search query</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              initialLiked={likedIds.has(recipe.id)}
              initialSaved={savedIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
