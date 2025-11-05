'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';

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
  imageUrl: string | null;
  tags: string | null;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    cuisine: '',
    diet: '',
    maxTime: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/recipes?${params}`);
      const data = await response.json();
      setRecipes(data.recipes);
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

  const applyFilters = () => {
    loadRecipes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">eatr-vibe</h1>
            <div className="flex gap-4">
              <Link href="/planner">
                <Button variant="outline">Planner</Button>
              </Link>
              <Link href="/groceries">
                <Button variant="outline">Groceries</Button>
              </Link>
              <Link href="/setup">
                <Button variant="secondary">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Filters
              </h2>

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
                    { value: 'Malaysian', label: 'Malaysian' },
                    { value: 'Indonesian', label: 'Indonesian' },
                  ]}
                />

                <Select
                  label="Diet"
                  name="diet"
                  value={filters.diet}
                  onChange={handleFilterChange}
                  options={[
                    { value: '', label: 'All Diets' },
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'vegan', label: 'Vegan' },
                    { value: 'halal', label: 'Halal' },
                    { value: 'pescatarian', label: 'Pescatarian' },
                  ]}
                />

                <Input
                  label="Max Time (minutes)"
                  type="number"
                  name="maxTime"
                  value={filters.maxTime}
                  onChange={handleFilterChange}
                  placeholder="e.g., 30"
                />

                <Input
                  label="Max Price"
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="e.g., 50000"
                />

                <Button
                  variant="primary"
                  onClick={applyFilters}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Recipes Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-slate-900">
                Browse Recipes
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-600">
                Loading recipes...
              </div>
            ) : recipes.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🍜</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-slate-600">
                  Try generating a meal plan to create some recipes
                </p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      {recipe.imageUrl && (
                        <div className="w-full h-48 bg-slate-200 rounded-xl mb-4 overflow-hidden">
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {recipe.title}
                      </h3>
                      {recipe.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {recipe.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {recipe.cuisine && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                            {recipe.cuisine}
                          </span>
                        )}
                        {recipe.dietTags?.split(',').map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1 text-sm text-slate-600">
                        {recipe.timeMins && (
                          <div>⏱️ {recipe.timeMins} min</div>
                        )}
                        {recipe.kcal && <div>🔥 {recipe.kcal} kcal</div>}
                        {recipe.proteinG && (
                          <div>💪 {recipe.proteinG}g protein</div>
                        )}
                        {recipe.estimatedPrice && (
                          <div>
                            💰 {recipe.estimatedPrice} {recipe.currency}
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
    </div>
  );
}
