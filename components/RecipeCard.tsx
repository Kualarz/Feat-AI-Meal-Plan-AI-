'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, Plus, Clock, Star } from 'lucide-react';
import { Card } from '@/components/Card';
import { formatRecipePrice, getCurrencySymbol, CONVERSION_RATES } from '@/lib/currency';

export interface RecipeCardRecipe {
  id: string;
  title: string;
  description?: string | null;
  cuisine?: string | null;
  dietTags?: string | null;
  timeMins?: number | null;
  estimatedPrice?: number | null;
  currency?: string | null;
  kcal?: number | null;
  proteinG?: number | null;
  imageUrl?: string | null;
  rating?: number | null;
}

interface RecipeCardProps {
  recipe: RecipeCardRecipe;
  initialLiked?: boolean;
  initialSaved?: boolean;
  showActions?: boolean;
}

// ── Tag styling system ─────────────────────────────────────────────────────────

// Cuisine origin colors — vibrant, works on both light and dark themes
const CUISINE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Cambodian:   { bg: '#2563eb', text: '#fff', icon: '🇰🇭' },
  Khmer:       { bg: '#2563eb', text: '#fff', icon: '🇰🇭' },
  Thai:        { bg: '#ea580c', text: '#fff', icon: '🇹🇭' },
  Vietnamese:  { bg: '#059669', text: '#fff', icon: '🇻🇳' },
  Japanese:    { bg: '#e11d48', text: '#fff', icon: '🇯🇵' },
  Indian:      { bg: '#d97706', text: '#fff', icon: '🇮🇳' },
  Mexican:     { bg: '#65a30d', text: '#fff', icon: '🇲🇽' },
  Italian:     { bg: '#dc2626', text: '#fff', icon: '🇮🇹' },
  Chinese:     { bg: '#b91c1c', text: '#fff', icon: '🇨🇳' },
  Korean:      { bg: '#7c3aed', text: '#fff', icon: '🇰🇷' },
  French:      { bg: '#4f46e5', text: '#fff', icon: '🇫🇷' },
  American:    { bg: '#2563eb', text: '#fff', icon: '🇺🇸' },
  Malaysian:   { bg: '#0d9488', text: '#fff', icon: '🇲🇾' },
  Indonesian:  { bg: '#c2410c', text: '#fff', icon: '🇮🇩' },
  Filipino:    { bg: '#a21caf', text: '#fff', icon: '🇵🇭' },
  Greek:       { bg: '#0284c7', text: '#fff', icon: '🇬🇷' },
  Spanish:     { bg: '#dc2626', text: '#fff', icon: '🇪🇸' },
  Lebanese:    { bg: '#16a34a', text: '#fff', icon: '🇱🇧' },
  Turkish:     { bg: '#b45309', text: '#fff', icon: '🇹🇷' },
  Singaporean: { bg: '#c026d3', text: '#fff', icon: '🇸🇬' },
  British:     { bg: '#1d4ed8', text: '#fff', icon: '🇬🇧' },
  Ethiopian:   { bg: '#15803d', text: '#fff', icon: '🇪🇹' },
  Moroccan:    { bg: '#a16207', text: '#fff', icon: '🇲🇦' },
  Persian:     { bg: '#6d28d9', text: '#fff', icon: '🇮🇷' },
};

// Food style tags — vibrant colors, distinct per style
const STYLE_TAGS: Record<string, { icon: string; bg: string; text: string }> = {
  seafood:       { icon: '🦐', bg: '#0891b2', text: '#fff' },
  'street food': { icon: '🛒', bg: '#e11d48', text: '#fff' },
  'street-food': { icon: '🛒', bg: '#e11d48', text: '#fff' },
  spicy:         { icon: '🌶️', bg: '#dc2626', text: '#fff' },
  umami:         { icon: '🍄', bg: '#9333ea', text: '#fff' },
  sweet:         { icon: '🍯', bg: '#f59e0b', text: '#111' },
  savory:        { icon: '🧂', bg: '#64748b', text: '#fff' },
  tangy:         { icon: '🍋', bg: '#84cc16', text: '#111' },
  smoky:         { icon: '🔥', bg: '#c2410c', text: '#fff' },
  crispy:        { icon: '✨', bg: '#d97706', text: '#fff' },
  creamy:        { icon: '🫕', bg: '#fbbf24', text: '#111' },
  grilled:       { icon: '🔥', bg: '#ea580c', text: '#fff' },
  fried:         { icon: '🍳', bg: '#f59e0b', text: '#111' },
  steamed:       { icon: '♨️', bg: '#10b981', text: '#fff' },
  braised:       { icon: '🫕', bg: '#b45309', text: '#fff' },
  'stir-fry':    { icon: '🥘', bg: '#f97316', text: '#fff' },
  soup:          { icon: '🥣', bg: '#0ea5e9', text: '#fff' },
  salad:         { icon: '🥗', bg: '#22c55e', text: '#fff' },
  curry:         { icon: '🍛', bg: '#ca8a04', text: '#fff' },
  noodle:        { icon: '🍜', bg: '#7c3aed', text: '#fff' },
  noodles:       { icon: '🍜', bg: '#7c3aed', text: '#fff' },
  rice:          { icon: '🍚', bg: '#eab308', text: '#111' },
  bbq:           { icon: '🔥', bg: '#b91c1c', text: '#fff' },
  fermented:     { icon: '🫙', bg: '#8b5cf6', text: '#fff' },
  'one-pot':     { icon: '🫕', bg: '#059669', text: '#fff' },
  fusion:        { icon: '🔀', bg: '#6366f1', text: '#fff' },
  traditional:   { icon: '🏛️', bg: '#78716c', text: '#fff' },
  snack:         { icon: '🍿', bg: '#a855f7', text: '#fff' },
  dessert:       { icon: '🍰', bg: '#ec4899', text: '#fff' },
  breakfast:     { icon: '🍳', bg: '#f59e0b', text: '#111' },
  appetizer:     { icon: '🥢', bg: '#14b8a6', text: '#fff' },
};

// Vibe/mood tags — intuitive, vibrant colors
const VIBE_TAGS: Record<string, { icon: string; bg: string; text: string }> = {
  healthy:       { icon: '💚', bg: '#16a34a', text: '#fff' },
  impressive:    { icon: '🌟', bg: '#7c3aed', text: '#fff' },
  comfort:       { icon: '🛋️', bg: '#a16207', text: '#fff' },
  'comfort food':{ icon: '🛋️', bg: '#a16207', text: '#fff' },
  quick:         { icon: '⚡', bg: '#eab308', text: '#111' },
  easy:          { icon: '👌', bg: '#22c55e', text: '#fff' },
  'kid-friendly':{ icon: '👶', bg: '#f472b6', text: '#fff' },
  budget:        { icon: '💰', bg: '#14b8a6', text: '#fff' },
  fancy:         { icon: '✨', bg: '#8b5cf6', text: '#fff' },
  light:         { icon: '🍃', bg: '#34d399', text: '#111' },
  hearty:        { icon: '🍖', bg: '#ea580c', text: '#fff' },
  refreshing:    { icon: '💧', bg: '#0ea5e9', text: '#fff' },
  filling:       { icon: '🫃', bg: '#d97706', text: '#fff' },
  indulgent:     { icon: '😋', bg: '#c026d3', text: '#fff' },
  wholesome:     { icon: '🌻', bg: '#65a30d', text: '#fff' },
  aromatic:      { icon: '🌸', bg: '#ec4899', text: '#fff' },
  seasonal:      { icon: '🍂', bg: '#b45309', text: '#fff' },
  festive:       { icon: '🎉', bg: '#ef4444', text: '#fff' },
  warming:       { icon: '☕', bg: '#c2410c', text: '#fff' },
  cooling:       { icon: '🧊', bg: '#06b6d4', text: '#fff' },
};

// Diet tags — vibrant colors
const DIET_TAGS: Record<string, { icon: string; bg: string; text: string }> = {
  vegetarian:    { icon: '🥦', bg: '#16a34a', text: '#fff' },
  vegan:         { icon: '🌱', bg: '#15803d', text: '#fff' },
  halal:         { icon: '🕌', bg: '#7c3aed', text: '#fff' },
  pescatarian:   { icon: '🐟', bg: '#0284c7', text: '#fff' },
  keto:          { icon: '🥑', bg: '#ca8a04', text: '#fff' },
  'high-protein':{ icon: '💪', bg: '#ea580c', text: '#fff' },
  paleo:         { icon: '🍗', bg: '#c2410c', text: '#fff' },
  'gluten-free': { icon: '🌾', bg: '#eab308', text: '#111' },
  'dairy-free':  { icon: '🥛', bg: '#0ea5e9', text: '#fff' },
  'low-carb':    { icon: '📉', bg: '#0d9488', text: '#fff' },
  'low-calorie': { icon: '🪶', bg: '#14b8a6', text: '#fff' },
  'sugar-free':  { icon: '🚫', bg: '#ef4444', text: '#fff' },
  organic:       { icon: '🌿', bg: '#65a30d', text: '#fff' },
  'nut-free':    { icon: '🥜', bg: '#d97706', text: '#fff' },
  'soy-free':    { icon: '🫘', bg: '#b45309', text: '#fff' },
  'egg-free':    { icon: '🥚', bg: '#f97316', text: '#111' },
  whole30:       { icon: '⏱️', bg: '#dc2626', text: '#fff' },
  mediterranean: { icon: '🫒', bg: '#0891b2', text: '#fff' },
  flexitarian:   { icon: '🌿', bg: '#84cc16', text: '#111' },
};

function getTagStyle(tag: string): { icon: string; bg: string; text: string } | null {
  const t = tag.trim().toLowerCase();
  return STYLE_TAGS[t] || VIBE_TAGS[t] || DIET_TAGS[t] || null;
}

// Deterministic fallback for truly unknown tags
const FALLBACK_PALETTE = [
  { bg: '#2563eb', text: '#fff' }, { bg: '#7c3aed', text: '#fff' },
  { bg: '#ea580c', text: '#fff' }, { bg: '#16a34a', text: '#fff' },
  { bg: '#ca8a04', text: '#fff' }, { bg: '#ec4899', text: '#fff' },
  { bg: '#0891b2', text: '#fff' }, { bg: '#c2410c', text: '#fff' },
  { bg: '#8b5cf6', text: '#fff' }, { bg: '#0ea5e9', text: '#fff' },
];
const FALLBACK_ICONS = ['🏷️','🍴','🥄','🫙','🥘','🍜','🥗','🌮'];

function getFallbackStyle(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0x7fffffff;
  const p = FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
  return { icon: FALLBACK_ICONS[h % FALLBACK_ICONS.length], ...p };
}

export function RecipeCard({
  recipe,
  initialLiked = false,
  initialSaved = false,
  showActions = true,
}: RecipeCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [toast, setToast] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState('USD');

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch user preferred currency
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const token = getToken();
        if (token) {
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
        }

        // Fallback to localStorage for guest/setup users
        const setupData = localStorage.getItem('setupData');
        if (setupData) {
          const data = JSON.parse(setupData);
          if (data.currency) setUserCurrency(data.currency);
        }
      } catch {}
    };
    fetchPrefs();
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }
    setLiked((v) => !v);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
      } else {
        setLiked((v) => !v);
      }
    } catch {
      setLiked((v) => !v);
    }
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('feast_menu_queue');
      const queue: RecipeCardRecipe[] = stored ? JSON.parse(stored) : [];
      if (!queue.find(r => r.id === recipe.id)) {
        queue.push({
          id: recipe.id,
          title: recipe.title,
          imageUrl: recipe.imageUrl ?? null,
          cuisine: recipe.cuisine ?? null,
          timeMins: recipe.timeMins ?? null,
          kcal: recipe.kcal ?? null,
          dietTags: recipe.dietTags ?? null,
        });
        localStorage.setItem('feast_menu_queue', JSON.stringify(queue));
      }
      showToast('Added to Menu Queue ✓');
    } catch {
      showToast('Could not add to queue');
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle saved state and add/remove from queue
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      const stored = localStorage.getItem('feast_menu_queue');
      const queue: RecipeCardRecipe[] = stored ? JSON.parse(stored) : [];
      if (newSaved) {
        if (!queue.find(r => r.id === recipe.id)) {
          queue.push({
            id: recipe.id,
            title: recipe.title,
            imageUrl: recipe.imageUrl ?? null,
            cuisine: recipe.cuisine ?? null,
            timeMins: recipe.timeMins ?? null,
            kcal: recipe.kcal ?? null,
            dietTags: recipe.dietTags ?? null,
          });
        }
        showToast('Saved to Queue ✓');
      } else {
        const filtered = queue.filter(r => r.id !== recipe.id);
        localStorage.setItem('feast_menu_queue', JSON.stringify(filtered));
        showToast('Removed from Queue');
        return;
      }
      localStorage.setItem('feast_menu_queue', JSON.stringify(queue));
    } catch {
      setSaved(!newSaved);
      showToast('Could not update queue');
    }
  };

  return (
    <>
      <Link href={`/recipes/${recipe.id}`} className="group relative block">
        <Card className="p-0 overflow-hidden h-full border-border/80 hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col">
          {/* Image area */}
          <div className="relative w-full h-44 bg-muted flex-shrink-0 overflow-hidden">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground/40">🍽️</div>
            )}

            {/* Savings badge — top left */}
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-brand-green text-brand-eggshell font-display text-[9px] px-3 py-1 rounded-pill shadow-xl flex items-center gap-1 uppercase tracking-widest">
                Save {getCurrencySymbol(userCurrency)}{( (20 - (recipe.estimatedPrice || 5)) * (CONVERSION_RATES[userCurrency] || 1) ).toFixed(2)}
              </div>
            </div>

            {/* Time badge — bottom left, no overlap with savings */}
            {recipe.timeMins && (
              <span className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-brand-black/60 text-brand-eggshell rounded-pill text-[10px] font-display uppercase tracking-widest backdrop-blur-md z-10">
                <Clock className="h-3 w-3" /> {recipe.timeMins}min
              </span>
            )}

            {/* Action buttons — appear on hover */}
            {showActions && (
              <div className="absolute bottom-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {/* Like */}
                <button
                  type="button"
                  onClick={handleLike}
                  className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border transition-colors ${liked ? 'bg-rose-500 border-rose-500 text-white' : 'bg-card/90 border-border/50 text-foreground hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/20'}`}
                  aria-label="Like recipe"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
                </button>

                {/* Add to queue */}
                <button
                  type="button"
                  onClick={handleAddToQueue}
                  className="w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border bg-card/90 border-border/50 text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                  aria-label="Add to plan"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Bookmark / save to queue */}
                <button
                  type="button"
                  onClick={handleBookmarkClick}
                  className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border transition-all ${saved ? 'bg-accent border-accent text-white' : 'bg-card/90 border-border/50 text-foreground hover:bg-accent/10 hover:text-accent'}`}
                  aria-label="Save recipe"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
                </button>
              </div>
            )}

            {/* Toast */}
            {toast && (
              <div className="absolute bottom-3 left-3 right-3 bg-brand-green text-brand-eggshell text-xs font-display uppercase tracking-widest px-3 py-2 rounded-pill text-center shadow-lg z-50 motion-safe:animate-fade-in">
                {toast}
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="p-5 flex flex-col flex-1 gap-3">
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-display text-lg text-foreground line-clamp-2 group-hover:text-accent transition-colors leading-snug tracking-tight">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-pill shrink-0">
                <Star className="h-3 w-3 text-accent fill-accent" />
                <span className="text-[10px] font-display text-accent tracking-tighter">{(recipe.rating ?? 0).toFixed(1)}</span>
              </div>
            </div>

            {recipe.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-body font-medium italic">
                {recipe.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {/* Cuisine origin tag with flag */}
              {recipe.cuisine && (() => {
                const cs = CUISINE_STYLES[recipe.cuisine];
                return (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1"
                    style={cs ? { background: cs.bg, color: cs.text } : { background: '#2563eb', color: '#fff' }}
                  >
                    {cs?.icon || '🌍'} {recipe.cuisine}
                  </span>
                );
              })()}

              {/* Diet / style / vibe tags — each with unique icon + color */}
              {recipe.dietTags &&
                recipe.dietTags.split(',').slice(0, 4).map((t) => t.trim()).filter(Boolean).map((tag) => {
                  const style = getTagStyle(tag) || getFallbackStyle(tag);
                  return (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {style.icon} {tag}
                    </span>
                  );
                })}
            </div>

            <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
              {recipe.kcal && <span className="flex items-center gap-0.5">🔥 {recipe.kcal} kcal</span>}
              {recipe.proteinG && <span className="flex items-center gap-0.5">💪 {recipe.proteinG}g</span>}
              {recipe.estimatedPrice && (
                <span className="ml-auto font-semibold text-foreground">{formatRecipePrice(recipe.estimatedPrice, recipe.currency || 'USD', userCurrency)}</span>
              )}
            </div>
          </div>
        </Card>
      </Link>

    </>
  );
}
