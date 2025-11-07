'use client';

import { useState, useEffect } from 'react';
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
    maxPrice: '',
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

    if (filters.maxTime) {
      filtered = filtered.filter((r) => r.timeMins && r.timeMins <= Number(filters.maxTime));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((r) => r.estimatedPrice && r.estimatedPrice <= Number(filters.maxPrice));
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
            {tab === 'browse' && <RecipeBrowseTab recipes={filteredRecipes} loading={loading} filters={filters} handleFilterChange={handleFilterChange} handleDietToggle={handleDietToggle} youtubeModalOpen={youtubeModalOpen} setYoutubeModalOpen={setYoutubeModalOpen} />}
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
interface RecipeBrowseTabProps {
  recipes: Recipe[];
  loading: boolean;
  filters: any;
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleDietToggle: (dietType: 'vegetarian' | 'vegan' | 'halal') => void;
  youtubeModalOpen: boolean;
  setYoutubeModalOpen: (open: boolean) => void;
}

function RecipeBrowseTab({
  recipes,
  loading,
  filters,
  handleFilterChange,
  handleDietToggle,
  youtubeModalOpen,
  setYoutubeModalOpen,
}: RecipeBrowseTabProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
            <div className="space-y-4">
              <Input
                label="Search"
                type="text"
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Search recipes..."
              />

              <Select
                label="Cuisine"
                name="cuisine"
                value={filters.cuisine}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Cuisines' },
                  { value: 'Cambodian', label: 'Cambodian' },
                  { value: 'Thai', label: 'Thai' },
                  { value: 'Vietnamese', label: 'Vietnamese' },
                  { value: 'Australian', label: 'Australian' },
                  { value: 'American', label: 'American' },
                ]}
              />

              <Select
                label="Difficulty"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                options={[
                  { value: '', label: 'All Levels' },
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
              />

              {/* Dietary Preferences */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Dietary Preferences</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={filters.vegetarian}
                      onChange={() => handleDietToggle('vegetarian')}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-sm text-foreground">🥦 Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={filters.vegan}
                      onChange={() => handleDietToggle('vegan')}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-sm text-foreground">🌿 Vegan</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={filters.halal}
                      onChange={() => handleDietToggle('halal')}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                    <span className="text-sm text-foreground">🕌 Halal</span>
                  </label>
                </div>
              </div>

              <Input
                label="Max Time (minutes)"
                type="number"
                name="maxTime"
                value={filters.maxTime}
                onChange={handleFilterChange}
                placeholder="e.g., 30"
              />

              <Input
                label="Max Price ($)"
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="e.g., 5"
              />
            </div>
          </Card>
        </aside>

        {/* Recipes Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading recipes...</div>
          ) : recipes.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🍜</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {recipe.imageUrl && (
                      <div className="w-full h-48 bg-muted rounded-xl mb-4 overflow-hidden relative">
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={false}
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground mb-2">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {recipe.cuisine && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                          {recipe.cuisine}
                        </span>
                      )}
                      {recipe.difficulty && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium capitalize">
                          {recipe.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      {recipe.timeMins && <div>⏱️ {recipe.timeMins} min</div>}
                      {recipe.kcal && <div>🔥 {recipe.kcal} kcal</div>}
                      {recipe.proteinG && <div>💪 {recipe.proteinG}g protein</div>}
                      {recipe.carbsG && <div>🍚 {recipe.carbsG}g carbs</div>}
                      {recipe.fatG && <div>🥑 {recipe.fatG}g fat</div>}
                      {recipe.estimatedPrice && (
                        <div className="font-semibold text-foreground">
                          💰 ${recipe.estimatedPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
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
