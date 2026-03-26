'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  cookwareJson: string | null;
  stepsMd: string;
  safetyMd: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  tags: string | null;
}

// Map cuisine to flag emoji for the origin badge
const cuisineFlags: Record<string, string> = {
  Cambodian: '🇰🇭',
  Thai: '🇹🇭',
  Vietnamese: '🇻🇳',
  Australian: '🇦🇺',
  American: '🇺🇸',
  Malaysian: '🇲🇾',
  Indian: '🇮🇳',
  Italian: '🇮🇹',
  Mexican: '🇲🇽',
  Chinese: '🇨🇳',
  Japanese: '🇯🇵',
  Korean: '🇰🇷',
};

// Map cuisine to a short origin description
const cuisineOrigins: Record<string, string> = {
  Cambodian: 'A beloved dish from the Kingdom of Cambodia, known for its balance of sweet, sour, salty, and bitter flavors rooted in Khmer culinary traditions.',
  Thai: 'From the vibrant kitchens of Thailand, this dish showcases the iconic Thai balance of spicy, sour, sweet, and savory.',
  Vietnamese: 'A gem of Vietnamese cuisine, celebrated for its fresh herbs, clean flavors, and the harmony of textures that define the country\'s food culture.',
  Australian: 'A taste of Australia, reflecting the country\'s love for fresh, high-quality local produce and relaxed cooking style.',
  American: 'An American classic that embodies the bold, hearty comfort-food traditions of the United States.',
  Malaysian: 'From the multicultural kitchens of Malaysia, blending Malay, Chinese, and Indian culinary influences.',
  Indian: 'A staple of Indian cuisine, rich with aromatic spices and centuries of culinary heritage.',
  Italian: 'From the heart of Italy, where simple, fresh ingredients are transformed into unforgettable dishes.',
  Mexican: 'A vibrant creation from Mexico, bursting with bold chili flavors, fresh herbs, and ancient culinary traditions.',
  Chinese: 'From the diverse regions of China, showcasing techniques and flavors refined over thousands of years.',
  Japanese: 'A refined Japanese dish that embodies the principles of balance, seasonality, and umami.',
  Korean: 'From Korea\'s dynamic food culture, known for its bold fermented flavors and communal dining traditions.',
};

// Map cookware names to icons
const cookwareIcons: Record<string, string> = {
  wok: '🥘',
  pan: '🍳',
  skillet: '🍳',
  pot: '🫕',
  stockpot: '🫕',
  saucepan: '🫕',
  oven: '♨️',
  toaster: '♨️',
  grill: '🔥',
  knife: '🔪',
  board: '🪵',
  bowl: '🥣',
  whisk: '🥄',
  spatula: '🥄',
  spoon: '🥄',
  ladle: '🥄',
  mixer: '⚡',
  strainer: '🧊',
  colander: '🧊',
  tray: '📐',
  foil: '📄',
  brush: '🖌️',
  rack: '📐',
  grater: '🧀',
  pestle: '⚗️',
  mortar: '⚗️',
  steamer: '♨️',
  paper: '📄',
  dish: '🍽️',
  towel: '🧻',
  zester: '🍋',
  skimmer: '🥄',
  boiler: '🫕',
};

function getCookwareIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(cookwareIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '🔧';
}

// Map ingredient names to mini icons
const ingredientIcons: Record<string, string> = {
  beef: '🥩', pork: '🥩', ribs: '🥩', steak: '🥩', lamb: '🥩',
  chicken: '🍗', turkey: '🍗',
  fish: '🐟', salmon: '🐟', barramundi: '🐟', snapper: '🐟', tuna: '🐟',
  shrimp: '🦐', prawn: '🦐', squid: '🦑',
  egg: '🥚', eggs: '🥚',
  rice: '🍚', noodle: '🍜', pasta: '🍝', vermicelli: '🍜',
  bread: '🍞', baguette: '🥖', bun: '🍔',
  tomato: '🍅', cucumber: '🥒', onion: '🧅', garlic: '🧄',
  potato: '🥔', carrot: '🥕', broccoli: '🥦', eggplant: '🍆',
  pepper: '🌶️', chili: '🌶️', chilli: '🌶️',
  lettuce: '🥬', bean: '🫘', pea: '🫛', asparagus: '🌿',
  mushroom: '🍄',
  lemon: '🍋', lime: '🍋', orange: '🍊',
  coconut: '🥥', peanut: '🥜',
  cheese: '🧀', butter: '🧈', cream: '🥛', milk: '🥛', yogurt: '🥛',
  flour: '🌾', cornmeal: '🌽', sugar: '🍬', honey: '🍯',
  chocolate: '🍫', strawberr: '🍓', blueberr: '🫐', raspberr: '🫐', berr: '🫐',
  oil: '🫒', olive: '🫒',
  salt: '🧂', vinegar: '🫗',
  ginger: '🫚', lemongrass: '🌿', basil: '🌿', herb: '🌿', cilantro: '🌿',
  dill: '🌿', parsley: '🌿', mint: '🌿',
  soy: '🥫', sauce: '🥫', paste: '🥫', stock: '🥫', ketchup: '🥫', mustard: '🟡',
  water: '💧',
  tofu: '🟫',
  papaya: '🥭',
  corn: '🌽',
  vanilla: '🌸',
  baking: '🧪',
};

function getIngredientIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ingredientIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '🥄';
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30';
    case 'medium': return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
    case 'hard': return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
    default: return 'bg-primary/10 text-primary border-primary/30';
  }
}

/** Parse stepsMd into individual numbered steps */
function parseSteps(stepsMd: string): { section: string | null; steps: string[] }[] {
  // Handle both real newlines and literal \n from the database
  // First replace literal backslash-n with real newlines, then split
  const normalized = stepsMd.replace(/\\n/g, '\n');
  const lines = normalized.split('\n').filter((l) => l.trim());
  const sections: { section: string | null; steps: string[] }[] = [];
  let current: { section: string | null; steps: string[] } = { section: null, steps: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    // Check if it's a section header (like "For Ribs:" or "For Cornbread:")
    if (/^(for\s+.+):$/i.test(trimmed)) {
      if (current.steps.length > 0 || current.section) {
        sections.push(current);
      }
      current = { section: trimmed.replace(/:$/, ''), steps: [] };
    } else {
      // Remove leading number and period/dot
      const stepText = trimmed.replace(/^\d+\.\s*/, '');
      if (stepText) current.steps.push(stepText);
    }
  }
  if (current.steps.length > 0 || current.section) {
    sections.push(current);
  }
  return sections;
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
      const response = await fetch(`/api/recipes?cuisine=${recipe.cuisine}&limit=3&excludeId=${recipe.id}`);
      if (response.ok) {
        const data = await response.json();
        setSimilarRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error loading similar recipes:', error);
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const ingredients: Ingredient[] = JSON.parse(recipe.ingredientsJson);
  const cookware: string[] = recipe.cookwareJson ? JSON.parse(recipe.cookwareJson) : [];
  const stepSections = parseSteps(recipe.stepsMd);
  const flag = recipe.cuisine ? cuisineFlags[recipe.cuisine] || '🍽️' : '🍽️';
  const originDescription = recipe.cuisine ? cuisineOrigins[recipe.cuisine] || '' : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* ─── Hero Section ─── */}
            <div className="relative">
              {recipe.imageUrl ? (
                <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden">
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
              )}

              {/* Back button floating on hero */}
              <div className="absolute top-4 left-4 md:left-8">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-background/80 backdrop-blur-sm border-border/50 shadow-lg"
                >
                  ← Back
                </Button>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {recipe.cuisine && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                        <span className="text-base">{flag}</span>
                        {recipe.cuisine}
                      </span>
                    )}
                    {recipe.difficulty && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                      </span>
                    )}
                    {recipe.timeMins && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-background/80 backdrop-blur-sm text-foreground rounded-full text-sm font-medium border border-border/50 shadow-sm">
                        ⏱️ {recipe.timeMins} min
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground drop-shadow-sm">
                    {recipe.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* ─── Content ─── */}
            <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setPlannerModalOpen(true)}
                  className="flex-1 min-w-[140px]"
                >
                  📅 Add to Planner
                </Button>
                <Button
                  variant={isSaved ? 'primary' : 'outline'}
                  onClick={toggleSaveRecipe}
                >
                  {isSaved ? '❤️ Saved' : '🤍 Save'}
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  🖨️ Print
                </Button>
                <div className="flex gap-1">
                  <Button variant="outline" onClick={() => handleShare('copy')} title="Copy link" className="px-3">🔗</Button>
                  <Button variant="outline" onClick={() => handleShare('twitter')} title="Share on Twitter" className="px-3">𝕏</Button>
                  <Button variant="outline" onClick={() => handleShare('facebook')} title="Share on Facebook" className="px-3">f</Button>
                </div>
              </div>

              {/* ─── About This Dish ─── */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">📖</span>
                  About This Dish
                </h2>
                <Card>
                  {recipe.description && (
                    <p className="text-lg text-foreground leading-relaxed mb-4">
                      {recipe.description}
                    </p>
                  )}
                  {recipe.cuisine && originDescription && (
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-3xl mt-0.5">{flag}</span>
                      <div>
                        <p className="text-sm font-semibold text-primary mb-1">Origin: {recipe.cuisine} Cuisine</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{originDescription}</p>
                      </div>
                    </div>
                  )}

                  {/* Diet & Tags */}
                  {recipe.dietTags && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {recipe.dietTags.split(',').map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </section>

              {/* ─── Quick Stats ─── */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">📊</span>
                  Quick Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recipe.timeMins && (
                    <div className="bg-card rounded-2xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                      <div className="text-3xl mb-2">⏱️</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cook Time</div>
                      <div className="text-xl font-bold text-foreground">{recipe.timeMins} min</div>
                    </div>
                  )}
                  {recipe.estimatedPrice != null && (
                    <div className="bg-card rounded-2xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Est. Price</div>
                      <div className="text-xl font-bold text-foreground">
                        {recipe.estimatedPrice} {recipe.currency}
                      </div>
                    </div>
                  )}
                  {recipe.kcal && (
                    <div className="bg-card rounded-2xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                      <div className="text-3xl mb-2">🔥</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Calories</div>
                      <div className="text-xl font-bold text-foreground">{recipe.kcal} kcal</div>
                    </div>
                  )}
                  {recipe.proteinG && (
                    <div className="bg-card rounded-2xl p-5 border border-border text-center hover:border-primary/30 transition-colors">
                      <div className="text-3xl mb-2">💪</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Protein</div>
                      <div className="text-xl font-bold text-foreground">{recipe.proteinG}g</div>
                    </div>
                  )}
                </div>
              </section>

              {/* ─── Nutrition Facts ─── */}
              {(recipe.carbsG || recipe.fatG || recipe.fiberG || recipe.sugarG || recipe.sodiumMg) && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🥗</span>
                    Nutrition Facts
                  </h2>
                  <Card>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                      {recipe.carbsG && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{recipe.carbsG}g</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Carbs</div>
                        </div>
                      )}
                      {recipe.fatG && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{recipe.fatG}g</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Fat</div>
                        </div>
                      )}
                      {recipe.fiberG && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{recipe.fiberG}g</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Fiber</div>
                        </div>
                      )}
                      {recipe.sugarG && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{recipe.sugarG}g</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Sugar</div>
                        </div>
                      )}
                      {recipe.sodiumMg && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{recipe.sodiumMg}mg</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Sodium</div>
                        </div>
                      )}
                    </div>

                    {/* Macro Bars */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Macro Breakdown</h3>
                      {recipe.carbsG && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">Carbohydrates</span>
                            <span className="text-muted-foreground font-medium">{recipe.carbsG}g</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((recipe.carbsG / 100) * 100, 100)}%` }} />
                          </div>
                        </div>
                      )}
                      {recipe.fatG && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">Fat</span>
                            <span className="text-muted-foreground font-medium">{recipe.fatG}g</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((recipe.fatG / 100) * 100, 100)}%` }} />
                          </div>
                        </div>
                      )}
                      {recipe.proteinG && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">Protein</span>
                            <span className="text-muted-foreground font-medium">{recipe.proteinG}g</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5">
                            <div className="bg-rose-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((recipe.proteinG / 100) * 100, 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </section>
              )}

              {/* ─── Ingredients ─── */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🧾</span>
                  Ingredients
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {ingredients.length} items
                  </span>
                </h2>
                <Card>
                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors group"
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
                          className="w-5 h-5 mt-0.5 rounded-md border-border text-primary focus:ring-primary accent-[hsl(var(--primary))]"
                        />
                        <span className="text-xl flex-shrink-0 mt-0.5 w-7 text-center">{getIngredientIcon(ingredient.name)}</span>
                        <div className="flex-1">
                          <span
                            className={`transition-all duration-200 ${
                              checkedIngredients[index]
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {ingredient.qty && ingredient.unit
                              ? <><span className="font-semibold">{ingredient.qty} {ingredient.unit}</span>{' '}</>
                              : ''}
                            {ingredient.name}
                          </span>
                          {ingredient.notes && (
                            <span className="text-xs text-muted-foreground ml-1">({ingredient.notes})</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              </section>

              {/* ─── Cookware Needed ─── */}
              {cookware.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🍳</span>
                    Cookware Needed
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {cookware.map((item, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-card rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                      >
                        <span className="text-xl">{getCookwareIcon(item)}</span>
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ─── Cooking Steps ─── */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">👨‍🍳</span>
                  Step-by-Step Instructions
                </h2>
                <div className="space-y-6">
                  {stepSections.map((section, sIdx) => (
                    <div key={sIdx}>
                      {section.section && (
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-primary rounded-full" />
                          {section.section}
                        </h3>
                      )}
                      <div className="space-y-3">
                        {section.steps.map((step, index) => (
                          <div
                            key={index}
                            className="flex gap-4 group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                              {index + 1}
                            </div>
                            <div className="flex-1 pt-2">
                              <p className="text-foreground leading-relaxed">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ─── Food Safety ─── */}
              {recipe.safetyMd && (
                <section>
                  <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-warning mb-3 flex items-center gap-2">
                      ⚠️ Food Safety
                    </h2>
                    <p className="text-foreground leading-relaxed">{recipe.safetyMd}</p>
                  </div>
                </section>
              )}

              {/* ─── Rating ─── */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">⭐</span>
                  Rate This Recipe
                </h2>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Tap a star to rate</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="text-3xl cursor-pointer hover:scale-125 transition-transform duration-150"
                          >
                            {star <= userRating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {userRating > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Your rating</p>
                        <p className="text-3xl font-bold text-primary">{userRating}/5</p>
                      </div>
                    )}
                  </div>
                </Card>
              </section>

              {/* ─── Source ─── */}
              {recipe.sourceUrl && (
                <div className="text-sm text-muted-foreground">
                  Source:{' '}
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:opacity-80 underline underline-offset-2"
                  >
                    {recipe.sourceUrl}
                  </a>
                </div>
              )}

              {/* ─── Similar Recipes ─── */}
              {similarRecipes.length > 0 && (
                <section className="pt-4">
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🍜</span>
                    Similar Recipes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarRecipes.map((similarRecipe) => (
                      <Link key={similarRecipe.id} href={`/recipes/${similarRecipe.id}`}>
                        <Card className="h-full cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-200">
                          {similarRecipe.imageUrl && (
                            <div className="w-full h-40 bg-muted rounded-xl overflow-hidden relative mb-4">
                              <Image
                                src={similarRecipe.imageUrl}
                                alt={similarRecipe.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {similarRecipe.title}
                          </h3>
                          <div className="flex gap-2 mb-3">
                            {similarRecipe.timeMins && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                ⏱️ {similarRecipe.timeMins}min
                              </span>
                            )}
                            {similarRecipe.kcal && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                🔥 {similarRecipe.kcal}kcal
                              </span>
                            )}
                          </div>
                          <Button variant="outline" className="w-full">
                            View Recipe →
                          </Button>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-6 py-3 rounded-xl shadow-2xl animate-pulse z-50">
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
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
}
