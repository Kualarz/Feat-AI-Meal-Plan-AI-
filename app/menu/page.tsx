'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Recipe {
  id: string;
  title: string;
  imageUrl: string | null;
  cuisine: string | null;
  timeMins: number | null;
  kcal: number | null;
  difficulty: string | null;
  dietTags: string | null;
}

interface PlanMeal {
  id: string;
  dateISO: string;
  slot: string;
  recipe: Recipe | null;
}

interface Plan {
  id: string;
  weekStart: string;
  weekEnd: string;
  meals: PlanMeal[];
}

type DragSource = { type: 'queue' } | { type: 'slot'; mealId: string; dateISO: string };

// ── Diet badge config ──────────────────────────────────────────────────────────

const DIET_BADGES: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  // Diet
  vegetarian:      { label: 'Veg',      icon: '🥦', bg: '#22c55e', text: '#fff' },
  vegan:           { label: 'Vegan',    icon: '🌱', bg: '#16a34a', text: '#fff' },
  halal:           { label: 'Halal',    icon: '🕌', bg: '#7c3aed', text: '#fff' },
  pescatarian:     { label: 'Pesc.',    icon: '🐟', bg: '#0ea5e9', text: '#fff' },
  keto:            { label: 'Keto',     icon: '🥑', bg: '#ca8a04', text: '#fff' },
  'high-protein':  { label: 'Protein',  icon: '💪', bg: '#ea580c', text: '#fff' },
  mediterranean:   { label: 'Med.',     icon: '🫒', bg: '#0891b2', text: '#fff' },
  paleo:           { label: 'Paleo',    icon: '🍗', bg: '#c2410c', text: '#fff' },
  flexitarian:     { label: 'Flex.',    icon: '🌿', bg: '#84cc16', text: '#111' },
  'gluten-free':   { label: 'GF',       icon: '🌾', bg: '#eab308', text: '#111' },
  'dairy-free':    { label: 'DF',       icon: '🥛', bg: '#0ea5e9', text: '#fff' },
  whole30:         { label: 'W30',      icon: '⏱️', bg: '#dc2626', text: '#fff' },
  carnivore:       { label: 'Carn.',    icon: '🥩', bg: '#be123c', text: '#fff' },
  'low-fodmap':    { label: 'FODMAP',   icon: '🫙', bg: '#a855f7', text: '#fff' },
  'raw-food':      { label: 'Raw',      icon: '🥗', bg: '#14b8a6', text: '#fff' },
  'low-carb':      { label: 'Low-Carb', icon: '📉', bg: '#0d9488', text: '#fff' },
  'low-calorie':   { label: 'Low-Cal',  icon: '🪶', bg: '#14b8a6', text: '#fff' },
  'sugar-free':    { label: 'No Sugar', icon: '🚫', bg: '#ef4444', text: '#fff' },
  organic:         { label: 'Organic',  icon: '🌿', bg: '#65a30d', text: '#fff' },
  'nut-free':      { label: 'Nut-Free', icon: '🥜', bg: '#d97706', text: '#fff' },
  'soy-free':      { label: 'Soy-Free', icon: '🫘', bg: '#b45309', text: '#fff' },
  'egg-free':      { label: 'Egg-Free', icon: '🥚', bg: '#f97316', text: '#111' },
  'whole-grain':   { label: 'W.Grain',  icon: '🌾', bg: '#a16207', text: '#fff' },
  // Vibe
  healthy:         { label: 'Healthy',  icon: '💚', bg: '#16a34a', text: '#fff' },
  'comfort food':  { label: 'Comfort',  icon: '🍲', bg: '#a16207', text: '#fff' },
  'comfort':       { label: 'Comfort',  icon: '🍲', bg: '#a16207', text: '#fff' },
  spicy:           { label: 'Spicy',    icon: '🌶️', bg: '#dc2626', text: '#fff' },
  'kid-friendly':  { label: 'Kids',     icon: '👶', bg: '#f472b6', text: '#fff' },
  'quick':         { label: 'Quick',    icon: '⚡', bg: '#eab308', text: '#111' },
  'budget':        { label: 'Budget',   icon: '💰', bg: '#14b8a6', text: '#fff' },
  // Style
  'fermented':     { label: 'Ferment',  icon: '🫙', bg: '#8b5cf6', text: '#fff' },
  'raw':           { label: 'Raw',      icon: '🥬', bg: '#15803d', text: '#fff' },
  'street-food':   { label: 'Street',   icon: '🛒', bg: '#e11d48', text: '#fff' },
  'traditional':   { label: 'Trad.',    icon: '🏛️', bg: '#78716c', text: '#fff' },
  'fusion':        { label: 'Fusion',   icon: '🔀', bg: '#6366f1', text: '#fff' },
  'seasonal':      { label: 'Season',   icon: '🍂', bg: '#b45309', text: '#fff' },
  'one-pot':       { label: 'One-Pot',  icon: '🫕', bg: '#059669', text: '#fff' },
  'bbq':           { label: 'BBQ',      icon: '🔥', bg: '#b91c1c', text: '#fff' },
  'grilled':       { label: 'Grill',    icon: '🔥', bg: '#ea580c', text: '#fff' },
  'soup':          { label: 'Soup',     icon: '🥣', bg: '#0284c7', text: '#fff' },
  'dessert':       { label: 'Dessert',  icon: '🍰', bg: '#ec4899', text: '#fff' },
  'breakfast':     { label: 'Brekkie',  icon: '🍳', bg: '#f59e0b', text: '#111' },
  'snack':         { label: 'Snack',    icon: '🍿', bg: '#a855f7', text: '#fff' },
};

const CUISINE_STYLES: Record<string, { flag: string; bg: string; text: string }> = {
  Cambodian:   { flag: '🇰🇭', bg: '#2563eb', text: '#fff' },
  Khmer:       { flag: '🇰🇭', bg: '#2563eb', text: '#fff' },
  Thai:        { flag: '🇹🇭', bg: '#ea580c', text: '#fff' },
  Vietnamese:  { flag: '🇻🇳', bg: '#059669', text: '#fff' },
  Italian:     { flag: '🇮🇹', bg: '#dc2626', text: '#fff' },
  Japanese:    { flag: '🇯🇵', bg: '#e11d48', text: '#fff' },
  Chinese:     { flag: '🇨🇳', bg: '#b91c1c', text: '#fff' },
  Indian:      { flag: '🇮🇳', bg: '#d97706', text: '#fff' },
  Mexican:     { flag: '🇲🇽', bg: '#65a30d', text: '#fff' },
  American:    { flag: '🇺🇸', bg: '#2563eb', text: '#fff' },
  French:      { flag: '🇫🇷', bg: '#4f46e5', text: '#fff' },
  Korean:      { flag: '🇰🇷', bg: '#7c3aed', text: '#fff' },
  Malaysian:   { flag: '🇲🇾', bg: '#0d9488', text: '#fff' },
  Indonesian:  { flag: '🇮🇩', bg: '#c2410c', text: '#fff' },
  Filipino:    { flag: '🇵🇭', bg: '#a21caf', text: '#fff' },
  Greek:       { flag: '🇬🇷', bg: '#0284c7', text: '#fff' },
  Spanish:     { flag: '🇪🇸', bg: '#dc2626', text: '#fff' },
  Lebanese:    { flag: '🇱🇧', bg: '#16a34a', text: '#fff' },
  Singaporean: { flag: '🇸🇬', bg: '#c026d3', text: '#fff' },
  British:     { flag: '🇬🇧', bg: '#1d4ed8', text: '#fff' },
  Turkish:     { flag: '🇹🇷', bg: '#b45309', text: '#fff' },
  Ethiopian:   { flag: '🇪🇹', bg: '#15803d', text: '#fff' },
  Moroccan:    { flag: '🇲🇦', bg: '#a16207', text: '#fff' },
  Persian:     { flag: '🇮🇷', bg: '#6d28d9', text: '#fff' },
};

const CHIP_PALETTE = [
  '#2563eb', '#ea580c', '#7c3aed', '#16a34a',
  '#e11d48', '#0891b2', '#ca8a04', '#ec4899',
  '#6366f1', '#0ea5e9', '#c026d3', '#059669',
];

// Fallback icons/colors for tags not in DIET_BADGES — hashed so each unique tag gets its own look
const FALLBACK_ICONS = ['🍽️','🥘','🫕','🥗','🍜','🥙','🧆','🥡','🍛','🍝','🌮','🥪'];
const FALLBACK_COLORS = ['#2563eb','#ea580c','#7c3aed','#16a34a','#e11d48','#0891b2','#ca8a04','#ec4899','#6366f1','#0ea5e9','#c026d3','#059669'];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  return h;
}

function getDietBadge(dietTags: string | null) {
  if (!dietTags) return null;
  const tags = dietTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  if (tags.length === 0) return null;

  // Try each tag against known badges, also try keyword matching
  for (const tag of tags) {
    if (DIET_BADGES[tag]) return DIET_BADGES[tag];
    // Partial match: "healthy comfort food" should match "healthy" or "comfort food"
    for (const [key, badge] of Object.entries(DIET_BADGES)) {
      if (tag.includes(key) || key.includes(tag)) return badge;
    }
  }

  // Fallback: deterministic unique color/icon from first tag
  const first = tags[0];
  const h = hashStr(first);
  const label = first.length > 8 ? first.slice(0, 7) + '.' : first;
  return {
    label: label.charAt(0).toUpperCase() + label.slice(1),
    icon: FALLBACK_ICONS[h % FALLBACK_ICONS.length],
    bg: FALLBACK_COLORS[h % FALLBACK_COLORS.length],
    text: '#fff',
  };
}

function getAccentColor(recipe: Recipe): string {
  const badge = getDietBadge(recipe.dietTags);
  if (badge) return badge.bg;
  let hash = 0;
  for (let i = 0; i < recipe.title.length; i++) {
    hash = (hash * 31 + recipe.title.charCodeAt(i)) % CHIP_PALETTE.length;
  }
  return CHIP_PALETTE[Math.abs(hash)];
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultToDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

function getDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

// ── RecipeChip ─────────────────────────────────────────────────────────────────

function RecipeChip({
  recipe,
  onRemove,
  draggable: isDraggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: {
  recipe: Recipe;
  onRemove: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}) {
  const badge = getDietBadge(recipe.dietTags);
  const accent = getAccentColor(recipe);
  const cuisineStyle = recipe.cuisine ? CUISINE_STYLES[recipe.cuisine] : null;
  const didDrag = useRef(false);

  return (
    <div
      draggable={isDraggable}
      onDragStart={() => { didDrag.current = true; onDragStart?.(); }}
      onDragEnd={() => { didDrag.current = false; onDragEnd?.(); }}
      className={`relative flex-shrink-0 w-36 rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all select-none ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${isDragging ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="h-[3px] w-full" style={{ background: accent }} />

      <Link
        href={`/recipes/${recipe.id}`}
        className="block"
        onClick={e => { if (didDrag.current) e.preventDefault(); }}
      >
        {/* Image — taller */}
        <div className="relative h-20 overflow-hidden" style={{ background: `${accent}22` }}>
          {recipe.imageUrl
            ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: `${accent}18` }}>
                🍽️
              </div>
            )}
          {/* Diet/style badge — bottom left of image */}
          {badge && (
            <div
              className="absolute bottom-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold leading-none shadow-sm"
              style={{ background: badge.bg, color: badge.text }}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-2 pt-2.5">
          <p className="text-[10px] font-display text-foreground line-clamp-2 leading-tight mb-2">
            {recipe.title}
          </p>
          <div className="flex flex-wrap items-center gap-1 min-w-0">
            {/* Cuisine tag — own unique color */}
            {cuisineStyle ? (
              <span
                className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                style={{ background: cuisineStyle.bg, color: cuisineStyle.text }}
              >
                {cuisineStyle.flag} {recipe.cuisine}
              </span>
            ) : recipe.cuisine ? (
              <span
                className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                style={{ background: '#2563eb', color: '#fff' }}
              >
                🌍 {recipe.cuisine}
              </span>
            ) : null}
            {/* Kcal */}
            {recipe.kcal ? (
              <span className="flex-shrink-0 flex items-center gap-0.5 text-[8px] font-bold" style={{ color: accent }}>
                🔥{recipe.kcal}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute top-2 right-1.5 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center hover:scale-110 transition-transform z-10 shadow-sm"
        style={{ background: accent }}
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}

// ── RecipePicker modal ─────────────────────────────────────────────────────────

function RecipePicker({
  onAdd,
  onClose,
  savedOnly = false,
}: {
  onAdd: (recipes: Recipe[]) => void;
  onClose: () => void;
  savedOnly?: boolean;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const url = savedOnly ? '/api/saved-recipes' : '/api/recipes';
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(data => {
        const items: Recipe[] = Array.isArray(data) ? data : data.recipes || data.savedRecipes || [];
        setRecipes(items);
      })
      .finally(() => setLoading(false));
  }, [savedOnly]);

  const filtered = recipes.filter(r =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.cuisine || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const confirmAdd = () => {
    onAdd(recipes.filter(r => selected.has(r.id)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-display text-foreground">
            {savedOnly ? '📚 Add from Library' : '📖 Add from Browser'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {savedOnly ? 'Choose from your saved recipes' : 'Browse all recipes'}
          </p>
        </div>
        <button
          disabled={selected.size === 0}
          onClick={confirmAdd}
          className={`px-4 py-2 rounded-xl text-sm font-display uppercase tracking-widest transition-all ${
            selected.size > 0
              ? 'bg-accent text-accent-foreground hover:brightness-105'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Add {selected.size > 0 ? selected.size : ''} to Queue
        </button>
      </div>

      <div className="px-4 py-3 border-b border-border flex-shrink-0">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                <div className="h-32 bg-muted" />
                <div className="p-2"><div className="h-3 bg-muted rounded w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-sm">{savedOnly ? 'No saved recipes yet' : 'No recipes found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(recipe => {
              const isSel = selected.has(recipe.id);
              const accent = getAccentColor(recipe);
              return (
                <button
                  key={recipe.id}
                  onClick={() => toggle(recipe.id)}
                  aria-pressed={isSel}
                  className={`text-left rounded-xl overflow-hidden border-2 transition-all ${
                    isSel ? 'shadow-md' : 'border-transparent hover:border-border'
                  }`}
                  style={isSel ? { borderColor: accent } : {}}
                >
                  <div className="h-[3px]" style={{ background: accent }} />
                  <div className="relative h-32 bg-muted" style={{ background: `${accent}18` }}>
                    {recipe.imageUrl
                      ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                    {isSel && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: accent }}>
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {recipe.cuisine && (
                      <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {recipe.cuisine}
                      </span>
                    )}
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-display text-foreground line-clamp-2">{recipe.title}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {recipe.timeMins ? `${recipe.timeMins}m` : ''}
                      {recipe.kcal ? ` · ${recipe.kcal} kcal` : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const [queueRecipes, setQueueRecipes] = useState<Recipe[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('feast_menu_queue');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [pickerMode, setPickerMode] = useState<'library' | 'browser' | null>(null);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [dragging, setDragging] = useState<{ recipe: Recipe; source: DragSource } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Date range
  const [fromDate, setFromDate] = useState(getTodayISO);
  const [toDate, setToDate] = useState(getDefaultToDate);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Persist queue
  useEffect(() => {
    try { localStorage.setItem('feast_menu_queue', JSON.stringify(queueRecipes)); } catch {}
  }, [queueRecipes]);

  // Fetch plan
  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace('/auth/signin'); return; }
    fetch('/api/plans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.plan) setPlan(data.plan); })
      .finally(() => setLoading(false));
  }, []);

  // Close add popover on outside click
  useEffect(() => {
    if (!addPopoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAddPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addPopoverOpen]);

  const getMealsForDate = (dateISO: string): PlanMeal[] =>
    plan?.meals.filter(m => m.dateISO === dateISO) ?? [];

  const handleDrop = async (targetDateISO: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging || !plan) return;

    const { recipe, source } = dragging;
    setDragging(null);
    const token = getToken();

    if (source.type === 'slot') {
      // Moving between slots — skip if same date
      if (source.dateISO === targetDateISO) return;

      // Delete from old slot
      const delRes = await fetch(`/api/plans/${plan.id}/meals/${source.mealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (delRes.ok) {
        setPlan(p => p ? { ...p, meals: p.meals.filter(m => m.id !== source.mealId) } : p);
      }

      // Create in new slot
      const createRes = await fetch(`/api/plans/${plan.id}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipeId: recipe.id, dateISO: targetDateISO, slot: 'any' }),
      });
      if (createRes.ok) {
        const { meal } = await createRes.json();
        setPlan(p => p ? { ...p, meals: [...p.meals, meal] } : p);
      }
    } else {
      // From queue
      const res = await fetch(`/api/plans/${plan.id}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipeId: recipe.id, dateISO: targetDateISO, slot: 'any' }),
      });
      if (res.ok) {
        const { meal } = await res.json();
        setPlan(p => p ? { ...p, meals: [...p.meals, meal] } : p);
        setQueueRecipes(prev => prev.filter(r => r.id !== recipe.id));
      }
    }
  };

  const removeMeal = async (meal: PlanMeal) => {
    if (!plan) return;
    setPlan(p => p ? { ...p, meals: p.meals.filter(m => m.id !== meal.id) } : p);
    const token = getToken();
    await fetch(`/api/plans/${plan.id}/meals/${meal.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const addToQueue = (recipes: Recipe[]) => {
    setQueueRecipes(prev => {
      const ids = new Set(prev.map(r => r.id));
      return [...prev, ...recipes.filter(r => !ids.has(r.id))];
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm font-display uppercase tracking-widest">
          Preparing your menu…
        </p>
      </div>
    );
  }

  const todayISO = getTodayISO();
  const dates = getDateRange(fromDate, toDate);

  return (
    <>
      {pickerMode && (
        <RecipePicker
          savedOnly={pickerMode === 'library'}
          onAdd={recipes => { addToQueue(recipes); setPickerMode(null); }}
          onClose={() => setPickerMode(null)}
        />
      )}

      <div className="min-h-screen bg-background">

        {/* ── Sticky header ───────────────────────────────────────────── */}
        <div className="sticky top-16 z-20 bg-background border-b border-border/60">

          {/* Title row + date range + shopping list */}
          <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-display text-foreground tracking-tight">My Menu</h1>

            {/* Date range — one-click native pickers */}
            <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
              {/* FROM */}
              <div className="relative">
                <input
                  ref={fromInputRef}
                  type="date" value={fromDate}
                  onChange={e => {
                    setFromDate(e.target.value);
                    if (e.target.value > toDate) setToDate(e.target.value);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  tabIndex={-1}
                />
                <button
                  onClick={() => fromInputRef.current?.showPicker?.()}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs border border-border bg-muted text-foreground hover:border-accent/50 transition-colors pointer-events-auto relative z-10"
                >
                  <span className="text-[9px] uppercase tracking-widest font-display opacity-60">From</span>
                  <span className="font-display font-semibold">{formatDisplayDate(fromDate)}</span>
                </button>
              </div>

              <span className="text-muted-foreground/50 text-sm select-none">→</span>

              {/* TO */}
              <div className="relative">
                <input
                  ref={toInputRef}
                  type="date" value={toDate} min={fromDate}
                  onChange={e => setToDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  tabIndex={-1}
                />
                <button
                  onClick={() => toInputRef.current?.showPicker?.()}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs border border-border bg-muted text-foreground hover:border-accent/50 transition-colors pointer-events-auto relative z-10"
                >
                  <span className="text-[9px] uppercase tracking-widest font-display opacity-60">To</span>
                  <span className="font-display font-semibold">{formatDisplayDate(toDate)}</span>
                </button>
              </div>
            </div>

            {plan && (
              <Link href={`/groceries?planId=${plan.id}`}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-display text-foreground hover:bg-muted transition-colors whitespace-nowrap">
                  🛒 Shopping List
                </button>
              </Link>
            )}
          </div>

          {/* Queue — wrapping grid with inline + button */}
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Queue</span>
              {queueRecipes.length > 0 && (
                <span className="text-[9px] bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 font-display leading-none">
                  {queueRecipes.length}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/40 ml-1">· drag onto a day ↓</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {queueRecipes.map(recipe => (
                <RecipeChip
                  key={recipe.id}
                  recipe={recipe}
                  draggable
                  onDragStart={() => setDragging({ recipe, source: { type: 'queue' } })}
                  onDragEnd={() => setDragging(null)}
                  isDragging={dragging?.recipe.id === recipe.id}
                  onRemove={() => setQueueRecipes(prev => prev.filter(r => r.id !== recipe.id))}
                />
              ))}

              {/* + button — always last in the flow */}
              <div ref={popoverRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setAddPopoverOpen(v => !v)}
                  className={`w-36 h-[120px] flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl transition-colors ${
                    addPopoverOpen
                      ? 'border-accent bg-accent/10'
                      : 'border-accent/60 bg-accent/5 hover:bg-accent/10 hover:border-accent'
                  }`}
                  aria-label="Add recipes to queue"
                >
                  <span className="text-2xl text-accent font-light leading-none">＋</span>
                  <span className="text-[9px] font-display text-accent uppercase tracking-widest">Add</span>
                </button>

                {addPopoverOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden w-48">
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-[9px] uppercase tracking-widest font-display text-muted-foreground">Add to queue</p>
                    </div>
                    <button
                      onClick={() => { setAddPopoverOpen(false); setPickerMode('library'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors border-b border-border/30"
                    >
                      <span>📚</span>
                      <div className="text-left">
                        <p className="text-sm font-display text-foreground">Library</p>
                        <p className="text-[10px] text-muted-foreground">Your saved recipes</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setAddPopoverOpen(false); setPickerMode('browser'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-foreground hover:bg-muted transition-colors"
                    >
                      <span>📖</span>
                      <div className="text-left">
                        <p className="text-sm font-display text-foreground">Browse</p>
                        <p className="text-[10px] text-muted-foreground">All recipes</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Vertical calendar ────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3 pb-24">
          {dates.map(dateISO => {
            const isToday = dateISO === todayISO;
            const d = new Date(dateISO + 'T00:00:00');
            const dayName = d.toLocaleDateString('en', { weekday: 'short' });
            const dayNum = d.getDate();
            const month = d.toLocaleDateString('en', { month: 'short' });
            const meals = getMealsForDate(dateISO);
            const isOver = dragOver === dateISO;

            return (
              <div key={dateISO} id={`day-${dateISO}`} className="flex items-stretch gap-3">

                {/* Day label */}
                <div className={`w-12 flex-shrink-0 flex flex-col items-center justify-center rounded-xl py-2 transition-colors ${
                  isToday
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted border border-border text-foreground'
                }`}>
                  <span className={`text-[9px] uppercase tracking-wide leading-none ${
                    isToday ? 'text-accent-foreground/80' : 'text-muted-foreground'
                  }`}>{dayName}</span>
                  <span className="text-lg font-display font-bold leading-tight">{dayNum}</span>
                  <span className={`text-[9px] leading-none ${
                    isToday ? 'text-accent-foreground/70' : 'text-muted-foreground'
                  }`}>{month}</span>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(dateISO); }}
                  onDragLeave={e => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                  }}
                  onDrop={e => handleDrop(dateISO, e)}
                  className={`flex-1 min-h-[80px] rounded-xl border-2 transition-all ${
                    isOver
                      ? 'border-accent bg-accent/5 scale-[1.01]'
                      : meals.length > 0
                      ? 'border-border bg-card'
                      : 'border-dashed border-border/50 bg-card hover:border-border'
                  }`}
                >
                  {meals.length === 0 ? (
                    <div className="h-full min-h-[80px] flex items-center justify-center text-[11px] text-muted-foreground/40 select-none">
                      {isOver ? '📌 Drop here' : 'Drag recipes here'}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-2">
                      {meals.map(meal => meal.recipe && (
                        <RecipeChip
                          key={meal.id}
                          recipe={meal.recipe}
                          draggable
                          onDragStart={() => setDragging({
                            recipe: meal.recipe!,
                            source: { type: 'slot', mealId: meal.id, dateISO }
                          })}
                          onDragEnd={() => setDragging(null)}
                          isDragging={dragging?.source.type === 'slot' && (dragging.source as any).mealId === meal.id}
                          onRemove={() => removeMeal(meal)}
                        />
                      ))}
                      <div className={`flex-shrink-0 w-16 min-h-[80px] rounded-xl border-2 border-dashed flex items-center justify-center text-xl transition-colors ${
                        isOver ? 'border-accent text-accent' : 'border-border/40 text-muted-foreground/30'
                      }`}>
                        ⊕
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
