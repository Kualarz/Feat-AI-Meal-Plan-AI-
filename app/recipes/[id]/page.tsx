'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { AddToPlannerModal } from '@/components/AddToPlannerModal';
import { IngredientDetailModal } from '@/components/IngredientDetailModal';
import {
  Heart, Bookmark, Check, Clock, Flame, DollarSign, Star,
  ArrowLeft, Sparkles, ChefHat, Share2, MoreHorizontal,
  Beef, Wheat, Droplets, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRecipePrice, getCurrencySymbol } from '@/lib/currency';

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
  rating: number | null;
}

const cuisineFlags: Record<string, string> = {
  Cambodian: '🇰🇭', Thai: '🇹🇭', Vietnamese: '🇻🇳', Australian: '🇦🇺',
  American: '🇺🇸', Malaysian: '🇲🇾', Indian: '🇮🇳', Italian: '🇮🇹',
  Mexican: '🇲🇽', Chinese: '🇨🇳', Japanese: '🇯🇵', Korean: '🇰🇷',
  French: '🇫🇷', Spanish: '🇪🇸', Greek: '🇬🇷', Lebanese: '🇱🇧',
  Turkish: '🇹🇷', Moroccan: '🇲🇦', Ethiopian: '🇪🇹', Nigerian: '🇳🇬',
  Brazilian: '🇧🇷', Peruvian: '🇵🇪',
};

const cuisineOrigins: Record<string, string> = {
  Cambodian: 'Cambodia — the Kingdom of Wonder — has one of Southeast Asia\'s most underrated food traditions. Khmer cuisine balances sweet, sour, salty, and bitter in a single dish, often built on a fragrant paste of lemongrass, galangal, and turmeric called kroeung. Meals are eaten family-style, with rice at the center of every table.',
  Thai: 'Thai cuisine is world-famous for its explosive, layered flavors — the burn of fresh chilies, the brightness of lime, the depth of fish sauce, and the sweetness of palm sugar all at once. Each region has its own identity: fiery curries in the south, herbal soups in the north, and stir-fries in the bustling central plains.',
  Vietnamese: 'Vietnamese cooking is defined by freshness, balance, and restraint. Dishes are built around a harmony of textures — tender meats, crunchy pickled vegetables, and silky broths — with a generous hand of fresh herbs. The French colonial era left a lasting mark in the form of baguettes and strong coffee.',
  Italian: 'Italian food is the art of elevating simple, high-quality ingredients. Each of Italy\'s 20 regions has its own distinct culinary identity: creamy risottos in the north, wood-fired pizzas in Naples, seafood on the coasts, and cured meats in the rolling hills of Tuscany. The golden rule is never to overcomplicate.',
  Japanese: 'Japanese cuisine is guided by the philosophy of washoku — harmony, balance, and respect for seasonality. The concept of umami, the deeply savory fifth taste, is central to everything from miso to aged soy sauce. Presentation is considered as important as flavor, and every ingredient is treated with near-ceremonial care.',
  Mexican: 'Mexican cuisine is one of only two in the world recognized by UNESCO as an Intangible Cultural Heritage. It traces back thousands of years to the Aztec and Mayan civilizations, with corn, chili, and cacao at its core. The complex, earthy sauces known as moles can contain over thirty ingredients and take days to prepare.',
  Indian: 'Indian cooking is a vast tapestry of regional flavors, spice traditions, and ancient techniques. The north favors rich, dairy-based curries and tandoor-baked breads; the south leans on coconut, tamarind, and fiery pepper. Ayurvedic principles have shaped Indian food philosophy for millennia, treating spices as medicine as much as flavor.',
  Chinese: 'Chinese cuisine encompasses eight distinct culinary traditions — from the numbing spice of Sichuan to the delicate dim sum of Cantonese kitchens. With over 5,000 years of culinary history, China developed techniques like stir-frying, steaming, and fermenting that influenced much of Asian cooking. Ingredients are chosen for both flavor and their perceived health properties.',
  Korean: 'Korean food is built on the art of fermentation. Kimchi, doenjang (fermented soybean paste), and gochujang (chili paste) are pantry essentials that can take months or years to develop their full flavor. Meals are communal affairs with multiple small dishes called banchan surrounding a central bowl of rice or soup.',
  Malaysian: 'Malaysian cuisine is a beautiful collision of Malay, Chinese, and Indian food cultures, shaped by centuries of spice trade and migration. Coconut milk, lemongrass, pandan, and belacan (shrimp paste) are the building blocks of countless dishes. Hawker culture — eating from open-air street stalls — is central to daily Malaysian life.',
  American: 'American cooking is a melting pot of immigrant traditions that evolved into its own distinct identity — from Southern BBQ slow-smoked over hardwood, to New England clam chowder, to the California obsession with fresh, local produce. Comfort food runs deep in the culture, with recipes passed through generations as acts of love.',
};

const ingredientIcons: Record<string, string> = {
  beef: '🥩', chicken: '🍗', pork: '🥩', fish: '🐟', shrimp: '🦐', egg: '🥚',
  rice: '🍚', noodle: '🍜', pasta: '🍝', bread: '🍞', flour: '🌾',
  tomato: '🍅', onion: '🧅', garlic: '🧄', pepper: '🌶️', carrot: '🥕',
  lemon: '🍋', lime: '🍋', coconut: '🥥', milk: '🥛', cream: '🥛',
  butter: '🧈', oil: '🫒', salt: '🧂', sugar: '🍬', ginger: '🫚',
  avocado: '🥑', mushroom: '🍄', spinach: '🥬', potato: '🥔',
  soy: '🫙', cheese: '🧀', yogurt: '🥛', cilantro: '🌿', basil: '🌿',
  cumin: '🫙', turmeric: '🟡', coriander: '🌿', paprika: '🌶️',
};

function getIngredientIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ingredientIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '🥄';
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
    case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'hard': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    default: return 'bg-brand-green/10 text-brand-green border-brand-green/20';
  }
};

function parseSteps(stepsMd: string): { section: string | null; steps: string[] }[] {
  const normalized = stepsMd.replace(/\\n/g, '\n');
  const lines = normalized.split('\n').filter((l) => l.trim());
  const sections: { section: string | null; steps: string[] }[] = [];
  let current: { section: string | null; steps: string[] } = { section: null, steps: [] };
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(for\s+.+|prep|cook|serve|finish):?$/i.test(trimmed)) {
      if (current.steps.length > 0 || current.section) sections.push(current);
      current = { section: trimmed.replace(/:$/, ''), steps: [] };
    } else {
      const stepText = trimmed.replace(/^\d+\.\s*/, '');
      if (stepText) current.steps.push(stepText);
    }
  }
  if (current.steps.length > 0 || current.section) sections.push(current);
  return sections;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [plannerModalOpen, setPlannerModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [selectedIngredientName, setSelectedIngredientName] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState('USD');

  // Steps AI
  const [stepData, setStepData] = useState<Record<number, { tips: string[]; highlights: { word: string; explanation: string }[] }>>({});
  const [loadingTips, setLoadingTips] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadRecipe();
    fetchUserCurrency();
    if (params.id) {
      try {
        const prev: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updated = [params.id, ...prev.filter((id) => id !== params.id)].slice(0, 20);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch {}
    }
  }, [params.id]);

  useEffect(() => {
    if (recipe) {
      checkIfSaved();
      loadLikeStatus();
      setUserRating(recipe.rating || 0);
    }
  }, [recipe]);

  const fetchUserCurrency = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('/api/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.currency) {
            setUserCurrency(data.currency);
            return;
          }
        }
      } catch {}
    }

    // Fallback to localStorage for guest/setup users
    const setupData = localStorage.getItem('setupData');
    if (setupData) {
      try {
        const data = JSON.parse(setupData);
        if (data.currency) setUserCurrency(data.currency);
      } catch {}
    }
  };

  const loadRecipe = async () => {
    try {
      const res = await fetch(`/api/recipes/${params.id}`);
      if (!res.ok) throw new Error();
      setRecipe(await res.json());
    } catch {
      router.push('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    const token = localStorage.getItem('token');
    if (!token || !recipe) return;
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/save`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setIsSaved((await res.json()).saved);
    } catch {}
  };

  const toggleSaveRecipe = async () => {
    const token = localStorage.getItem('token');
    if (!token || !recipe) return router.push('/auth/signin');
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return router.push('/auth/signin');
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        showToast(data.message || (data.saved ? 'Recipe saved!' : 'Removed from saved'));
      } else {
        showToast('Failed to update saved status');
      }
    } catch {
      showToast('Connection error');
    }
  };

  const loadLikeStatus = async () => {
    if (!recipe) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/like`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikeCount(data.count);
      }
    } catch {}
  };

  const toggleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token || !recipe) return router.push('/auth/signin');
    const prev = isLiked;
    setIsLiked(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        setIsLiked(prev);
        setLikeCount((c) => (prev ? c + 1 : c - 1));
        return router.push('/auth/signin');
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setIsLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
      showToast('Failed to update like');
    }
  };

  const setRating = async (rating: number) => {
    const token = localStorage.getItem('token');
    if (!token || !recipe) return router.push('/auth/signin');
    const prev = userRating;
    setUserRating(rating);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserRating(data.rating);
        showToast(`Rated ${rating} ★`);
      } else {
        setUserRating(prev);
      }
    } catch {
      setUserRating(prev);
    }
  };

  const fetchStepTips = async (idx: number, text: string) => {
    if (stepData[idx] || !recipe) return;
    setLoadingTips((prev) => ({ ...prev, [idx]: true }));
    try {
      const res = await fetch('/api/ai/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: text, ingredients: recipe.ingredientsJson }),
      });
      if (res.ok) { const data = await res.json(); setStepData((prev) => ({ ...prev, [idx]: data })); }
    } finally {
      setLoadingTips((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const renderStepText = (text: string, highlights: { word: string; explanation: string }[]) => {
    if (!highlights?.length) return <>{text}</>;
    let parts: (string | React.ReactNode)[] = [text];
    highlights.forEach((h) => {
      const nextParts: (string | React.ReactNode)[] = [];
      parts.forEach((part) => {
        if (typeof part !== 'string') { nextParts.push(part); return; }
        const regex = new RegExp(`(${h.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        part.split(regex).forEach((s, i) => {
          if (s.toLowerCase() === h.word.toLowerCase()) {
            nextParts.push(
              <span
                key={`${h.word}-${i}`}
                className="font-semibold text-accent underline decoration-dotted decoration-accent/60 cursor-help group/tip relative"
              >
                {s}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-popover text-popover-foreground text-xs rounded-xl shadow-2xl border border-border opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-50 font-normal not-italic leading-relaxed">
                  {h.explanation}
                </span>
              </span>
            );
          } else if (s) {
            nextParts.push(s);
          }
        });
      });
      parts = nextParts;
    });
    return <>{parts}</>;
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full motion-safe:animate-spin" />
      <p className="text-muted-foreground font-display uppercase tracking-widest text-xs">Loading recipe…</p>
    </div>
  );

  if (!recipe) return null;

  const ingredients: Ingredient[] = (() => {
    try { return JSON.parse(recipe.ingredientsJson); } catch { return []; }
  })();
  const stepSections = parseSteps(recipe.stepsMd);
  const flag = recipe.cuisine ? (cuisineFlags[recipe.cuisine] || '🍽️') : '🍽️';
  const origin = recipe.cuisine ? (cuisineOrigins[recipe.cuisine] || '') : '';
  const dietList = recipe.dietTags ? [...new Set(recipe.dietTags.split(',').map((t) => t.trim()).filter(Boolean))] : [];

  const hasNutrition = recipe.kcal || recipe.proteinG || recipe.carbsG || recipe.fatG;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      <div className="relative h-[380px] md:h-[460px]">
        {recipe.imageUrl ? (
          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center text-8xl">🍽️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md rounded-pill border border-border/50 text-sm font-display text-foreground hover:bg-background transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-8 left-6 right-6 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-brand-green text-brand-eggshell rounded-pill text-xs font-display uppercase tracking-widest shadow-lg">
              {flag} {recipe.cuisine}
            </span>
            {recipe.difficulty && (
              <span className={`px-3 py-1 rounded-pill text-xs font-display uppercase tracking-widest border backdrop-blur-md ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            )}
            {dietList.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-pill text-[10px] font-display uppercase tracking-widest backdrop-blur-md shadow-sm">
                ✓ {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-foreground leading-tight tracking-tight drop-shadow-lg">
            {recipe.title}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Clock className="w-5 h-5 text-blue-500" />, label: 'Time', value: recipe.timeMins ? `${recipe.timeMins} min` : '—', bg: 'bg-blue-500/8 border-blue-500/15' },
            { icon: <Flame className="w-5 h-5 text-orange-500" />, label: 'Calories', value: recipe.kcal ? `${recipe.kcal} kcal` : '—', bg: 'bg-orange-500/8 border-orange-500/15' },
            { icon: <DollarSign className="w-5 h-5 text-brand-green" />, label: 'Cost', value: recipe.estimatedPrice ? formatRecipePrice(recipe.estimatedPrice, recipe.currency || 'USD', userCurrency) : '—', bg: 'bg-brand-green/8 border-brand-green/15' },
            { icon: null, label: 'Rating', value: null, bg: 'bg-yellow-500/8 border-yellow-500/15', isRating: true },
          ].map((stat, i) => (
            <Card key={i} className={`p-4 text-center ${stat.bg} border`}>
              {stat.isRating ? (
                <>
                  <div className="flex justify-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRating(s)} aria-label={`Rate ${s} stars`}>
                        <Star className={`w-4 h-4 transition-colors ${s <= (userRating || recipe.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/40'}`} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-display uppercase text-muted-foreground tracking-widest">Rating</p>
                  <p className="text-lg font-display">{(recipe.rating || 0).toFixed(1)}</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-1">{stat.icon}</div>
                  <p className="text-[10px] font-display uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className="text-lg font-display">{stat.value}</p>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (!recipe) return;
              try {
                const stored = localStorage.getItem('feast_menu_queue');
                const queue: any[] = stored ? JSON.parse(stored) : [];
                if (!queue.find((r: any) => r.id === recipe.id)) {
                  queue.push({
                    id: recipe.id,
                    title: recipe.title,
                    imageUrl: recipe.imageUrl ?? null,
                    cuisine: recipe.cuisine ?? null,
                    timeMins: recipe.timeMins ?? null,
                    kcal: recipe.kcal ?? null,
                    difficulty: recipe.difficulty ?? null,
                    dietTags: recipe.dietTags ?? null,
                  });
                  localStorage.setItem('feast_menu_queue', JSON.stringify(queue));
                }
                showToast('Added to Menu Queue ✓');
              } catch {
                showToast('Could not add to queue');
              }
            }}
            className="flex-1 h-12 font-display rounded-pill shadow-md"
          >
            📅 Add to Menu
          </Button>
          <button
            onClick={toggleSaveRecipe}
            className={`h-12 px-5 rounded-pill border font-display text-sm flex items-center gap-2 transition-all ${isSaved ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-foreground hover:border-accent/50'}`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={toggleLike}
            className={`h-12 px-5 rounded-pill border font-display text-sm flex items-center gap-2 transition-all ${isLiked ? 'bg-rose-500/10 text-rose-500 border-rose-500' : 'bg-card border-border text-foreground hover:border-rose-300'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
            {likeCount > 0 ? likeCount : 'Like'}
          </button>
          <button
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({ title: recipe.title, url: window.location.href });
                } catch (e) {
                  if ((e as Error).name !== 'AbortError') showToast('Failed to share');
                }
              } else {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard!');
                } catch {
                  showToast('Failed to copy link');
                }
              }
            }}
            className="h-12 px-4 rounded-pill border border-border bg-card text-foreground hover:border-accent/50 transition-all"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* About the dish */}
        <section className="space-y-4">
          <SectionHeader color="bg-accent" title="About the Dish" />
          <div className="space-y-5">
            <p className="text-base text-foreground/80 font-body leading-relaxed">
              {recipe.description}
            </p>

            {/* Diet tags */}

            {/* Origin — theme-aware */}
            {origin && (
              <div className="flex items-start gap-4 p-5 bg-muted/60 border border-border rounded-2xl">
                <span className="text-4xl leading-none mt-0.5 flex-shrink-0">{flag}</span>
                <div>
                  <h4 className="text-sm font-display text-foreground tracking-tight mb-1.5">
                    {recipe.cuisine} Origin
                  </h4>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">{origin}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Nutrition */}
        {hasNutrition && (
          <section className="space-y-4">
            <SectionHeader color="bg-brand-orange" title="Nutrition" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Flame className="w-4 h-4" />, label: 'Calories', value: recipe.kcal, unit: 'kcal', color: 'text-orange-500' },
                { icon: <Beef className="w-4 h-4" />, label: 'Protein', value: recipe.proteinG, unit: 'g', color: 'text-rose-500' },
                { icon: <Wheat className="w-4 h-4" />, label: 'Carbs', value: recipe.carbsG, unit: 'g', color: 'text-amber-500' },
                { icon: <Droplets className="w-4 h-4" />, label: 'Fat', value: recipe.fatG, unit: 'g', color: 'text-blue-400' },
                { icon: <Zap className="w-4 h-4" />, label: 'Fiber', value: recipe.fiberG, unit: 'g', color: 'text-brand-green' },
                { icon: <span className="text-xs">🍬</span>, label: 'Sugar', value: recipe.sugarG, unit: 'g', color: 'text-pink-400' },
                { icon: <span className="text-xs">🧂</span>, label: 'Sodium', value: recipe.sodiumMg, unit: 'mg', color: 'text-slate-400' },
              ].filter((n) => n.value != null).map((n, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                  <span className={n.color}>{n.icon}</span>
                  <div>
                    <p className="text-[10px] font-display uppercase text-muted-foreground tracking-wider">{n.label}</p>
                    <p className="text-sm font-display font-semibold text-foreground">{n.value}{n.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ingredients */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader color="bg-brand-green" title={`Ingredients`} />
            <span className="text-sm text-muted-foreground font-body">{ingredients.length} items</span>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
                {/* Checkbox */}
                <button
                  onClick={() => setCheckedIngredients((prev) => {
                    const next = new Set(prev);
                    next.has(i) ? next.delete(i) : next.add(i);
                    return next;
                  })}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${checkedIngredients.has(i) ? 'bg-brand-green border-brand-green' : 'border-border'}`}
                  aria-label={`Check off ${ing.name}`}
                >
                  {checkedIngredients.has(i) && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Icon */}
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0">
                  {getIngredientIcon(ing.name)}
                </div>

                {/* Name + qty */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-foreground truncate ${checkedIngredients.has(i) ? 'line-through text-muted-foreground' : ''}`}>
                    {ing.qty} {ing.unit} {ing.name}
                  </p>
                  {ing.notes && (
                    <p className="text-xs text-muted-foreground truncate">{ing.notes}</p>
                  )}
                </div>

                {/* Three dots → detail modal */}
                <button
                  onClick={() => setSelectedIngredientName(ing.name)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  aria-label={`More info about ${ing.name}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cooking Process */}
        <section className="space-y-4">
          <SectionHeader color="bg-primary" title="Cooking Process" />

          <div className="space-y-8">
            {stepSections.map((section, sIdx) => {
              const sectionStartIdx = stepSections.slice(0, sIdx).reduce((acc, s) => acc + s.steps.length, 0);
              return (
                <div key={sIdx} className="space-y-4">
                  {section.section && (
                    <h3 className="text-xs font-display uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-2">
                      {section.section}
                    </h3>
                  )}

                  <div className="space-y-3">
                    {section.steps.map((step, idx) => {
                      const globalIdx = sectionStartIdx + idx;
                      const showTipButton = globalIdx % 3 === 0; // Only every 3rd step
                      const data = stepData[globalIdx];

                      return (
                        <div key={idx} className="flex gap-3">
                          {/* Step number */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-display font-bold shadow-sm">
                              {globalIdx + 1}
                            </div>
                            {idx < section.steps.length - 1 && (
                              <div className="w-px flex-1 bg-border mt-1.5 min-h-[16px]" />
                            )}
                          </div>

                          {/* Step content */}
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-body text-foreground leading-relaxed pt-1">
                              {renderStepText(step, data?.highlights || [])}
                            </p>

                            {/* Tips — only on select steps */}
                            {showTipButton && (
                              <div className="mt-2">
                                <AnimatePresence mode="wait">
                                  {!data && !loadingTips[globalIdx] ? (
                                    <motion.button
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      onClick={() => fetchStepTips(globalIdx, step)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-pill font-display text-[10px] tracking-widest transition-all uppercase border border-accent/20"
                                    >
                                      <Sparkles className="h-3 w-3" /> Chef's Tip
                                    </motion.button>
                                  ) : loadingTips[globalIdx] ? (
                                    <div className="flex items-center gap-2 text-[10px] font-display text-muted-foreground uppercase tracking-widest motion-safe:animate-pulse mt-1">
                                      <ChefHat className="h-3.5 w-3.5" /> Thinking…
                                    </div>
                                  ) : data?.tips?.length ? (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="mt-3 space-y-2 overflow-hidden"
                                    >
                                      {data.tips.map((tip, ti) => (
                                        <div key={ti} className="flex gap-2.5 p-3 bg-accent/5 border border-accent/15 rounded-xl">
                                          <ChefHat className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                          <p className="text-xs font-body text-foreground/80 leading-relaxed italic">{tip}</p>
                                        </div>
                                      ))}
                                    </motion.div>
                                  ) : null}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Ingredient detail modal */}
      <IngredientDetailModal
        ingredient={selectedIngredientName}
        onClose={() => setSelectedIngredientName(null)}
      />

      <AddToPlannerModal
        isOpen={plannerModalOpen}
        onClose={() => setPlannerModalOpen(false)}
        recipeId={recipe.id}
        recipeName={recipe.title}
        onSuccess={() => { showToast('Added to your plan!'); setPlannerModalOpen(false); }}
      />

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[110] px-6 py-3 bg-foreground text-background rounded-pill shadow-2xl font-display text-sm tracking-wide"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <h2 className="text-xl font-display text-foreground tracking-tight flex items-center gap-2.5">
      <span className={`w-1.5 h-6 ${color} rounded-full`} />
      {title}
    </h2>
  );
}
