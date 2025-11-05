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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    cuisine: '',
    difficulty: '',
    diet: '',
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

    if (filters.maxTime) {
      filtered = filtered.filter((r) => r.timeMins && r.timeMins <= Number(filters.maxTime));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((r) => r.estimatedPrice && r.estimatedPrice <= Number(filters.maxPrice));
    }

    setFilteredRecipes(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-foreground">Browse Recipes</h2>
            <div className="flex gap-4 flex-wrap">
              <Link href="/recipes/import">
                <Button variant="outline">🔗 Import from URL</Button>
              </Link>
              <Button onClick={() => setYoutubeModalOpen(true)} variant="outline">
                📹 Import from YouTube
              </Button>
              <Link href="/recipes/add">
                <Button>+ Add Recipe</Button>
              </Link>
              <Link href="/planner">
                <Button variant="outline">Planner</Button>
              </Link>
              <Link href="/groceries">
                <Button variant="outline">Groceries</Button>
              </Link>
              <Link href="/setup">
                <Button variant="outline">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <YouTubeImportModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onSuccess={handleYoutubeImportSuccess}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">
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
              <div className="text-center py-12 text-muted-foreground">
                Loading recipes...
              </div>
            ) : filteredRecipes.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🍜</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No recipes found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters
                </p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
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
                      <h3 className="font-semibold text-foreground mb-2">
                        {recipe.title}
                      </h3>
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
                        {recipe.timeMins && (
                          <div>⏱️ {recipe.timeMins} min</div>
                        )}
                        {recipe.kcal && <div>🔥 {recipe.kcal} kcal</div>}
                        {recipe.proteinG && (
                          <div>💪 {recipe.proteinG}g protein</div>
                        )}
                        {recipe.carbsG && (
                          <div>🍚 {recipe.carbsG}g carbs</div>
                        )}
                        {recipe.fatG && (
                          <div>🥑 {recipe.fatG}g fat</div>
                        )}
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
    </div>
  );
}
