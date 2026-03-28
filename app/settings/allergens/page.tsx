'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';

const COMMON_ALLERGENS = [
  { name: 'Shellfish',  emoji: '🦐' },
  { name: 'Seafood',   emoji: '🐟' },
  { name: 'Dairy',     emoji: '🥛' },
  { name: 'Peanut',    emoji: '🥜' },
  { name: 'Tree nut',  emoji: '🌰' },
  { name: 'Egg',       emoji: '🥚' },
  { name: 'Gluten',    emoji: '🍞' },
  { name: 'Wheat',     emoji: '🌾' },
  { name: 'Soy',       emoji: '🫘' },
  { name: 'Sesame',    emoji: '🫙' },
  { name: 'Fish',      emoji: '🐠' },
  { name: 'Corn',      emoji: '🌽' },
  { name: 'Mustard',   emoji: '🟡' },
  { name: 'Sulphite',  emoji: '🍷' },
  { name: 'Lupin',     emoji: '🌼' },
];

export default function AllergensPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.allergens) setSelected(d.allergens.split(',').map((a: string) => a.trim()).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ allergens: selected.join(',') }),
      });
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
    setIsDirty(true);
  };

  const addCustom = () => {
    const t = custom.trim();
    if (!t || selected.includes(t)) { setCustom(''); return; }
    setSelected(prev => [...prev, t]);
    setCustom('');
    setIsDirty(true);
  };

  const removeItem = (name: string) => {
    setSelected(prev => prev.filter(a => a !== name));
    setIsDirty(true);
  };

  const customItems = selected.filter(s => !COMMON_ALLERGENS.find(a => a.name === s));

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Sticky zone: sticks below the global Navbar (h-16 = 64px) ── */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-md border-b border-border/40">
        {/* Nav row */}
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight flex-1">Allergies</h1>
          {saved && <span className="text-xs text-brand-green font-body">Saved ✓</span>}
        </div>

        {/* Add input row */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Search or add an allergen…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
            />
            <button
              onClick={addCustom}
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground flex items-center gap-1.5 font-display text-sm hover:brightness-105 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Custom tags */}
          {customItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {customItems.map(item => (
                <span key={item} className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-pill text-xs font-display">
                  {item}
                  <button onClick={() => removeItem(item)} className="hover:text-destructive transition-colors ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          Tap any allergen to toggle it. Press Save when done.
        </p>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {COMMON_ALLERGENS.map((a, i) => {
            const isSelected = selected.includes(a.name);
            return (
              <button
                key={a.name}
                onClick={() => toggle(a.name)}
                className={`w-full flex items-center gap-3.5 px-4 py-4 text-left transition-colors ${i < COMMON_ALLERGENS.length - 1 ? 'border-b border-border/50' : ''} ${isSelected ? 'bg-accent/5' : 'hover:bg-muted/30 active:bg-muted/50'}`}
              >
                <span className="text-xl w-7 text-center flex-shrink-0">{a.emoji}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{a.name}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-accent border-accent' : 'border-border'}`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`w-full py-3.5 rounded-xl font-display text-sm uppercase tracking-widest transition-all ${isDirty ? 'bg-accent text-accent-foreground hover:brightness-105 active:brightness-95' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
