'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';

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

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'time' | 'price'>('recent');
  const [filters, setFilters] = useState({
    q: '',
    cuisine: '',
    difficulty: '',
    diet: '',
    vegetarian: false,
    vegan: false,
    halal: false,
  });

  const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSavedRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/saved-recipes', {
        headers: { ...getAuthHeader() },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [savedRecipes, filters, sortBy]);

  const applyFilters = () => {
    let filtered = [...savedRecipes];

    if (filters.q) {
      filtered = filtered.filter(
        (r) =>
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
      filtered = filtered.filter(
        (r) => r.dietTags && r.dietTags.toLowerCase().includes('vegetarian')
      );
    }

    if (filters.vegan) {
      filtered = filtered.filter((r) => r.dietTags && r.dietTags.toLowerCase().includes('vegan'));
    }

    if (filters.halal) {
      filtered = filtered.filter((r) => r.dietTags && r.dietTags.toLowerCase().includes('halal'));
    }

    if (sortBy === 'time') {
      filtered.sort((a, b) => (a.timeMins || 999) - (b.timeMins || 999));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => (a.estimatedPrice || 999) - (b.estimatedPrice || 999));
    }
    // 'recent' order is preserved from API (ordered by createdAt desc)

    setFilteredRecipes(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleRemoveSaved = async (recipeId: string) => {
    // Optimistic update
    setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));

    try {
      await fetch(`/api/recipes/${recipeId}/save`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
    } catch (error) {
      console.error('Error removing saved recipe:', error);
      // Refetch to restore state on error
      fetchSavedRecipes();
    }
  };

  const uniqueCuisines = Array.from(new Set(savedRecipes.map((r) => r.cuisine).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 py-4 w-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">Saved Recipes</h2>
              <p className="text-sm text-muted-foreground">
                {filteredRecipes.length} of {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-7xl mx-auto w-full">
              <div className="flex gap-8">
                {/* Filters Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                  <Card>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Filter & Sort</h2>
                    <div className="space-y-4">
                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'recent' | 'time' | 'price')}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="recent">Recently Saved</option>
                          <option value="time">Quickest First</option>
                          <option value="price">Cheapest First</option>
                        </select>
                      </div>

                      {/* Search */}
                      <Input
                        label="Search"
                        type="text"
                        name="q"
                        value={filters.q}
                        onChange={handleFilterChange}
                        placeholder="Search recipes..."
                      />

                      {/* Cuisine */}
                      {uniqueCuisines.length > 0 && (
                        <Select
                          label="Cuisine"
                          name="cuisine"
                          value={filters.cuisine}
                          onChange={handleFilterChange}
                          options={[
                            { value: '', label: 'All Cuisines' },
                            ...uniqueCuisines.map((c) => ({ value: c || '', label: c || 'Unknown' })),
                          ]}
                        />
                      )}

                      {/* Difficulty */}
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
                        <p className="text-sm font-semibold text-foreground mb-3">
                          Dietary Preferences
                        </p>
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

                      {/* Clear Filters */}
                      {(filters.q ||
                        filters.cuisine ||
                        filters.difficulty ||
                        filters.vegetarian ||
                        filters.vegan ||
                        filters.halal) && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setFilters({
                              q: '',
                              cuisine: '',
                              difficulty: '',
                              diet: '',
                              vegetarian: false,
                              vegan: false,
                              halal: false,
                            })
                          }
                          className="w-full text-sm"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </Card>
                </aside>

                {/* Recipes Grid */}
                <div className="flex-1">
                  {loading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading your saved recipes...
                    </div>
                  ) : savedRecipes.length === 0 ? (
                    <Card className="text-center py-12">
                      <div className="text-6xl mb-4">❤️</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No saved recipes yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start saving your favorite recipes from the recipe browser
                      </p>
                      <Link href="/recipes">
                        <Button>Browse Recipes</Button>
                      </Link>
                    </Card>
                  ) : filteredRecipes.length === 0 ? (
                    <Card className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No recipes match your filters</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredRecipes.map((recipe) => (
                        <div key={recipe.id}>
                          <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                            {recipe.imageUrl && (
                              <Link href={`/recipes/${recipe.id}`}>
                                <div className="w-full h-48 bg-muted rounded-xl mb-4 overflow-hidden relative cursor-pointer">
                                  <Image
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    priority={false}
                                  />
                                </div>
                              </Link>
                            )}

                            <div className="flex-1 flex flex-col">
                              <Link href={`/recipes/${recipe.id}`}>
                                <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                                  {recipe.title}
                                </h3>
                              </Link>

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

                              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                                {recipe.timeMins && <div>⏱️ {recipe.timeMins} min</div>}
                                {recipe.kcal && <div>🔥 {recipe.kcal} kcal</div>}
                                {recipe.proteinG && <div>💪 {recipe.proteinG}g protein</div>}
                                {recipe.estimatedPrice && (
                                  <div className="font-semibold text-foreground">
                                    💰 ${recipe.estimatedPrice.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="mt-auto flex gap-2">
                                <Link href={`/recipes/${recipe.id}`} className="flex-1">
                                  <Button className="w-full">View</Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  onClick={() => handleRemoveSaved(recipe.id)}
                                  className="px-3"
                                  title="Remove from saved"
                                >
                                  ❌
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
