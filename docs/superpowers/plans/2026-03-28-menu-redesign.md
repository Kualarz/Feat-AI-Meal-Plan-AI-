# Menu Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename Planner → Menu throughout the app and replace the horizontal grid with a vertical-day calendar, a Queue staging strip with a single holo-plus add button, rich recipe chips (image + diet badge + country flag + calories), and a custom From/To date range selector.

**Architecture:** Single new page at `app/menu/page.tsx` (client component). Two API changes — meals POST must accept `slot: "any"` and always-create rather than upsert. Navigation components updated in-place. Old `/planner` route becomes a redirect.

**Tech Stack:** Next.js 14 App Router · React drag-and-drop (HTML5 native) · Prisma/SQLite · Tailwind CSS · TypeScript

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/menu/page.tsx` | Create | Full redesigned Menu page — types, helpers, RecipeChip, RecipePicker, Queue, Calendar |
| `app/planner/page.tsx` | Modify | Replace contents with redirect to `/menu` |
| `components/Navbar.tsx` | Modify | Update `/planner` → `/menu`, "Planner" → "Menu" |
| `components/MainNavigation.tsx` | Modify | Update `/planner` → `/menu`, "Meal Planner" → "Menu" |
| `app/api/plans/[planId]/meals/route.ts` | Modify | Add `"any"` to valid slots; always-create when slot is `"any"` |

---

## Task 1: Fix Meals API — accept `slot: "any"` and always-create

**Files:**
- Modify: `app/api/plans/[planId]/meals/route.ts`

The current route rejects any slot not in `['breakfast','lunch','dinner','dessert']` and upserts (replaces) on same slot+date. The new design uses `slot: "any"` and allows multiple meals per day.

- [ ] **Step 1: Open the file and read the current POST handler**

Read `app/api/plans/[planId]/meals/route.ts`. Confirm it contains `const validSlots = ['breakfast', 'lunch', 'dinner', 'dessert']` and the upsert block.

- [ ] **Step 2: Replace the POST handler body**

Replace the entire contents of `app/api/plans/[planId]/meals/route.ts` with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

// POST /api/plans/[planId]/meals — add a meal to a plan
export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    const plan = await db.plan.findUnique({ where: { id: params.planId } });
    if (!plan || plan.userId !== user.userId) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const { recipeId, dateISO, slot } = await request.json();
    if (!recipeId || !dateISO || !slot) {
      return NextResponse.json({ error: 'recipeId, dateISO, slot are required' }, { status: 400 });
    }

    const validSlots = ['breakfast', 'lunch', 'dinner', 'dessert', 'any'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    let meal;
    if (slot === 'any') {
      // Free-form: always create — multiple recipes per day are allowed
      meal = await db.planMeal.create({
        data: { planId: params.planId, recipeId, dateISO, slot },
        include: { recipe: true },
      });
    } else {
      // Fixed slot: upsert — replace existing meal in that slot/date
      const existing = await db.planMeal.findFirst({
        where: { planId: params.planId, dateISO, slot },
      });
      if (existing) {
        meal = await db.planMeal.update({
          where: { id: existing.id },
          data: { recipeId },
          include: { recipe: true },
        });
      } else {
        meal = await db.planMeal.create({
          data: { planId: params.planId, recipeId, dateISO, slot },
          include: { recipe: true },
        });
      }
    }

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to add meal');
    return NextResponse.json(response, { status: statusCode });
  }
}
```

- [ ] **Step 3: Verify the dev server compiles without errors**

Run: `npm run build 2>&1 | tail -20`
Expected: No TypeScript errors in `app/api/plans/[planId]/meals/route.ts`

- [ ] **Step 4: Commit**

```bash
git add app/api/plans/[planId]/meals/route.ts
git commit -m "fix: accept slot 'any' in meals API, always-create for free-form days"
```

---

## Task 2: Update Navbar and MainNavigation

**Files:**
- Modify: `components/Navbar.tsx:76`
- Modify: `components/MainNavigation.tsx:51-62`

- [ ] **Step 1: Update Navbar**

In `components/Navbar.tsx`, find the line:
```tsx
{navLink('/planner', '📅', 'Planner')}
```
Replace with:
```tsx
{navLink('/menu', '📅', 'Menu')}
```

- [ ] **Step 2: Update MainNavigation**

In `components/MainNavigation.tsx`, find the block:
```tsx
<Link
  href="/planner"
  aria-label="Meal Planner"
  className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
    isActive('/planner')
      ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
      : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
  }`}
>
  <span className="text-lg mr-2" aria-hidden="true">📅</span>
  Meal Planner
</Link>
```
Replace with:
```tsx
<Link
  href="/menu"
  aria-label="Menu"
  className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
    isActive('/menu')
      ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
      : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
  }`}
>
  <span className="text-lg mr-2" aria-hidden="true">📅</span>
  Menu
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx components/MainNavigation.tsx
git commit -m "feat: rename Planner → Menu in navigation"
```

---

## Task 3: Redirect `/planner` to `/menu`

**Files:**
- Modify: `app/planner/page.tsx`

- [ ] **Step 1: Replace the planner page with a redirect**

Replace the entire contents of `app/planner/page.tsx` with:

```typescript
import { redirect } from 'next/navigation';

export default function PlannerRedirect() {
  redirect('/menu');
}
```

- [ ] **Step 2: Confirm no TypeScript errors**

Run: `npm run build 2>&1 | grep "planner"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/planner/page.tsx
git commit -m "feat: redirect /planner to /menu"
```

---

## Task 4: Create `app/menu/page.tsx` — types, helpers, RecipeChip

**Files:**
- Create: `app/menu/page.tsx`

This task creates the file with the types, constants, helper functions, and the `RecipeChip` component. The main page export is added in Task 5–6.

- [ ] **Step 1: Create the file with types and diet badge config**

Create `app/menu/page.tsx` with:

```typescript
'use client';

import { useState, useEffect } from 'react';
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

// ── Diet badge config ──────────────────────────────────────────────────────────

const DIET_BADGES: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  vegetarian:     { label: 'Veg',     icon: '🥦', bg: '#22c55e', text: '#fff' },
  vegan:          { label: 'Vegan',   icon: '🌱', bg: '#16a34a', text: '#fff' },
  halal:          { label: 'Halal',   icon: '🕌', bg: '#7c3aed', text: '#fff' },
  pescatarian:    { label: 'Pesc.',   icon: '🐟', bg: '#0ea5e9', text: '#fff' },
  keto:           { label: 'Keto',    icon: '🥑', bg: '#f59e0b', text: '#111' },
  'high-protein': { label: 'Protein', icon: '💪', bg: '#f97316', text: '#fff' },
  mediterranean:  { label: 'Med.',    icon: '🫒', bg: '#06b6d4', text: '#fff' },
  paleo:          { label: 'Paleo',   icon: '🍗', bg: '#ea580c', text: '#fff' },
  flexitarian:    { label: 'Flex.',   icon: '🌿', bg: '#84cc16', text: '#fff' },
  'gluten-free':  { label: 'GF',      icon: '🌾', bg: '#eab308', text: '#111' },
  'dairy-free':   { label: 'DF',      icon: '🥛', bg: '#38bdf8', text: '#111' },
  'whole30':      { label: 'W30',     icon: '⏱️', bg: '#ef4444', text: '#fff' },
  carnivore:      { label: 'Carn.',   icon: '🥩', bg: '#be123c', text: '#fff' },
  'low-fodmap':   { label: 'FODMAP',  icon: '🫙', bg: '#a855f7', text: '#fff' },
  'raw-food':     { label: 'Raw',     icon: '🥗', bg: '#14b8a6', text: '#fff' },
};

const CUISINE_FLAGS: Record<string, string> = {
  Cambodian: '🇰🇭', Khmer: '🇰🇭',
  Thai: '🇹🇭', Vietnamese: '🇻🇳',
  Italian: '🇮🇹', Japanese: '🇯🇵',
  Chinese: '🇨🇳', Indian: '🇮🇳',
  Mexican: '🇲🇽', American: '🇺🇸',
  French: '🇫🇷', Korean: '🇰🇷',
  Malaysian: '🇲🇾', Indonesian: '🇮🇩',
  Filipino: '🇵🇭', Greek: '🇬🇷',
  Spanish: '🇪🇸', Lebanese: '🇱🇧',
  Singaporean: '🇸🇬', British: '🇬🇧',
};

function getDietBadge(dietTags: string | null) {
  if (!dietTags) return null;
  const first = dietTags.split(',')[0].trim().toLowerCase();
  return DIET_BADGES[first] ?? { label: first, icon: '🍖', bg: '#6b7280', text: '#fff' };
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

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getDefaultToDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}
```

- [ ] **Step 2: Append the RecipeChip component to the same file**

Append to `app/menu/page.tsx`:

```typescript
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
  const flag = recipe.cuisine ? (CUISINE_FLAGS[recipe.cuisine] ?? '🌍') : null;

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative flex-shrink-0 w-28 rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all select-none ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-accent/50' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      <Link
        href={`/recipes/${recipe.id}`}
        className="block"
        onClick={e => { if (isDraggable) e.preventDefault(); }}
      >
        {/* Image */}
        <div className="relative h-16 bg-muted overflow-hidden">
          {recipe.imageUrl
            ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
          {/* Diet badge */}
          {badge && (
            <div
              className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold leading-none"
              style={{ background: badge.bg, color: badge.text }}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          )}
        </div>
        {/* Body */}
        <div className="p-1.5">
          <p className="text-[8.5px] font-display text-foreground line-clamp-2 leading-tight mb-1.5">
            {recipe.title}
          </p>
          <div className="flex items-center justify-between gap-1 min-w-0">
            {flag && recipe.cuisine ? (
              <span className="flex items-center gap-0.5 bg-muted rounded-full px-1.5 py-0.5 text-[7px] text-muted-foreground truncate">
                {flag} <span className="truncate">{recipe.cuisine}</span>
              </span>
            ) : <span />}
            {recipe.kcal ? (
              <span className="flex-shrink-0 flex items-center gap-0.5 text-[7.5px] font-bold text-orange-500">
                🔥{recipe.kcal}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      {/* Remove button — outside Link to prevent navigation */}
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/50 text-white text-[9px] flex items-center justify-center hover:bg-destructive transition-colors z-10"
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify the file parses without errors**

Run: `npx tsc --noEmit 2>&1 | grep "menu/page"`
Expected: No output (no errors).

---

## Task 5: Add RecipePicker and Queue strip to `app/menu/page.tsx`

**Files:**
- Modify: `app/menu/page.tsx` (append)

- [ ] **Step 1: Append the RecipePicker component**

Append to `app/menu/page.tsx`:

```typescript
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
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
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

      {/* Search */}
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

      {/* Grid */}
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
              return (
                <button
                  key={recipe.id}
                  onClick={() => toggle(recipe.id)}
                  aria-pressed={isSel}
                  className={`text-left rounded-xl overflow-hidden border-2 transition-all ${
                    isSel ? 'border-accent shadow-md' : 'border-transparent hover:border-border'
                  }`}
                >
                  <div className="relative h-32 bg-muted">
                    {recipe.imageUrl
                      ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                    {isSel && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                          <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | grep "menu/page"`
Expected: No output.

---

## Task 6: Add the main `MenuPage` export to `app/menu/page.tsx`

**Files:**
- Modify: `app/menu/page.tsx` (append)

- [ ] **Step 1: Append the main page component**

Append to `app/menu/page.tsx`:

```typescript
// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueRecipes, setQueueRecipes] = useState<Recipe[]>([]);
  const [pickerMode, setPickerMode] = useState<'library' | 'browser' | null>(null);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [dragging, setDragging] = useState<Recipe | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(getTodayISO);
  const [toDate, setToDate] = useState(getDefaultToDate);

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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

  const getMealsForDate = (dateISO: string): PlanMeal[] =>
    plan?.meals.filter(m => m.dateISO === dateISO) ?? [];

  const handleDrop = async (dateISO: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging || !plan) return;
    const token = getToken();
    const res = await fetch(`/api/plans/${plan.id}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipeId: dragging.id, dateISO, slot: 'any' }),
    });
    if (res.ok) {
      const { meal } = await res.json();
      setPlan(p => p ? { ...p, meals: [...p.meals, meal] } : p);
    }
    setDragging(null);
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

  const dates = getDateRange(fromDate, toDate);
  const todayISO = getTodayISO();

  return (
    <>
      {pickerMode && (
        <RecipePicker
          savedOnly={pickerMode === 'library'}
          onAdd={recipes => { addToQueue(recipes); setPickerMode(null); }}
          onClose={() => setPickerMode(null)}
        />
      )}

      {/* Click-away overlay for popover */}
      {addPopoverOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setAddPopoverOpen(false)}
        />
      )}

      <div className="min-h-screen bg-background">

        {/* ── Sticky header zone ───────────────────────────────────────────── */}
        <div className="sticky top-16 z-20 bg-background border-b border-border/60">

          {/* Page header row */}
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-display text-foreground tracking-tight">My Menu</h1>

            {/* Date range picker */}
            <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
              <label className="flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-body cursor-pointer hover:border-accent/50 transition-colors">
                <span className="text-muted-foreground">From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="bg-transparent text-foreground font-medium text-xs focus:outline-none cursor-pointer"
                />
              </label>
              <span className="text-muted-foreground text-sm">→</span>
              <label className="flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-body cursor-pointer hover:border-accent/50 transition-colors">
                <span className="text-muted-foreground">To</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={e => setToDate(e.target.value)}
                  className="bg-transparent text-foreground font-medium text-xs focus:outline-none cursor-pointer"
                />
              </label>
            </div>

            {plan && (
              <Link href={`/groceries?planId=${plan.id}`}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-display text-foreground hover:bg-muted transition-colors whitespace-nowrap">
                  🛒 Shopping List
                </button>
              </Link>
            )}
          </div>

          {/* Queue strip */}
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                Queue
              </span>
              {queueRecipes.length > 0 && (
                <span className="text-[9px] bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 font-display leading-none">
                  {queueRecipes.length}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/50 ml-1">
                · drag onto a day below ↓
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {/* Queued recipe chips */}
              {queueRecipes.map(recipe => (
                <RecipeChip
                  key={recipe.id}
                  recipe={recipe}
                  draggable
                  onDragStart={() => setDragging(recipe)}
                  onDragEnd={() => setDragging(null)}
                  isDragging={dragging?.id === recipe.id}
                  onRemove={() => setQueueRecipes(prev => prev.filter(r => r.id !== recipe.id))}
                />
              ))}

              {/* Holo-plus add button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setAddPopoverOpen(v => !v)}
                  className="w-28 h-[98px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-accent rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors"
                  aria-label="Add recipes to queue"
                >
                  <span className="text-2xl text-accent font-light leading-none">＋</span>
                  <span className="text-[9px] font-display text-accent uppercase tracking-widest">Add</span>
                </button>

                {/* Popover */}
                {addPopoverOpen && (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 z-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-36">
                    <button
                      onClick={() => { setAddPopoverOpen(false); setPickerMode('library'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-body text-foreground hover:bg-muted transition-colors border-b border-border/50"
                    >
                      <span>📚</span> Library
                    </button>
                    <button
                      onClick={() => { setAddPopoverOpen(false); setPickerMode('browser'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-body text-foreground hover:bg-muted transition-colors"
                    >
                      <span>📖</span> Browse
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
              <div key={dateISO} className="flex items-stretch gap-3">

                {/* Day label column */}
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
                    <div className="flex gap-2 p-2 overflow-x-auto">
                      {meals.map(meal => meal.recipe && (
                        <RecipeChip
                          key={meal.id}
                          recipe={meal.recipe}
                          onRemove={() => removeMeal(meal)}
                        />
                      ))}
                      {/* Drop hint tile at end */}
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
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No errors in `app/menu/page.tsx`. Fix any type errors before continuing.

- [ ] **Step 3: Start the dev server and manually verify**

Run: `npm run dev`

Open `http://localhost:3000/menu` and check:
- [ ] Page loads showing "My Menu" header
- [ ] Date range picker shows today → today+6, both inputs are tappable
- [ ] Queue strip shows the holo `＋` button
- [ ] Clicking `＋` opens a popover with "📚 Library" and "📖 Browse" options
- [ ] Clicking outside the popover closes it
- [ ] Clicking Library or Browse opens the full-screen recipe picker
- [ ] Selecting recipes and clicking "Add to Queue" adds chips to the queue
- [ ] Queue chips show: image, diet badge (if dietTags set), title, flag + cuisine, 🔥 calories
- [ ] Dragging a queue chip onto a day row drops and shows the chip in that row
- [ ] Clicking ✕ on a queue chip removes it from the queue
- [ ] Clicking ✕ on a placed chip calls DELETE and removes it from the day
- [ ] Tapping a chip (not the ✕) navigates to `/recipes/[id]`
- [ ] Changing the From/To dates updates the visible day rows
- [ ] `/planner` redirects to `/menu`
- [ ] Navbar shows "Menu" link, not "Planner"

- [ ] **Step 4: Commit**

```bash
git add app/menu/page.tsx
git commit -m "feat: add Menu page — vertical calendar, queue, recipe chips with diet badges"
```

---

## Self-Review Checklist

| Spec requirement | Task that covers it |
|---|---|
| Route rename `/planner` → `/menu` | Task 3 |
| Navbar label "Planner" → "Menu" | Task 2 |
| MainNavigation label "Meal Planner" → "Menu" | Task 2 |
| Sticky header (top-16) | Task 6, `sticky top-16 z-20` |
| From/To date range picker | Task 6, `<input type="date">` |
| Default date range today → today+6 | Task 6, `getDefaultToDate()` |
| Vertical day rows (not horizontal columns) | Task 6, `space-y-3` vertical layout |
| Free-form drop zone (no fixed slots) | Task 1 (`slot: "any"`), Task 6 |
| Multiple recipes per day allowed | Task 1 (always-create for `slot: "any"`) |
| Queue strip always visible | Task 5 (inside sticky header zone) |
| Single holo-plus with popover | Task 6 |
| Library / Browse popover options | Task 6 |
| Recipe chip: image | Task 4 |
| Recipe chip: diet badge (colour-coded, from `dietTags`) | Task 4, `DIET_BADGES` |
| Recipe chip: ✕ remove button | Task 4 |
| Recipe chip: title | Task 4 |
| Recipe chip: country flag + cuisine | Task 4, `CUISINE_FLAGS` |
| Recipe chip: 🔥 calorie count | Task 4 |
| Chip links to recipe page | Task 4, `<Link href="/recipes/[id]">` |
| Queue chips draggable, placed chips not | Task 4, `draggable` prop |
| Drag-over highlight on day row | Task 6, `isOver` state |
| Shopping list link | Task 6 |
| `/planner` redirects to `/menu` | Task 3 |
