'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  notes?: string;
}

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
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  ingredientsJson: string;
  stepsMd: string;
  safetyMd: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  tags: string | null;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  const loadRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${params.id}`);
      if (!response.ok) {
        throw new Error('Recipe not found');
      }
      const data = await response.json();
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
      alert('Recipe not found');
      router.push('/recipes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const ingredients: Ingredient[] = JSON.parse(recipe.ingredientsJson);

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
              <Link href="/groceries">
                <Button variant="outline">Groceries</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <Card>
          {recipe.imageUrl && (
            <div className="w-full h-96 bg-muted rounded-xl mb-6 overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.cuisine && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                {recipe.cuisine}
              </span>
            )}
            {recipe.difficulty && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                {recipe.difficulty}
              </span>
            )}
            {recipe.dietTags?.split(',').map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {recipe.timeMins && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-sm text-muted-foreground">Time</div>
                <div className="font-semibold text-foreground">
                  {recipe.timeMins} min
                </div>
              </div>
            )}
            {recipe.estimatedPrice && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-semibold text-foreground">
                  {recipe.estimatedPrice} {recipe.currency}
                </div>
              </div>
            )}
            {recipe.kcal && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-sm text-muted-foreground">Calories</div>
                <div className="font-semibold text-foreground">
                  {recipe.kcal} kcal
                </div>
              </div>
            )}
            {recipe.proteinG && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="text-2xl mb-1">💪</div>
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="font-semibold text-foreground">
                  {recipe.proteinG}g
                </div>
              </div>
            )}
          </div>

          {/* Macros */}
          {(recipe.carbsG || recipe.fatG || recipe.fiberG || recipe.sugarG || recipe.sodiumMg) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Nutrition Facts
              </h2>
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {recipe.carbsG && (
                    <div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                      <div className="font-semibold text-foreground">
                        {recipe.carbsG}g
                      </div>
                    </div>
                  )}
                  {recipe.fatG && (
                    <div>
                      <div className="text-sm text-muted-foreground">Fat</div>
                      <div className="font-semibold text-foreground">
                        {recipe.fatG}g
                      </div>
                    </div>
                  )}
                  {recipe.fiberG && (
                    <div>
                      <div className="text-sm text-muted-foreground">Fiber</div>
                      <div className="font-semibold text-foreground">
                        {recipe.fiberG}g
                      </div>
                    </div>
                  )}
                  {recipe.sugarG && (
                    <div>
                      <div className="text-sm text-muted-foreground">Sugar</div>
                      <div className="font-semibold text-foreground">
                        {recipe.sugarG}g
                      </div>
                    </div>
                  )}
                  {recipe.sodiumMg && (
                    <div>
                      <div className="text-sm text-muted-foreground">Sodium</div>
                      <div className="font-semibold text-foreground">
                        {recipe.sodiumMg}mg
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ingredients
            </h2>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <input
                    type="checkbox"
                    checked={checkedIngredients[index] || false}
                    onChange={(e) =>
                      setCheckedIngredients((prev) => ({
                        ...prev,
                        [index]: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span
                      className={
                        checkedIngredients[index]
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }
                    >
                      {ingredient.qty && ingredient.unit
                        ? `${ingredient.qty} ${ingredient.unit} `
                        : ''}
                      {ingredient.name}
                      {ingredient.notes && ` (${ingredient.notes})`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Cooking Steps
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{recipe.stepsMd}</ReactMarkdown>
            </div>
          </div>

          {/* Food Safety */}
          {recipe.safetyMd && (
            <div className="bg-warning/10 border border-warning rounded-xl p-6">
              <h2 className="text-xl font-bold text-warning mb-3">
                ⚠️ Food Safety
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{recipe.safetyMd}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Source */}
          {recipe.sourceUrl && (
            <div className="mt-6 text-sm text-muted-foreground">
              Source:{' '}
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:opacity-80"
              >
                {recipe.sourceUrl}
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
