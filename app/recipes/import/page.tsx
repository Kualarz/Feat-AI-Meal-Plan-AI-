'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  difficulty: string | null;
  timeMins: number | null;
  estimatedPrice: number | null;
  currency: string | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  imageUrl: string | null;
}

export default function RecipeImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [halal, setHalal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<Recipe | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Import Recipe from URL</h2>
            <Link href="/recipes">
              <Button variant="outline">← Back to Recipes</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Recipe URL
                </label>
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
                    <span className="text-sm text-foreground">
                      Vegetarian (no meat/fish)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vegan}
                      onChange={(e) => setVegan(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      Vegan (no animal products)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={halal}
                      onChange={(e) => setHalal(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">
                      Halal (no pork, no alcohol)
                    </span>
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
                💡 <strong>Tip:</strong> Our AI extracts recipe details from websites using structured recipe data.
                Works best with major recipe sites like AllRecipes, Tasty, BBC Good Food, etc.
              </p>
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

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {importedRecipe.title}
                </h2>

                {importedRecipe.description && (
                  <p className="text-muted-foreground mb-4">
                    {importedRecipe.description}
                  </p>
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
                      <p className="font-semibold text-foreground">
                        {importedRecipe.timeMins} min
                      </p>
                    </div>
                  )}

                  {importedRecipe.kcal && (
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="font-semibold text-foreground">
                        {importedRecipe.kcal} kcal
                      </p>
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
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Ready to Import
                  </h3>
                  <p className="text-muted-foreground">
                    Paste a recipe URL to the left and click Import to get started.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Three Ways to Add Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Create Manually</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your own recipes with complete details
            </p>
            <Link href="/recipes/add">
              <Button variant="outline" className="w-full text-sm">
                Go to Form
              </Button>
            </Link>
          </Card>

          <Card>
            <div className="text-4xl mb-3">📹</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">From YouTube</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Extract recipes from YouTube cooking videos
            </p>
            <Link href="/recipes">
              <Button variant="outline" className="w-full text-sm">
                Open Browser
              </Button>
            </Link>
          </Card>

          <Card>
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">From URL</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Import from any recipe website automatically
            </p>
            <Button variant="outline" className="w-full text-sm" disabled>
              You're here!
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
