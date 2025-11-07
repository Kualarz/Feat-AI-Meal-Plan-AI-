'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';
import { AddToPlannerModal } from '@/components/AddToPlannerModal';

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
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  useEffect(() => {
    if (recipe) {
      checkIfSaved();
      loadUserRating();
      loadSimilarRecipes();
    }
  }, [recipe]);

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

  const checkIfSaved = () => {
    if (!recipe) return;
    const saved = localStorage.getItem('savedRecipes');
    const savedIds = saved ? JSON.parse(saved) : [];
    setIsSaved(savedIds.includes(recipe.id));
  };

  const toggleSaveRecipe = () => {
    if (!recipe) return;
    const saved = localStorage.getItem('savedRecipes');
    let savedIds = saved ? JSON.parse(saved) : [];

    if (isSaved) {
      savedIds = savedIds.filter((id: string) => id !== recipe.id);
      setSuccessMessage('Recipe removed from saved');
    } else {
      savedIds.push(recipe.id);
      setSuccessMessage('Recipe saved successfully!');
    }

    localStorage.setItem('savedRecipes', JSON.stringify(savedIds));
    setIsSaved(!isSaved);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const loadUserRating = () => {
    if (!recipe) return;
    const ratings = localStorage.getItem('recipeRatings');
    const ratingMap = ratings ? JSON.parse(ratings) : {};
    setUserRating(ratingMap[recipe.id] || 0);
  };

  const setRating = (rating: number) => {
    if (!recipe) return;
    const ratings = localStorage.getItem('recipeRatings');
    const ratingMap = ratings ? JSON.parse(ratings) : {};
    ratingMap[recipe.id] = rating;
    localStorage.setItem('recipeRatings', JSON.stringify(ratingMap));
    setUserRating(rating);
    setSuccessMessage(`Rated ${rating}/5 stars!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const loadSimilarRecipes = async () => {
    if (!recipe) return;
    try {
      setLoadingSimilar(true);
      const response = await fetch(`/api/recipes?cuisine=${recipe.cuisine}&limit=3&excludeId=${recipe.id}`);
      if (response.ok) {
        const data = await response.json();
        setSimilarRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error loading similar recipes:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async (platform: string) => {
    if (!recipe) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out this recipe: ${recipe.title}`;

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setSuccessMessage('Link copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch {
        alert('Failed to copy link');
      }
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  ← Back
                </Button>
                {recipe && (
                  <>
                    <Button
                      onClick={() => setPlannerModalOpen(true)}
                      className="flex-1"
                    >
                      📅 Add to Planner
                    </Button>
                    <Button
                      variant={isSaved ? 'primary' : 'outline'}
                      onClick={toggleSaveRecipe}
                    >
                      {isSaved ? '❤️ Saved' : '🤍 Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                    >
                      🖨️ Print
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        onClick={() => handleShare('copy')}
                        title="Copy link"
                        className="px-3"
                      >
                        🔗
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShare('twitter')}
                        title="Share on Twitter"
                        className="px-3"
                      >
                        𝕏
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleShare('facebook')}
                        title="Share on Facebook"
                        className="px-3"
                      >
                        f
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <Card>
          {recipe.imageUrl && (
            <div className="w-full h-96 bg-muted rounded-xl mb-6 overflow-hidden relative">
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
                priority={true}
              />
            </div>
          )}

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>
          )}

          {/* Rating Section */}
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                      {star <= userRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              {userRating > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Your rating</p>
                  <p className="text-2xl font-bold text-primary">{userRating}/5</p>
                </div>
              )}
            </div>
          </div>

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

              {/* Nutritional Chart */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Macro Breakdown</h3>
                <div className="space-y-4">
                  {recipe.carbsG && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Carbohydrates</span>
                        <span className="text-muted-foreground">{recipe.carbsG}g</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((recipe.carbsG / 100) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {recipe.fatG && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Fat</span>
                        <span className="text-muted-foreground">{recipe.fatG}g</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((recipe.fatG / 100) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {recipe.proteinG && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Protein</span>
                        <span className="text-muted-foreground">{recipe.proteinG}g</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((recipe.proteinG / 100) * 100, 100)}%`,
                          }}
                        ></div>
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

              {/* Similar Recipes */}
              {similarRecipes.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Similar Recipes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarRecipes.map((similarRecipe) => (
                      <Link key={similarRecipe.id} href={`/recipes/${similarRecipe.id}`}>
                        <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                          {similarRecipe.imageUrl && (
                            <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden relative mb-4">
                              <Image
                                src={similarRecipe.imageUrl}
                                alt={similarRecipe.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {similarRecipe.title}
                            </h3>
                            <div className="flex gap-2 mb-3">
                              {similarRecipe.timeMins && (
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                  ⏱️ {similarRecipe.timeMins}min
                                </span>
                              )}
                              {similarRecipe.kcal && (
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                  🔥 {similarRecipe.kcal}kcal
                                </span>
                              )}
                            </div>
                            <Button variant="outline" className="w-full">
                              View Recipe →
                            </Button>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="fixed bottom-6 right-6 bg-success text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
                  {successMessage}
                </div>
              )}

              {/* Add to Planner Modal */}
              {recipe && (
                <AddToPlannerModal
                  isOpen={plannerModalOpen}
                  recipeId={recipe.id}
                  recipeName={recipe.title}
                  onClose={() => setPlannerModalOpen(false)}
                  onSuccess={(message) => {
                    setSuccessMessage(message);
                    setPlannerModalOpen(false);
                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
