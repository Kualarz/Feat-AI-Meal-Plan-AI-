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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const ingredients: Ingredient[] = JSON.parse(recipe.ingredientsJson);

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
            <div className="w-full h-96 bg-slate-200 rounded-xl mb-6 overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-lg text-slate-600 mb-6">{recipe.description}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.cuisine && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                {recipe.cuisine}
              </span>
            )}
            {recipe.difficulty && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                {recipe.difficulty}
              </span>
            )}
            {recipe.dietTags?.split(',').map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {recipe.timeMins && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-sm text-slate-600">Time</div>
                <div className="font-semibold text-slate-900">
                  {recipe.timeMins} min
                </div>
              </div>
            )}
            {recipe.estimatedPrice && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-sm text-slate-600">Price</div>
                <div className="font-semibold text-slate-900">
                  {recipe.estimatedPrice} {recipe.currency}
                </div>
              </div>
            )}
            {recipe.kcal && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-sm text-slate-600">Calories</div>
                <div className="font-semibold text-slate-900">
                  {recipe.kcal} kcal
                </div>
              </div>
            )}
            {recipe.proteinG && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-2xl mb-1">💪</div>
                <div className="text-sm text-slate-600">Protein</div>
                <div className="font-semibold text-slate-900">
                  {recipe.proteinG}g
                </div>
              </div>
            )}
          </div>

          {/* Macros */}
          {(recipe.carbsG || recipe.fatG || recipe.fiberG || recipe.sugarG || recipe.sodiumMg) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Nutrition Facts
              </h2>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {recipe.carbsG && (
                    <div>
                      <div className="text-sm text-slate-600">Carbs</div>
                      <div className="font-semibold text-slate-900">
                        {recipe.carbsG}g
                      </div>
                    </div>
                  )}
                  {recipe.fatG && (
                    <div>
                      <div className="text-sm text-slate-600">Fat</div>
                      <div className="font-semibold text-slate-900">
                        {recipe.fatG}g
                      </div>
                    </div>
                  )}
                  {recipe.fiberG && (
                    <div>
                      <div className="text-sm text-slate-600">Fiber</div>
                      <div className="font-semibold text-slate-900">
                        {recipe.fiberG}g
                      </div>
                    </div>
                  )}
                  {recipe.sugarG && (
                    <div>
                      <div className="text-sm text-slate-600">Sugar</div>
                      <div className="font-semibold text-slate-900">
                        {recipe.sugarG}g
                      </div>
                    </div>
                  )}
                  {recipe.sodiumMg && (
                    <div>
                      <div className="text-sm text-slate-600">Sodium</div>
                      <div className="font-semibold text-slate-900">
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Ingredients
            </h2>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
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
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span
                      className={
                        checkedIngredients[index]
                          ? 'line-through text-slate-400'
                          : 'text-slate-900'
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Cooking Steps
            </h2>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{recipe.stepsMd}</ReactMarkdown>
            </div>
          </div>

          {/* Food Safety */}
          {recipe.safetyMd && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-900 mb-3">
                ⚠️ Food Safety
              </h2>
              <div className="prose prose-yellow max-w-none">
                <ReactMarkdown>{recipe.safetyMd}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Source */}
          {recipe.sourceUrl && (
            <div className="mt-6 text-sm text-slate-600">
              Source:{' '}
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700"
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
