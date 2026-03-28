'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import {
  Folder,
  Plus,
  ChevronRight,
  Clock,
  Flame,
  Home,
  Grid,
  X,
  Pencil,
  Trash2,
  Check,
  Eye,
  Bookmark,
  Download,
  Link2,
  GripVertical,
} from 'lucide-react';

interface QueueRecipe {
  id: string;
  title: string;
  imageUrl: string | null;
  cuisine: string | null;
  timeMins: number | null;
  kcal: number | null;
  dietTags: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [libraryData, setLibraryData] = useState<{ collections: any[]; uncategorized: any[] }>({ collections: [], uncategorized: [] });
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [queueRecipes, setQueueRecipes] = useState<QueueRecipe[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  // Social import state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/home'); return; }
    fetchLibrary(token);
    loadQueue();
  }, []);

  const loadQueue = () => {
    try {
      const stored = localStorage.getItem('feast_menu_queue');
      if (stored) setQueueRecipes(JSON.parse(stored));
    } catch {}
  };

  const removeFromQueue = (id: string) => {
    const updated = queueRecipes.filter(r => r.id !== id);
    setQueueRecipes(updated);
    localStorage.setItem('feast_menu_queue', JSON.stringify(updated));
  };

  const fetchLibrary = async (token: string) => {
    try {
      const res = await fetch('/api/recipes/library', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLibraryData(data);
        // Resolve recently viewed
        const viewedIds: string[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const allRecipes = [
          ...data.uncategorized,
          ...data.collections.flatMap((c: any) => c.recipes),
        ];
        const viewed = viewedIds
          .map((id: string) => allRecipes.find((r: any) => r.id === id))
          .filter(Boolean)
          .slice(0, 10);
        setRecentlyViewed(viewed);
      }
    } catch (err) {
      console.error('Failed to fetch library', err);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCollectionName }),
      });
      if (res.ok) {
        const newCol = await res.json();
        setLibraryData(prev => ({
          ...prev,
          collections: [...prev.collections, { ...newCol, recipes: [] }],
        }));
        setNewCollectionName('');
        setIsCreatingCollection(false);
      }
    } catch (err) {
      console.error('Failed to create collection', err);
    }
  };

  const renameCollection = async (id: string) => {
    if (!renameValue.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: renameValue }),
      });
      if (res.ok) {
        setLibraryData(prev => ({
          ...prev,
          collections: prev.collections.map(c => (c.id === id ? { ...c, name: renameValue.trim() } : c)),
        }));
        setRenamingId(null);
        setRenameValue('');
      }
    } catch (err) {
      console.error('Failed to rename collection', err);
    }
  };

  const deleteCollection = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const deletedCol = libraryData.collections.find(c => c.id === id);
        setLibraryData(prev => ({
          collections: prev.collections.filter(c => c.id !== id),
          uncategorized: [
            ...prev.uncategorized,
            ...(deletedCol?.recipes || []).map((r: any) => ({ ...r, collectionId: null })),
          ],
        }));
        if (activeCollection === id) setActiveCollection(null);
      }
    } catch (err) {
      console.error('Failed to delete collection', err);
    }
  };

  const moveRecipeToCollection = async (recipeId: string, collectionId: string | null) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/recipes/${recipeId}/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collectionId }),
      });
      if (res.ok) fetchLibrary(token);
    } catch (err) {
      console.error('Failed to move recipe', err);
    }
  };

  // Social media import
  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: importUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        const recipeId = data.id || data.recipeId;
        setImportUrl('');
        if (recipeId) router.push(`/recipes/${recipeId}`);
      } else {
        const err = await res.json().catch(() => null);
        setImportError(err?.error || 'Import failed. Check the URL and try again.');
      }
    } catch {
      setImportError('Network error. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, recipeId: string) => {
    e.dataTransfer.setData('recipeId', recipeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleDrop = (e: React.DragEvent, collectionId: string | null) => {
    e.preventDefault();
    const recipeId = e.dataTransfer.getData('recipeId');
    if (recipeId) moveRecipeToCollection(recipeId, collectionId);
    setDragOverFolderId(null);
  };

  // Flatten all saved recipes
  const allRecipes = [
    ...libraryData.uncategorized,
    ...libraryData.collections.flatMap(c =>
      c.recipes.map((r: any) => ({ ...r, collectionName: c.name, collectionId: c.id }))
    ),
  ];

  const displayedRecipes =
    activeCollection === null
      ? allRecipes
      : activeCollection === '__unsorted__'
      ? libraryData.uncategorized
      : (libraryData.collections.find(c => c.id === activeCollection)?.recipes || []);

  const activeLabel =
    activeCollection === null
      ? 'All Recipes'
      : activeCollection === '__unsorted__'
      ? 'Unsorted'
      : libraryData.collections.find(c => c.id === activeCollection)?.name ?? '';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full motion-safe:animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-display text-primary mb-2 flex items-center gap-3 tracking-tight">
            <Home className="h-9 w-9 shrink-0" />
            Home
          </h1>
          <p className="text-muted-foreground font-body font-medium">Your recipes, collections, and quick imports — all in one place.</p>
        </div>

        {/* ─── Recently Viewed ─── */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-display text-foreground flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              Recently Viewed
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {recentlyViewed.map(recipe => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="shrink-0">
                  <div className="w-44 rounded-large-card border border-border/70 overflow-hidden bg-card hover:border-accent/40 hover:shadow-lg transition-all group">
                    <div className="relative h-28 bg-muted">
                      {recipe.imageUrl ? (
                        <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-display text-xs text-foreground line-clamp-2 leading-tight">{recipe.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        {recipe.timeMins && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{recipe.timeMins}m</span>}
                        {recipe.kcal && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" />{recipe.kcal}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Saved Queue ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display text-foreground flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-accent" />
              Saved Queue
              {queueRecipes.length > 0 && (
                <span className="text-xs bg-accent/10 text-accent px-2.5 py-0.5 rounded-pill font-bold">
                  {queueRecipes.length}
                </span>
              )}
            </h2>
            <Link href="/recipes" className="text-accent font-display text-xs flex items-center gap-1 hover:underline uppercase tracking-widest">
              Browse Recipes <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {queueRecipes.length === 0 ? (
            <Card className="p-10 border-2 border-dashed border-border text-center space-y-3 rounded-large-card">
              <Bookmark className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground font-body italic">
                Save recipes from the browser and they'll appear here. Drag them into your collections below.
              </p>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {queueRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={e => handleDragStart(e, recipe.id)}
                  className="shrink-0 cursor-grab active:cursor-grabbing group/q"
                >
                  <div className="w-48 rounded-large-card border border-border/70 overflow-hidden bg-card hover:border-accent/40 hover:shadow-lg transition-all relative">
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromQueue(recipe.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover/q:opacity-100"
                      aria-label="Remove from queue"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Link href={`/recipes/${recipe.id}`}>
                      <div className="relative h-28 bg-muted">
                        {recipe.imageUrl ? (
                          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-display text-xs text-foreground line-clamp-2 leading-tight">{recipe.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          {recipe.timeMins && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{recipe.timeMins}m</span>}
                          {recipe.kcal && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3" />{recipe.kcal}</span>}
                        </div>
                      </div>
                    </Link>
                    {/* Drag hint */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover/q:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg px-1.5 py-0.5 text-[8px] font-display text-muted-foreground uppercase tracking-widest">
                        drag to folder
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Import from Social Media ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-foreground flex items-center gap-3">
            <Download className="h-5 w-5 text-brand-green" />
            Import Recipe
          </h2>
          <Card className="p-6 rounded-large-card border-border/60 space-y-4">
            <p className="text-sm text-muted-foreground font-body font-medium">
              Paste a link from TikTok, Instagram, YouTube, or any recipe website to extract the full recipe with AI.
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="url"
                  placeholder="https://www.tiktok.com/... or any recipe URL"
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleImport(); }}
                  className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-pill text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  disabled={importing}
                />
              </div>
              <Button
                onClick={handleImport}
                disabled={importing || !importUrl.trim()}
                className="h-12 px-8 rounded-pill font-display text-sm whitespace-nowrap shadow-lg shadow-accent/20"
              >
                {importing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full motion-safe:animate-spin" />
                    Extracting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Import
                  </span>
                )}
              </Button>
            </div>
            {importError && (
              <p className="text-xs text-destructive font-body">{importError}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Web URL'].map(platform => (
                <span key={platform} className="px-3 py-1 rounded-pill bg-muted text-[10px] font-display text-muted-foreground uppercase tracking-widest border border-border/50">
                  {platform}
                </span>
              ))}
            </div>
          </Card>
        </section>

        {/* ─── Collections + Recipes Grid ─── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display text-foreground flex items-center gap-3">
              <Folder className="h-5 w-5 text-accent" />
              My Collections
            </h2>
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-8">

            {/* Sidebar — collection list */}
            <aside className="space-y-4">
              <div className="space-y-1">
                {/* All Recipes */}
                <button
                  onClick={() => setActiveCollection(null)}
                  className={`w-full flex items-center justify-between p-3 rounded-pill font-display text-sm transition-all ${
                    activeCollection === null ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Grid className="h-4 w-4" />
                    All Recipes
                  </div>
                  <span className="text-xs bg-muted/30 px-2 py-0.5 rounded-pill">{allRecipes.length}</span>
                </button>

                {/* Unsorted — drop zone */}
                <div
                  onDragOver={e => handleDragOver(e, '__unsorted__')}
                  onDrop={e => handleDrop(e, null)}
                  onDragLeave={() => setDragOverFolderId(null)}
                  className={`rounded-pill transition-all ${dragOverFolderId === '__unsorted__' ? 'ring-2 ring-accent/60 bg-accent/5' : ''}`}
                >
                  <button
                    onClick={() => setActiveCollection('__unsorted__')}
                    className={`w-full flex items-center justify-between p-3 rounded-pill font-display text-sm transition-all ${
                      activeCollection === '__unsorted__' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="h-4 w-4" />
                      Unsorted
                    </div>
                    <span className="text-xs bg-muted/30 px-2 py-0.5 rounded-pill">{libraryData.uncategorized.length}</span>
                  </button>
                </div>

                {/* User collections — each is a drop zone */}
                {libraryData.collections.map(col => (
                  <div
                    key={col.id}
                    onDragOver={e => handleDragOver(e, col.id)}
                    onDrop={e => handleDrop(e, col.id)}
                    onDragLeave={() => setDragOverFolderId(null)}
                    className={`rounded-pill transition-all ${dragOverFolderId === col.id ? 'ring-2 ring-accent/60 bg-accent/5' : ''}`}
                  >
                    {renamingId === col.id ? (
                      <div className="flex items-center gap-1.5 p-2">
                        <Input
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          className="h-8 text-xs flex-1"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') renameCollection(col.id);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                        />
                        <button onClick={() => renameCollection(col.id)} aria-label="Confirm rename" className="p-1 text-brand-green hover:opacity-80 shrink-0">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setRenamingId(null)} aria-label="Cancel rename" className="p-1 text-muted-foreground hover:text-foreground shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center justify-between p-3 rounded-pill font-display text-sm transition-all group ${
                          activeCollection === col.id ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <button onClick={() => setActiveCollection(col.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                          <Folder className="h-4 w-4 shrink-0 group-hover:text-accent transition-colors" />
                          <span className="truncate">{col.name}</span>
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs bg-muted/30 px-2 py-0.5 rounded-pill">{col.recipes.length}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                            <button
                              onClick={e => { e.stopPropagation(); setRenamingId(col.id); setRenameValue(col.name); }}
                              title="Rename"
                              aria-label={`Rename ${col.name} collection`}
                              className="p-1 rounded hover:text-accent"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (window.confirm(`Delete "${col.name}"? Recipes inside will become unsorted.`)) {
                                  deleteCollection(col.id);
                                }
                              }}
                              title="Delete"
                              aria-label={`Delete ${col.name} collection`}
                              className="p-1 rounded hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* New Collection button */}
              {isCreatingCollection ? (
                <div className="space-y-2 px-2">
                  <Input
                    value={newCollectionName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
                    placeholder="Collection name..."
                    className="h-10 text-sm"
                    autoFocus
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') createCollection();
                      if (e.key === 'Escape') setIsCreatingCollection(false);
                    }}
                  />
                  <div className="flex gap-2">
                    <Button onClick={createCollection} className="flex-1 h-8 text-xs">Create</Button>
                    <Button variant="outline" onClick={() => setIsCreatingCollection(false)} className="flex-1 h-8 text-xs">Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingCollection(true)}
                  className="w-full flex items-center gap-2 p-3 rounded-pill border-2 border-dashed border-border text-muted-foreground hover:text-accent hover:border-accent/50 transition-all font-display text-xs uppercase tracking-widest"
                >
                  <Plus className="h-4 w-4" /> New Collection
                </button>
              )}
            </aside>

            {/* Main content — recipes in selected collection */}
            <div className="space-y-6 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display text-foreground flex items-center gap-3">
                  <span className="w-2 h-8 bg-accent rounded-full shrink-0" />
                  {activeLabel}
                </h3>
                <Link href="/recipes" className="text-brand-green font-display text-sm flex items-center gap-1 hover:underline shrink-0">
                  Browse More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {displayedRecipes.length === 0 ? (
                <Card className="p-16 border-2 border-dashed border-border text-center space-y-4 rounded-large-card">
                  <div className="text-6xl motion-safe:animate-bounce">📥</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display text-foreground">Nothing here yet</h3>
                    <p className="text-muted-foreground font-body font-medium italic">
                      {activeCollection
                        ? 'Drag a recipe card here from the queue or another collection.'
                        : 'Save recipes from the browser to see them here.'}
                    </p>
                  </div>
                  <Link href="/recipes">
                    <Button className="font-display rounded-pill h-12 px-10 uppercase tracking-widest shadow-lg shadow-accent/20">
                      Find Recipes
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedRecipes.map((recipe: any) => (
                    <div
                      key={recipe.id}
                      draggable
                      onDragStart={e => handleDragStart(e, recipe.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Link href={`/recipes/${recipe.id}`}>
                        <Card className="group relative overflow-hidden h-full rounded-large-card border-border/80 hover:border-accent/40 transition-all duration-300 shadow-sm hover:shadow-2xl">
                          <div className="relative h-48 bg-muted overflow-hidden">
                            {recipe.imageUrl ? (
                              <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                            )}
                            {recipe.collectionName && (
                              <div className="absolute top-3 left-3 z-10">
                                <div className="bg-card/90 backdrop-blur-sm text-foreground font-display text-[9px] px-2.5 py-1 rounded-pill flex items-center gap-1 border border-border/60">
                                  <Folder className="h-3 w-3 text-accent" />
                                  {recipe.collectionName}
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              <div className="bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[9px] font-display text-muted-foreground uppercase tracking-widest">
                                drag to folder
                              </div>
                            </div>
                          </div>
                          <div className="p-5 space-y-3">
                            <h3 className="font-display text-lg text-foreground line-clamp-1 group-hover:text-accent transition-colors tracking-tight">
                              {recipe.title}
                            </h3>
                            <div className="flex gap-5">
                              <div className="flex items-center gap-1.5 text-[10px] font-display text-muted-foreground uppercase tracking-widest">
                                <Clock className="h-4 w-4 text-accent" /> {recipe.timeMins || '?'}m
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-display text-brand-green uppercase tracking-widest">
                                <Flame className="h-4 w-4 text-brand-green" /> {recipe.kcal || '---'}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
