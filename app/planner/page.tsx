'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/Button';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Recipe {
  id: string;
  title: string;
  imageUrl: string | null;
  cuisine: string | null;
  timeMins: number | null;
  kcal: number | null;
  difficulty: string | null;
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

// ── Helpers ────────────────────────────────────────────────────────────────────

const SLOTS = ['breakfast', 'lunch', 'dinner', 'dessert'] as const;
const SLOT_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', dessert: '🍰' };
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(): string[] {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

// ── Recipe Picker ──────────────────────────────────────────────────────────────

function RecipePicker({ onAdd, onClose }: { onAdd: (r: Recipe[]) => void; onClose: () => void }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(data => setRecipes(Array.isArray(data) ? data : data.recipes || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.cuisine || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-foreground flex-1">Select Recipes for Menu</h2>
        <Button variant="primary" disabled={selected.size === 0}
          onClick={() => { onAdd(recipes.filter(r => selected.has(r.id))); onClose(); }}>
          Add {selected.size > 0 ? selected.size : ''} to Menu
        </Button>
      </div>

      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="w-full pl-9 pr-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => <div key={i} className="rounded-xl overflow-hidden animate-pulse"><div className="h-32 bg-muted" /><div className="p-2"><div className="h-3 bg-muted rounded w-3/4" /></div></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(recipe => {
              const isSel = selected.has(recipe.id);
              return (
                <button key={recipe.id} onClick={() => toggle(recipe.id)}
                  className={`text-left rounded-xl overflow-hidden border-2 transition-all ${isSel ? 'border-primary shadow-md' : 'border-transparent hover:border-border'}`}>
                  <div className="relative h-32 bg-muted">
                    {recipe.imageUrl
                      ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                    {isSel && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>
                    )}
                    {recipe.cuisine && <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">{recipe.cuisine}</span>}
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium text-foreground line-clamp-2">{recipe.title}</p>
                    <p className="text-xs text-muted-foreground">{recipe.timeMins ? `${recipe.timeMins}m` : ''}{recipe.kcal ? ` · ${recipe.kcal} kcal` : ''}</p>
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

export default function PlannerPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuRecipes, setMenuRecipes] = useState<Recipe[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [trayOpen, setTrayOpen] = useState(true);
  const [dragging, setDragging] = useState<Recipe | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const weekDates = getWeekDates();

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace('/auth/signin'); return; }
    initPlan(token);
  }, []);

  const initPlan = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPlan((await res.json()).plan);
    } finally {
      setLoading(false);
    }
  };

  const getMeal = (dateISO: string, slot: string) =>
    plan?.meals.find(m => m.dateISO === dateISO && m.slot === slot);

  const handleDrop = async (dateISO: string, slot: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging || !plan) return;

    const prev = getMeal(dateISO, slot);
    const temp: PlanMeal = { id: `temp-${Date.now()}`, dateISO, slot, recipe: dragging };

    // Optimistic update
    setPlan(p => p ? { ...p, meals: [...p.meals.filter(m => !(m.dateISO === dateISO && m.slot === slot)), temp] } : p);

    const token = getToken();
    const res = await fetch(`/api/plans/${plan.id}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipeId: dragging.id, dateISO, slot }),
    });

    if (res.ok) {
      const { meal } = await res.json();
      setPlan(p => p ? { ...p, meals: [...p.meals.filter(m => m.id !== temp.id && !(m.dateISO === dateISO && m.slot === slot)), meal] } : p);
    } else {
      // Rollback
      setPlan(p => p ? { ...p, meals: [...p.meals.filter(m => m.id !== temp.id), ...(prev ? [prev] : [])] } : p);
    }
    setDragging(null);
  };

  const removeMeal = async (meal: PlanMeal) => {
    if (!plan) return;
    setPlan(p => p ? { ...p, meals: p.meals.filter(m => m.id !== meal.id) } : p);
    await fetch(`/api/plans/${plan.id}/meals/${meal.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  };

  const addToMenu = (recipes: Recipe[]) => {
    setMenuRecipes(prev => {
      const ids = new Set(prev.map(r => r.id));
      return [...prev, ...recipes.filter(r => !ids.has(r.id))];
    });
    setTrayOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading planner…</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {showPicker && <RecipePicker onAdd={addToMenu} onClose={() => setShowPicker(false)} />}

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-card border-b border-border px-4 py-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Meal Planner</h1>
                  <p className="text-sm text-muted-foreground">{weekDates[0]} — {weekDates[6]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="primary" onClick={() => setShowPicker(true)}>+ Add to Menu</Button>
                  {plan && (
                    <Link href={`/groceries?planId=${plan.id}`}>
                      <Button variant="outline" className="text-sm">🛒 Shopping List</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Week grid */}
            <div className="flex-1 overflow-auto p-4">
              <div className="min-w-[680px]">
                {/* Day headers */}
                <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
                  <div />
                  {weekDates.map((date, i) => (
                    <div key={date} className={`text-center py-1.5 rounded-lg text-xs font-semibold ${date === today ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                      <div>{DAY_LABELS[i]}</div>
                      <div className="font-normal">{new Date(date + 'T00:00:00').getDate()}</div>
                    </div>
                  ))}
                </div>

                {/* Slot rows */}
                {SLOTS.map(slot => (
                  <div key={slot} className="grid gap-1 mb-1.5" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
                    <div className="flex flex-col items-center justify-center text-xs text-muted-foreground font-medium py-1 gap-0.5">
                      <span className="text-base">{SLOT_ICONS[slot]}</span>
                      <span className="capitalize">{slot}</span>
                    </div>

                    {weekDates.map(date => {
                      const meal = getMeal(date, slot);
                      const cellKey = `${date}-${slot}`;
                      const isOver = dragOver === cellKey;

                      return (
                        <div
                          key={cellKey}
                          onDragOver={e => { e.preventDefault(); setDragOver(cellKey); }}
                          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
                          onDrop={e => handleDrop(date, slot, e)}
                          className={`min-h-[88px] rounded-xl border-2 transition-all ${
                            isOver
                              ? 'border-primary bg-primary/10'
                              : meal?.recipe
                              ? 'border-border bg-card hover:border-primary/40'
                              : 'border-dashed border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/40'
                          }`}
                        >
                          {meal?.recipe ? (
                            <div className="relative p-1.5 group h-full">
                              {meal.recipe.imageUrl && (
                                <img src={meal.recipe.imageUrl} alt={meal.recipe.title}
                                  className="w-full h-12 object-cover rounded-lg mb-1" />
                              )}
                              <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                                {meal.recipe.title}
                              </p>
                              {meal.recipe.timeMins && (
                                <p className="text-xs text-muted-foreground mt-0.5">⏱ {meal.recipe.timeMins}m</p>
                              )}
                              <button
                                onClick={() => removeMeal(meal)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 border border-border text-xs text-muted-foreground hover:text-destructive hover:border-destructive hidden group-hover:flex items-center justify-center transition-colors"
                              >✕</button>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center p-1">
                              <span className="text-xs text-muted-foreground/40 text-center">
                                {isOver ? '📌 Drop' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Tray */}
            {menuRecipes.length > 0 && (
              <div className="border-t border-border bg-card shadow-lg flex-shrink-0">
                <button
                  onClick={() => setTrayOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground">
                    📋 Menu — {menuRecipes.length} recipe{menuRecipes.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="hidden sm:block">Drag onto calendar to schedule</span>
                    <svg className={`w-4 h-4 transition-transform ${trayOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {trayOpen && (
                  <div className="flex gap-3 px-4 pb-4 pt-1 overflow-x-auto">
                    {menuRecipes.map(recipe => (
                      <div
                        key={recipe.id}
                        draggable
                        onDragStart={() => setDragging(recipe)}
                        onDragEnd={() => setDragging(null)}
                        className={`flex-shrink-0 w-36 rounded-xl border border-border bg-background overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all hover:shadow-md hover:border-primary/50 ${dragging?.id === recipe.id ? 'opacity-50 scale-95' : ''}`}
                      >
                        <div className="relative h-20 bg-muted">
                          {recipe.imageUrl
                            ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                          <button
                            onClick={() => setMenuRecipes(prev => prev.filter(r => r.id !== recipe.id))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-destructive transition-colors"
                          >✕</button>
                        </div>
                        <div className="px-2 py-1.5">
                          <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{recipe.title}</p>
                          {recipe.timeMins && <p className="text-xs text-muted-foreground mt-0.5">⏱ {recipe.timeMins}m</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
