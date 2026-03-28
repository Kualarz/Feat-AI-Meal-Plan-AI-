'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Search } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  _count: { savedRecipes: number };
}

interface CollectionPickerModalProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function CollectionPickerModal({ recipeId, isOpen, onClose, onSaved }: CollectionPickerModalProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!isOpen) return;
    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }
    setLoading(true);
    fetch('/api/collections', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const saveToCollection = async (collectionId: string) => {
    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }
    setSaving(collectionId);
    try {
      // Save recipe to library first (idempotent)
      await fetch(`/api/recipes/${recipeId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assign to collection
      await fetch(`/api/recipes/${recipeId}/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collectionId }),
      });
      onSaved();
      onClose();
    } catch {
      // silent fail — user still sees modal
    } finally {
      setSaving(null);
    }
  };

  const createCollection = async () => {
    if (!newName.trim()) return;
    const token = getToken();
    if (!token) return;
    setCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setCollections((prev) => [...prev, { ...created, _count: { savedRecipes: 0 } }]);
        setNewName('');
        setShowNew(false);
        await saveToCollection(created.id);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg text-foreground tracking-tight">Save to Collection</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNew((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-pill text-xs font-display uppercase tracking-widest hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New collection input */}
        {showNew && (
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Collection name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createCollection(); }}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={createCollection}
              disabled={creating || !newName.trim()}
              className="px-3 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-display disabled:opacity-50 hover:bg-accent/90 transition-colors"
            >
              {creating ? '…' : 'Create'}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search folders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm font-body text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Collection list */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-muted-foreground text-sm font-body italic">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm font-body italic">
              {collections.length === 0 ? 'No collections yet. Create one above.' : 'No matches.'}
            </div>
          ) : (
            filtered.map((col) => (
              <button
                key={col.id}
                onClick={() => saveToCollection(col.id)}
                disabled={saving === col.id}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors border-b border-border/50 last:border-0 disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-display text-sm text-foreground tracking-tight">{col.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{col._count.savedRecipes} recipe{col._count.savedRecipes !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  {saving === col.id ? (
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
