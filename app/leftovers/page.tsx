'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { LeftoverRecipeSuggestion } from '@/lib/ai-leftovers';

export default function LeftoversPage() {
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<LeftoverRecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState('USD');

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/ai/leftovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          currency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      setSuggestions(data.recipes.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlanner = (recipe: LeftoverRecipeSuggestion) => {
    // For now, just show a message - full integration would require navigation or modal
    alert(`Add "${recipe.title}" to planner feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Leftover Optimizer</h2>
            <Link href="/groceries">
              <Button variant="outline">Go to Shopping List</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            What leftovers do you have?
          </h3>

          <form onSubmit={addIngredient} className="space-y-4 mb-6">
            <div className="flex gap-3">
              <Input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="e.g., chicken, rice, carrots"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !ingredientInput.trim()}>
                Add
              </Button>
            </div>
          </form>

          {/* Ingredient Tags */}
          {ingredients.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">
                Your leftovers ({ingredients.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    <span>{ingredient}</span>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-primary hover:text-primary/80 font-bold"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600 mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGenerateRecipes}
              disabled={loading || ingredients.length === 0}
              className="flex-1"
            >
              {loading ? 'Generating...' : 'Generate Recipe Ideas'}
            </Button>
            {ingredients.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setIngredients([])}
                disabled={loading}
              >
                Clear All
              </Button>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">
                Searching for creative recipes with your leftovers...
              </p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && suggestions.length === 0 && ingredients.length > 0 && (
          <Card>
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Click "Generate Recipe Ideas" to find recipes using your leftovers.
              </p>
            </div>
          </Card>
        )}

        {/* Recipe Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">
              Recipe Ideas Using Your Leftovers
            </h3>

            <div className="grid gap-6">
              {suggestions.map((recipe, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-2">
                        {recipe.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {recipe.why}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Cuisine</p>
                          <p className="font-medium text-foreground">{recipe.cuisine}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Difficulty</p>
                          <p className="font-medium text-foreground capitalize">
                            {recipe.difficulty}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium text-foreground">{recipe.time_mins} min</p>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Uses your leftovers:
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {recipe.ingredients_used.map((ing, i) => (
                          <span
                            key={i}
                            className="bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs"
                          >
                            ✓ {ing}
                          </span>
                        ))}
                      </div>

                      {recipe.additional_items_needed.length > 0 && (
                        <>
                          <p className="text-sm font-medium text-foreground mb-2">
                            Need to buy:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {recipe.additional_items_needed.map((item, i) => (
                              <span
                                key={i}
                                className="bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-xs"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Steps */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Steps:</p>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                        {recipe.steps}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleAddToPlanner(recipe)}
                        className="flex-1"
                      >
                        Add to Planner
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Save Recipe
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        {suggestions.length === 0 && ingredients.length === 0 && (
          <Card className="bg-muted/50">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">How it works</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>List the ingredients you have leftover in your kitchen</li>
                <li>Our AI generates creative Southeast Asian recipes using those ingredients</li>
                <li>See which recipes minimize additional purchases</li>
                <li>Add your favorite ideas to your meal planner</li>
              </ol>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
