'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';
import { YouTubeImportModal } from '@/components/YouTubeImportModal';

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

export default function RecipesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'browse' | 'add' | 'import'>('browse');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    cuisine: '',
    difficulty: '',
    diet: '',
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

  const handleYoutubeImportSuccess = (recipeId: string) => {
    setYoutubeModalOpen(false);
    router.push(`/recipes/${recipeId}`);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recipes, filters]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipes`);
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : data.recipes || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDietToggle = (dietType: 'vegetarian' | 'vegan' | 'halal') => {
    setFilters((prev) => ({
      ...prev,
      [dietType]: !prev[dietType],
    }));
  };

  const applyFilters = () => {
    let filtered = recipes;

    if (filters.q) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(filters.q.toLowerCase()) ||
        r.description?.toLowerCase().includes(filters.q.toLowerCase())
      );
    }

    if (filters.cuisine) {
      filtered = filtered.filter((r) => r.cuisine === filters.cuisine);
    }

    if (filters.difficulty) {
      filtered = filtered.filter((r) => r.difficulty === filters.difficulty);
    }

    if (filters.vegetarian) {
      filtered = filtered.filter((r) =>
        r.dietTags && r.dietTags.toLowerCase().includes('vegetarian')
      );
    }

    if (filters.vegan) {
      filtered = filtered.filter((r) =>
        r.dietTags && r.dietTags.toLowerCase().includes('vegan')
      );
    }

    if (filters.halal) {
      filtered = filtered.filter((r) =>
        r.dietTags && r.dietTags.toLowerCase().includes('halal')
      );
    }

    if (filters.minTime) {
      filtered = filtered.filter((r) => r.timeMins != null && r.timeMins > 60);
    } else if (filters.maxTime) {
      filtered = filtered.filter((r) => r.timeMins != null && r.timeMins <= Number(filters.maxTime));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((r) => r.estimatedPrice && r.estimatedPrice <= Number(filters.maxPrice));
    }

    if (filters.mainIngredients.length > 0) {
      filtered = filtered.filter((r) => {
        const tagsLower = (r.tags || '').toLowerCase();
        let firstIngredientName = '';
        if (r.ingredientsJson) {
          try {
            const parsed = JSON.parse(r.ingredientsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              firstIngredientName = (parsed[0].name || '').toLowerCase();
            }
          } catch (_) {}
        }
        return filters.mainIngredients.some(
          (ing) =>
            tagsLower.includes(ing.toLowerCase()) ||
            firstIngredientName.includes(ing.toLowerCase())
        );
      });
    }

    if (filters.cuisines.length > 0) {
      filtered = filtered.filter((r) =>
        r.cuisine != null && filters.cuisines.some((c) => c.toLowerCase() === r.cuisine!.toLowerCase())
      );
    }

    if (filters.dishTypes.length > 0) {
      filtered = filtered.filter((r) => {
        const tagsLower = (r.tags || '').toLowerCase();
        return filters.dishTypes.some((dt) => tagsLower.includes(dt.toLowerCase()));
      });
    }

    if (filters.nutritionTags.length > 0) {
      filtered = filtered.filter((r) =>
        filters.nutritionTags.every((tag) => {
          switch (tag) {
            case 'Low Carb':
              return r.carbsG != null && r.carbsG < 30;
            case 'High Protein':
              return r.proteinG != null && r.proteinG > 25;
            case 'Low Fat':
              return r.fatG != null && r.fatG < 10;
            case 'Low Sodium':
              return r.sodiumMg != null && r.sodiumMg < 600;
            case 'Low Cholesterol':
              return r.sodiumMg != null && r.sodiumMg < 400;
            case 'High Fiber':
              return r.fiberG != null && r.fiberG > 5;
            case 'Low Sugar':
              return r.sugarG != null && r.sugarG < 5;
            case 'Well Balanced':
              return (
                r.kcal != null &&
                r.kcal >= 300 &&
                r.kcal <= 700 &&
                r.proteinG != null &&
                r.proteinG > 15
              );
            default:
              return true;
          }
        })
      );
    }

    setFilteredRecipes(filtered);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Tabs */}
          <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 py-4 w-full">
              <h2 className="text-2xl font-bold text-foreground mb-4">Recipe Browser</h2>
              <div className="flex gap-2 border-b border-border">
                <button
                  onClick={() => setTab('browse')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    tab === 'browse'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  🔍 Browse
                </button>
                <button
                  onClick={() => setTab('add')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    tab === 'add'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  ✏️ Add Recipe
                </button>
                <button
                  onClick={() => setTab('import')}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    tab === 'import'
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  📥 Import
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'browse' && <RecipeBrowseTab recipes={filteredRecipes} loading={loading} filters={filters} handleFilterChange={handleFilterChange} handleDietToggle={handleDietToggle} setFilters={setFilters} youtubeModalOpen={youtubeModalOpen} setYoutubeModalOpen={setYoutubeModalOpen} />}
            {tab === 'add' && <AddRecipeTab onSuccess={(id) => { setTab('browse'); router.push(`/recipes/${id}`); }} />}
            {tab === 'import' && <ImportRecipeTab onSuccess={(id) => { setTab('browse'); router.push(`/recipes/${id}`); }} />}
          </div>
        </div>
      </div>

      <YouTubeImportModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onSuccess={handleYoutubeImportSuccess}
      />

    </div>
  );
}

// Browse Tab Component

const CUISINE_GROUPS: { continent: string; cuisines: string[] }[] = [
  {
    continent: 'Asia',
    cuisines: [
      'Cambodian', 'Thai', 'Vietnamese', 'Indonesian', 'Malaysian', 'Filipino',
      'Chinese', 'Japanese', 'Korean', 'Indian', 'Sri Lankan', 'Burmese', 'Laotian',
    ],
  },
  {
    continent: 'Middle East',
    cuisines: ['Lebanese', 'Turkish', 'Persian', 'Israeli', 'Moroccan'],
  },
  {
    continent: 'Europe',
    cuisines: ['Italian', 'French', 'Spanish', 'Greek', 'British', 'German', 'Eastern European'],
  },
  {
    continent: 'Americas',
    cuisines: ['American', 'Mexican', 'Brazilian', 'Peruvian', 'Caribbean'],
  },
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

interface RecipeBrowseTabProps {
  recipes: Recipe[];
  loading: boolean;
  filters: any;
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleDietToggle: (dietType: 'vegetarian' | 'vegan' | 'halal') => void;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  youtubeModalOpen: boolean;
  setYoutubeModalOpen: (open: boolean) => void;
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RecipeBrowseTab({
  recipes,
  loading,
  filters,
  handleFilterChange,
  setFilters,
  youtubeModalOpen,
  setYoutubeModalOpen,
}: RecipeBrowseTabProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  // Count active filters (excluding q which has its own input)
  const activeFilterCount = [
    filters.maxTime || filters.minTime ? 1 : 0,
    filters.mainIngredients.length,
    filters.cuisines.length,
    filters.dishTypes.length,
    filters.nutritionTags.length,
  ].reduce((a: number, b: number) => a + b, 0);

  const toggleArrayFilter = (key: string, value: string) => {
    setFilters((prev: any) => {
      const current: string[] = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v: string) => v !== value)
          : [...current, value],
      };
    });
  };

  const clearAllFilters = () => {
    setFilters((prev: any) => ({
      ...prev,
      q: '',
      maxTime: '',
      minTime: '',
      mainIngredients: [],
      cuisines: [],
      dishTypes: [],
      nutritionTags: [],
    }));
  };

  const selectedCookTime = COOK_TIME_OPTIONS.find(
    (o) => o.maxTime === filters.maxTime && o.minTime === filters.minTime
  );

  const setCookTime = (option: typeof COOK_TIME_OPTIONS[0] | null) => {
    setFilters((prev: any) => ({
      ...prev,
      maxTime: option ? option.maxTime : '',
      minTime: option ? option.minTime : '',
    }));
  };

  // Build active chip list
  type Chip = { label: string; onRemove: () => void };
  const activeChips: Chip[] = [];

  if (selectedCookTime) {
    activeChips.push({
      label: selectedCookTime.label,
      onRemove: () => setCookTime(null),
    });
  }
  filters.mainIngredients.forEach((ing: string) => {
    activeChips.push({
      label: ing,
      onRemove: () => toggleArrayFilter('mainIngredients', ing),
    });
  });
  filters.cuisines.forEach((c: string) => {
    activeChips.push({
      label: c,
      onRemove: () => toggleArrayFilter('cuisines', c),
    });
  });
  filters.dishTypes.forEach((dt: string) => {
    activeChips.push({
      label: dt,
      onRemove: () => toggleArrayFilter('dishTypes', dt),
    });
  });
  filters.nutritionTags.forEach((nt: string) => {
    activeChips.push({
      label: nt,
      onRemove: () => toggleArrayFilter('nutritionTags', nt),
    });
  });

  const filteredIngredients = MAIN_INGREDIENTS.filter((ing) =>
    ing.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top bar: search + filter button */}
      <div className="flex gap-3 items-center mb-3">
        {/* Search bar */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="text"
            name="q"
            value={filters.q}
            onChange={handleFilterChange}
            placeholder="Search recipes..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Filters button */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              panelOpen || activeFilterCount > 0
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-foreground hover:bg-muted'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-xs font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter panel */}
          {panelOpen && (
            <div
              ref={panelRef}
              className="fixed inset-x-4 top-auto z-50 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden md:absolute md:inset-x-auto md:right-0 md:w-80"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                {/* Cook Time */}
                <CollapsibleSection title="Cook Time">
                  <div className="space-y-2">
                    {COOK_TIME_OPTIONS.map((opt) => {
                      const isSelected =
                        filters.maxTime === opt.maxTime && filters.minTime === opt.minTime;
                      return (
                        <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="cookTime"
                            checked={isSelected}
                            onChange={() => setCookTime(isSelected ? null : opt)}
                            className="w-4 h-4 text-primary border-border"
                          />
                          <span className="text-sm text-foreground">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </CollapsibleSection>

                {/* Main Ingredient */}
                <CollapsibleSection title="Main Ingredient">
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Search ingredients..."
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {filteredIngredients.map((ing) => (
                      <label key={ing} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.mainIngredients.includes(ing)}
                          onChange={() => toggleArrayFilter('mainIngredients', ing)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <span className="text-sm text-foreground">{ing}</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Cuisine */}
                <CollapsibleSection title="Cuisine">
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                    {CUISINE_GROUPS.map((group) => (
                      <div key={group.continent}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          {group.continent}
                        </p>
                        <div className="space-y-1.5">
                          {group.cuisines.map((cuisine) => (
                            <label key={cuisine} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.cuisines.includes(cuisine)}
                                onChange={() => toggleArrayFilter('cuisines', cuisine)}
                                className="w-4 h-4 rounded border-border text-primary"
                              />
                              <span className="text-sm text-foreground">{cuisine}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Dish Type */}
                <CollapsibleSection title="Dish Type">
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {DISH_TYPES.map((dt) => (
                      <label key={dt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.dishTypes.includes(dt)}
                          onChange={() => toggleArrayFilter('dishTypes', dt)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <span className="text-sm text-foreground">{dt}</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Nutrition */}
                <CollapsibleSection title="Nutrition">
                  <div className="space-y-1.5">
                    {NUTRITION_TAGS.map((nt) => (
                      <label key={nt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.nutritionTags.includes(nt)}
                          onChange={() => toggleArrayFilter('nutritionTags', nt)}
                          className="w-4 h-4 rounded border-border text-primary"
                        />
                        <span className="text-sm text-foreground">{nt}</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleSection>
              </div>

              {/* Panel bottom bar */}
              <div className="flex gap-2 p-3 border-t border-border bg-card">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="ml-0.5 hover:text-primary/70 transition-colors"
                aria-label={`Remove ${chip.label} filter`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Recipe count */}
      {!loading && (
        <p className="text-sm text-muted-foreground mb-5">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
        </p>
      )}

      {/* Recipes Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4">🍜</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group">
              <div className="bg-card border border-border rounded-2xl overflow-hidden h-full hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer flex flex-col">
                {/* Image area */}
                <div className="relative w-full h-44 bg-muted flex-shrink-0">
                  {recipe.imageUrl ? (
                    <Image
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/40">
                      🍽️
                    </div>
                  )}
                  {/* Time badge */}
                  {recipe.timeMins && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                      ⏱ {recipe.timeMins}min
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug">
                    {recipe.title}
                  </h3>

                  {recipe.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  )}

                  {/* Cuisine + diet tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {recipe.cuisine && (
                      <span className="px-2 py-0.5 bg-primary/15 text-primary rounded-full text-xs font-medium">
                        {recipe.cuisine}
                      </span>
                    )}
                    {recipe.dietTags &&
                      recipe.dietTags
                        .split(',')
                        .slice(0, 3)
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                  </div>

                  {/* Stats row */}
                  <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                    {recipe.kcal && (
                      <span className="flex items-center gap-0.5">
                        🔥 <span>{recipe.kcal} kcal</span>
                      </span>
                    )}
                    {recipe.proteinG && (
                      <span className="flex items-center gap-0.5">
                        💪 <span>{recipe.proteinG}g</span>
                      </span>
                    )}
                    {recipe.estimatedPrice && (
                      <span className="ml-auto font-semibold text-foreground">
                        ${recipe.estimatedPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Add Recipe Tab Component
function AddRecipeTab({
  onSuccess,
}: {
  onSuccess: (recipeId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', qty: '', unit: 'g', notes: '' },
  ]);
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: '',
    difficulty: 'easy',
    timeMins: '',
    estimatedPrice: '',
    currency: 'USD',
    imageUrl: '',
    kcal: '',
    proteinG: '',
    carbsG: '',
    fatG: '',
    fiberG: '',
    sugarG: '',
    sodiumMg: '',
    stepsMd: '',
    safetyMd: '',
    tags: '',
  });

  interface Ingredient {
    name: string;
    qty: string;
    unit: string;
    notes?: string;
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', qty: '', unit: 'g', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleDietTag = (tag: string) => {
    setSelectedDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Recipe title is required');
      return false;
    }
    if (!formData.cuisine.trim()) {
      setError('Cuisine is required');
      return false;
    }
    if (ingredients.some((i) => !i.name.trim() || !i.qty.trim())) {
      setError('All ingredients must have a name and quantity');
      return false;
    }
    if (!formData.stepsMd.trim()) {
      setError('Cooking steps are required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timeMins: formData.timeMins ? parseInt(formData.timeMins) : null,
          estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
          kcal: formData.kcal ? parseInt(formData.kcal) : null,
          proteinG: formData.proteinG ? parseInt(formData.proteinG) : null,
          carbsG: formData.carbsG ? parseInt(formData.carbsG) : null,
          fatG: formData.fatG ? parseInt(formData.fatG) : null,
          fiberG: formData.fiberG ? parseInt(formData.fiberG) : null,
          sugarG: formData.sugarG ? parseInt(formData.sugarG) : null,
          sodiumMg: formData.sodiumMg ? parseInt(formData.sodiumMg) : null,
          ingredientsJson: JSON.stringify(ingredients),
          dietTags: selectedDietTags.join(','),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save recipe');
      }

      const result = await response.json();
      onSuccess(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const DIET_TAGS = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'halal',
    'kosher',
    'keto',
    'paleo',
    'high-protein',
  ];

  const CUISINES = [
    'Cambodian',
    'Thai',
    'Vietnamese',
    'Australian',
    'American',
    'Malaysian',
    'Indian',
    'Italian',
    'Mexican',
    'Chinese',
    'Japanese',
    'Korean',
  ];

  const UNITS = ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'oz', 'lb', 'whole', 'pinch', 'clove'];

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Recipe Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Green Curry with Chicken"
                required
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Brief description of the recipe..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Cuisine"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleFormChange}
                  options={[
                    { value: '', label: 'Select Cuisine' },
                    ...CUISINES.map((c) => ({ value: c, label: c })),
                  ]}
                  required
                />

                <Select
                  label="Difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleFormChange}
                  options={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                  ]}
                />
              </div>

              <Input
                label="Image URL"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleFormChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Cooking Details */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Cooking Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Time (minutes)"
                  name="timeMins"
                  type="number"
                  value={formData.timeMins}
                  onChange={handleFormChange}
                  placeholder="30"
                />

                <Input
                  label="Price"
                  name="estimatedPrice"
                  type="number"
                  step="0.01"
                  value={formData.estimatedPrice}
                  onChange={handleFormChange}
                  placeholder="5.50"
                />

                <Select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleFormChange}
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'KHR', label: 'KHR (៛)' },
                    { value: 'THB', label: 'THB (฿)' },
                    { value: 'VND', label: 'VND (₫)' },
                    { value: 'AUD', label: 'AUD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Nutritional Information (per serving)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="Calories (kcal)"
                  name="kcal"
                  type="number"
                  value={formData.kcal}
                  onChange={handleFormChange}
                  placeholder="450"
                />

                <Input
                  label="Protein (g)"
                  name="proteinG"
                  type="number"
                  value={formData.proteinG}
                  onChange={handleFormChange}
                  placeholder="20"
                />

                <Input
                  label="Carbs (g)"
                  name="carbsG"
                  type="number"
                  value={formData.carbsG}
                  onChange={handleFormChange}
                  placeholder="45"
                />

                <Input
                  label="Fat (g)"
                  name="fatG"
                  type="number"
                  value={formData.fatG}
                  onChange={handleFormChange}
                  placeholder="18"
                />

                <Input
                  label="Fiber (g)"
                  name="fiberG"
                  type="number"
                  value={formData.fiberG}
                  onChange={handleFormChange}
                  placeholder="3"
                />

                <Input
                  label="Sugar (g)"
                  name="sugarG"
                  type="number"
                  value={formData.sugarG}
                  onChange={handleFormChange}
                  placeholder="5"
                />

                <Input
                  label="Sodium (mg)"
                  name="sodiumMg"
                  type="number"
                  value={formData.sodiumMg}
                  onChange={handleFormChange}
                  placeholder="600"
                />
              </div>
            </div>
          </div>

          {/* Diet Tags */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Dietary Tags</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIET_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDietTags.includes(tag)}
                    onChange={() => toggleDietTag(tag)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground capitalize">{tag.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-foreground">Ingredients</h3>
              <Button
                type="button"
                onClick={addIngredient}
                variant="outline"
                className="px-4 py-2 text-sm"
              >
                + Add Ingredient
              </Button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <Input
                    label={index === 0 ? 'Ingredient Name' : ''}
                    placeholder="e.g., Chicken breast"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />

                  <Input
                    label={index === 0 ? 'Qty' : ''}
                    type="number"
                    placeholder="200"
                    value={ingredient.qty}
                    onChange={(e) => handleIngredientChange(index, 'qty', e.target.value)}
                    className="w-24"
                  />

                  <Select
                    label={index === 0 ? 'Unit' : ''}
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    options={UNITS.map((u) => ({ value: u, label: u }))}
                    className="w-24"
                  />

                  <Input
                    label={index === 0 ? 'Notes' : ''}
                    placeholder="Optional notes"
                    value={ingredient.notes || ''}
                    onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                    className="flex-1"
                  />

                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      variant="outline"
                      className="px-3 py-2 text-sm"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Cooking Steps</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Enter numbered steps. You can use markdown for formatting (e.g., **bold**, *italic*)
            </p>
            <textarea
              name="stepsMd"
              value={formData.stepsMd}
              onChange={handleFormChange}
              placeholder={`1. Preheat oven to 200°C
2. Mix ingredients in a bowl
3. Pour into baking dish
4. Bake for 25 minutes until golden`}
              className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              rows={8}
              required
            />
          </div>

          {/* Food Safety */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Food Safety Tips (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add important safety information for this recipe
            </p>
            <textarea
              name="safetyMd"
              value={formData.safetyMd}
              onChange={handleFormChange}
              placeholder={`**Food Safety Tips:**
- Store at proper temperature
- Cook until internal temperature reaches 165°F
- Wash hands after handling raw ingredients`}
              className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              rows={6}
            />
          </div>

          {/* Tags */}
          <div>
            <Input
              label="Tags (comma-separated)"
              name="tags"
              value={formData.tags}
              onChange={handleFormChange}
              placeholder="e.g., quick, easy, budget-friendly"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-border">
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Recipe'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Import Recipe Tab Component
function ImportRecipeTab({
  onSuccess,
}: {
  onSuccess: (recipeId: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [halal, setHalal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<Recipe | null>(null);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Recipe URL is required');
      return;
    }

    setLoading(true);
    setError('');
    setImportedRecipe(null);

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          vegetarian,
          vegan,
          halal,
          currency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import recipe');
      }

      const result = await response.json();
      setImportedRecipe(result);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeSuccess = (recipeId: string) => {
    setYoutubeModalOpen(false);
    onSuccess(recipeId);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Import Form */}
        <Card>
          <h3 className="text-xl font-semibold text-foreground mb-6">Import from Recipe Website</h3>

          <form onSubmit={handleImport} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Recipe URL</label>
              <Input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://example.com/recipe/pad-thai"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Works with most recipe websites that have structured data (schema.org)
              </p>
            </div>

            {/* Diet Filters */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Dietary Preferences</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vegetarian}
                    onChange={(e) => setVegetarian(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Vegetarian (no meat/fish)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vegan}
                    onChange={(e) => setVegan(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Vegan (no animal products)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={halal}
                    onChange={(e) => setHalal(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">Halal (no pork, no alcohol)</span>
                </label>
              </div>
            </div>

            {/* Currency */}
            <div>
              <Select
                label="Currency for Pricing"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'KHR', label: 'KHR (៛)' },
                  { value: 'THB', label: 'THB (฿)' },
                  { value: 'VND', label: 'VND (₫)' },
                  { value: 'AUD', label: 'AUD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                ]}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={loading || !url.trim()} className="w-full">
              {loading ? 'Importing...' : 'Import Recipe'}
            </Button>
          </form>

          {/* Info Box */}
          <div className="bg-muted rounded-lg p-4 mt-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Our AI extracts recipe details from websites using structured
              recipe data. Works best with major recipe sites like AllRecipes, Tasty, BBC Good Food,
              etc.
            </p>
          </div>

          {/* YouTube Import Section */}
          <div className="border-t border-border mt-8 pt-8">
            <h4 className="text-lg font-semibold text-foreground mb-4">Or Import from YouTube</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Extract recipes from YouTube cooking videos using AI
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setYoutubeModalOpen(true)}
              className="w-full"
            >
              📹 Open YouTube Import
            </Button>
          </div>
        </Card>

        {/* Preview or Empty State */}
        <div>
          {importedRecipe ? (
            <Card className="h-full">
              <h3 className="text-xl font-semibold text-foreground mb-4">Recipe Preview</h3>

              {importedRecipe.imageUrl && (
                <div className="w-full h-64 bg-muted rounded-xl mb-4 overflow-hidden relative">
                  <Image
                    src={importedRecipe.imageUrl}
                    alt={importedRecipe.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold text-foreground mb-2">{importedRecipe.title}</h2>

              {importedRecipe.description && (
                <p className="text-muted-foreground mb-4">{importedRecipe.description}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {importedRecipe.cuisine && (
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Cuisine</p>
                    <p className="font-semibold text-foreground">{importedRecipe.cuisine}</p>
                  </div>
                )}

                {importedRecipe.difficulty && (
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="font-semibold text-foreground capitalize">
                      {importedRecipe.difficulty}
                    </p>
                  </div>
                )}

                {importedRecipe.timeMins && (
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-semibold text-foreground">{importedRecipe.timeMins} min</p>
                  </div>
                )}

                {importedRecipe.kcal && (
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="font-semibold text-foreground">{importedRecipe.kcal} kcal</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Link href={`/recipes/${importedRecipe.id}`} className="flex-1">
                  <Button className="w-full">View Full Recipe</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportedRecipe(null);
                    setUrl('');
                  }}
                  className="flex-1"
                >
                  Import Another
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">📥</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Import</h3>
                <p className="text-muted-foreground">
                  Paste a recipe URL to the left and click Import to get started.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <YouTubeImportModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onSuccess={handleYoutubeSuccess}
      />
    </div>
  );
}
