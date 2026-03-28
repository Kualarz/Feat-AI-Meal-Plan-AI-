'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  timeMins: number | null;
  kcal: number | null;
  imageUrl: string | null;
  difficulty: string | null;
  collectionId: string | null;
  savedRecipeId: string;
}

interface Collection {
  id: string;
  name: string;
  _count: { savedRecipes: number };
}

interface RecentlyViewed {
  id: string;
  title: string;
  imageUrl: string | null;
  cuisine: string | null;
  timeMins: number | null;
  kcal: number | null;
  viewedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const cuisineFlags: Record<string, string> = {
  Cambodian: '🇰🇭', Thai: '🇹🇭', Vietnamese: '🇻🇳', American: '🇺🇸',
  Italian: '🇮🇹', Mexican: '🇲🇽', Japanese: '🇯🇵', Chinese: '🇨🇳',
  Indian: '🇮🇳', British: '🇬🇧', Korean: '🇰🇷', Malaysian: '🇲🇾',
};

function folderColors(index: number) {
  const colors = [
    'bg-blue-500/10 border-blue-500/30 text-blue-600',
    'bg-purple-500/10 border-purple-500/30 text-purple-600',
    'bg-green-500/10 border-green-500/30 text-green-600',
    'bg-orange-500/10 border-orange-500/30 text-orange-600',
    'bg-pink-500/10 border-pink-500/30 text-pink-600',
    'bg-teal-500/10 border-teal-500/30 text-teal-600',
  ];
  return colors[index % colors.length];
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RecentCard({ recipe }: { recipe: RecentlyViewed }) {
  return (
    <Link href={`/recipes/${recipe.id}`} aria-label={`View ${recipe.title}`} className="flex-shrink-0 w-44 group">
      <div className="relative w-44 h-28 rounded-xl overflow-hidden bg-muted mb-2">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        )}
        {recipe.cuisine && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
            {cuisineFlags[recipe.cuisine] || '🌍'} {recipe.cuisine}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{recipe.timeMins ? `${recipe.timeMins} min` : ''}{recipe.kcal ? ` · ${recipe.kcal} kcal` : ''}</p>
    </Link>
  );
}

function RecipeCard({
  recipe,
  collections,
  onMove,
  onRemove,
}: {
  recipe: SavedRecipe;
  collections: Collection[];
  onMove: (recipeId: string, collectionId: string | null) => void;
  onRemove: (recipeId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-card border border-border rounded-large-card overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative h-40 bg-muted overflow-hidden">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}
          {recipe.cuisine && (
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {cuisineFlags[recipe.cuisine] || '🌍'} {recipe.cuisine}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/recipes/${recipe.id}`}>
          <h3 className="text-sm font-display text-foreground line-clamp-2 hover:text-primary transition-colors mb-1">{recipe.title}</h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          {recipe.timeMins && <span>⏱ {recipe.timeMins}m</span>}
          {recipe.kcal && <span>🔥 {recipe.kcal} kcal</span>}
          {recipe.difficulty && <span className="capitalize">{recipe.difficulty}</span>}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Change folder"
              className="flex items-center gap-1 text-[10px] font-display uppercase tracking-widest text-muted-foreground hover:text-foreground px-2 py-1 rounded-pill border border-border hover:bg-muted transition-colors"
            >
              📁 {collections.find(c => c.id === recipe.collectionId)?.name || 'Move to folder'}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-48 bg-card border border-border rounded-xl shadow-lg z-20 py-1">
                <button
                  onClick={() => { onMove(recipe.id, null); setMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${!recipe.collectionId ? 'text-primary font-medium' : 'text-foreground'}`}
                >
                  📂 No folder
                </button>
                {collections.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onMove(recipe.id, c.id); setMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${recipe.collectionId === c.id ? 'text-primary font-medium' : 'text-foreground'}`}
                  >
                    📁 {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onRemove(recipe.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Remove from library"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null); // null = all
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Folder create/rename state
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) { router.replace('/auth/signin'); return; }
    loadData();
    // Load recently viewed from localStorage
    try {
      const raw = localStorage.getItem('recentlyViewed');
      if (raw) setRecentlyViewed(JSON.parse(raw));
    } catch {}
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, colRes] = await Promise.all([
        fetch('/api/saved-recipes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/collections', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (recRes.ok) setRecipes(await recRes.json());
      if (colRes.ok) setCollections(await colRes.json());
    } finally {
      setLoading(false);
    }
  };

  // ── Folder actions ──────────────────────────────────────────────────────────

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    if (res.ok) {
      const col = await res.json();
      setCollections(prev => [...prev, { ...col, _count: { savedRecipes: 0 } }]);
    }
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const renameFolder = async (id: string) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    if (res.ok) {
      setCollections(prev => prev.map(c => c.id === id ? { ...c, name: renameValue.trim() } : c));
    }
    setRenamingId(null);
  };

  const deleteFolder = async (id: string) => {
    if (!confirm('Delete this folder? Recipes inside will become uncollected.')) return;
    const res = await fetch(`/api/collections/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id));
      setRecipes(prev => prev.map(r => r.collectionId === id ? { ...r, collectionId: null } : r));
      if (selectedCollection === id) setSelectedCollection(null);
    }
  };

  // ── Recipe actions ──────────────────────────────────────────────────────────

  const moveRecipe = async (recipeId: string, collectionId: string | null) => {
    const res = await fetch(`/api/recipes/${recipeId}/save`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collectionId }),
    });
    if (res.ok) {
      setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, collectionId } : r));
      // Update collection counts
      setCollections(prev => prev.map(c => {
        const wasIn = recipes.find(r => r.id === recipeId)?.collectionId === c.id;
        const isIn = collectionId === c.id;
        if (wasIn && !isIn) return { ...c, _count: { savedRecipes: c._count.savedRecipes - 1 } };
        if (!wasIn && isIn) return { ...c, _count: { savedRecipes: c._count.savedRecipes + 1 } };
        return c;
      }));
    }
  };

  const removeRecipe = async (recipeId: string) => {
    const res = await fetch(`/api/recipes/${recipeId}/save`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const removed = recipes.find(r => r.id === recipeId);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
      if (removed?.collectionId) {
        setCollections(prev => prev.map(c =>
          c.id === removed.collectionId ? { ...c, _count: { savedRecipes: c._count.savedRecipes - 1 } } : c
        ));
      }
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const displayedRecipes = recipes.filter(r => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.cuisine?.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedCollection === null
      ? true
      : selectedCollection === '__none__'
      ? !r.collectionId
      : r.collectionId === selectedCollection;
    return matchesSearch && matchesFolder;
  });

  const uncollectedCount = recipes.filter(r => !r.collectionId).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">

          {/* Page header */}
          <div className="bg-card border-b border-border">
            <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display text-brand-green leading-none">📖 My Library</h1>
                <p className="text-xs text-muted-foreground font-body font-bold uppercase tracking-widest mt-1">{recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search library…"
                    className="pl-9 pr-4 py-2 border border-border rounded-pill bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-52"
                  />
                </div>
                <Link href="/recipes">
                  <Button variant="primary" className="text-sm">+ Add Recipes</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

            {/* ── Recently Viewed ──────────────────────────────── */}
            {recentlyViewed.length > 0 && (
              <section>
                <h2 className="text-xl font-display text-foreground mb-4 uppercase tracking-widest">Recently Viewed</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {recentlyViewed.map(r => (
                    <RecentCard key={r.id} recipe={r} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Collections / Folders ────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display text-foreground uppercase tracking-widest">Folders</h2>
                <button
                  onClick={() => setCreatingFolder(true)}
                  aria-label="Create new folder"
                  className="flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-primary hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Folder
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* All Recipes */}
                <button
                  onClick={() => setSelectedCollection(null)}
                  className={`flex items-center gap-3 p-4 rounded-large-card border text-left transition-all ${
                    selectedCollection === null
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  <span className="text-2xl">📚</span>
                  <div className="min-w-0">
                    <p className="text-sm font-display text-foreground truncate uppercase tracking-wider">All Saved</p>
                    <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest">{recipes.length} recipes</p>
                  </div>
                </button>

                {/* Uncollected */}
                {uncollectedCount > 0 && (
                  <button
                    onClick={() => setSelectedCollection('__none__')}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedCollection === '__none__'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-2xl">📂</span>
                    <div className="min-w-0">
                      <p className="text-sm font-display text-foreground truncate uppercase tracking-wider">Uncollected</p>
                      <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest">{uncollectedCount} recipes</p>
                    </div>
                  </button>
                )}

                {/* User folders */}
                {collections.map((col, i) => (
                  <div
                    key={col.id}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer group ${
                      selectedCollection === col.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : `${folderColors(i)} hover:opacity-90`
                    }`}
                    onClick={() => {
                      if (renamingId !== col.id) setSelectedCollection(selectedCollection === col.id ? null : col.id);
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">📁</span>
                    <div className="min-w-0 flex-1">
                      {renamingId === col.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') renameFolder(col.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={() => renameFolder(col.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-full text-sm font-semibold bg-transparent border-b border-primary outline-none text-foreground"
                        />
                      ) : (
                        <p className="text-sm font-display text-foreground truncate uppercase tracking-wider">{col.name}</p>
                      )}
                      <p className="text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest">{col._count.savedRecipes} recipes</p>
                    </div>
                    {/* Hover actions */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setRenamingId(col.id); setRenameValue(col.name); }}
                        className="p-1 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                        title="Rename"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button
                        onClick={() => deleteFolder(col.id)}
                        className="p-1 rounded bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* New folder inline input */}
                {creatingFolder && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5">
                    <span className="text-2xl">📁</span>
                    <input
                      autoFocus
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') createFolder();
                        if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
                      }}
                      onBlur={() => { if (newFolderName.trim()) createFolder(); else { setCreatingFolder(false); setNewFolderName(''); } }}
                      placeholder="Folder name…"
                      className="flex-1 text-sm font-display bg-transparent border-b border-primary outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ── Recipe Grid ──────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display text-foreground uppercase tracking-widest">
                  {selectedCollection === null
                    ? 'All Saved Recipes'
                    : selectedCollection === '__none__'
                    ? 'Uncollected Recipes'
                    : collections.find(c => c.id === selectedCollection)?.name || 'Recipes'}
                  <span className="ml-2 text-xs font-body font-bold text-muted-foreground uppercase tracking-widest">({displayedRecipes.length})</span>
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-large-card overflow-hidden motion-safe:animate-pulse">
                      <div className="h-40 bg-muted" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedRecipes.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  {recipes.length === 0 ? (
                    <>
                      <p className="text-4xl mb-4">📚</p>
                      <p className="text-lg font-medium mb-2">Your library is empty</p>
                      <p className="text-sm mb-6">Save recipes from the browser to build your personal collection</p>
                      <Link href="/recipes"><Button variant="primary">Browse Recipes</Button></Link>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl mb-3">🔍</p>
                      <p className="text-sm">No recipes match your search</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {displayedRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      collections={collections}
                      onMove={moveRecipe}
                      onRemove={removeRecipe}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
