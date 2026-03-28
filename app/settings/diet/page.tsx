'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

const DIET_TYPES = [
  { value: 'balanced',      emoji: '🍖', label: 'Omnivore',       desc: 'All foods, no restrictions',              bg: 'bg-rose-50 dark:bg-rose-950/20' },
  { value: 'flexitarian',   emoji: '🌿', label: 'Flexitarian',    desc: 'Mostly plants, occasional meat',           bg: 'bg-lime-50 dark:bg-lime-950/20' },
  { value: 'vegetarian',    emoji: '🥦', label: 'Vegetarian',     desc: 'Plants and dairy, no meat',               bg: 'bg-green-50 dark:bg-green-950/20' },
  { value: 'vegan',         emoji: '🌱', label: 'Vegan',          desc: 'Plants only, no animal products',          bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { value: 'pescatarian',   emoji: '🐟', label: 'Pescatarian',    desc: 'Seafood plus plant-based meals',           bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { value: 'mediterranean', emoji: '🫒', label: 'Mediterranean',  desc: 'Olive oil, fish, whole grains, legumes',   bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
  { value: 'keto',          emoji: '🥑', label: 'Keto',           desc: 'Low carb, high fat',                       bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { value: 'paleo',         emoji: '🍗', label: 'Paleo',          desc: 'Whole foods, no grains or dairy',          bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { value: 'whole30',       emoji: '⏱️', label: 'Whole30',        desc: 'No grains, dairy, sugar or legumes',       bg: 'bg-red-50 dark:bg-red-950/20' },
  { value: 'carnivore',     emoji: '🥩', label: 'Carnivore',      desc: 'Meat and animal products only',            bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { value: 'dairy-free',    emoji: '🥛', label: 'Dairy-Free',     desc: 'No milk, yogurt, or cheese',               bg: 'bg-sky-50 dark:bg-sky-950/20' },
  { value: 'gluten-free',   emoji: '🌾', label: 'Gluten-Free',    desc: 'No wheat, barley, or rye',                 bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { value: 'low-fodmap',    emoji: '🫙', label: 'Low FODMAP',     desc: 'Limits fermentable carbs (for IBS)',       bg: 'bg-purple-50 dark:bg-purple-950/20' },
  { value: 'raw-food',      emoji: '🥗', label: 'Raw Food',       desc: 'Uncooked, unprocessed plant foods',        bg: 'bg-teal-50 dark:bg-teal-950/20' },
  { value: 'high-protein',  emoji: '💪', label: 'High Protein',   desc: 'Protein-focused for muscle and fitness',   bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { value: 'halal',         emoji: '🕌', label: 'Halal',          desc: 'Permissible under Islamic dietary law',    bg: 'bg-green-50 dark:bg-green-950/30' },
];

export default function DietPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.diet) setSelected(d.diet.split(',').map((s: string) => s.trim()).filter(Boolean));
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
        body: JSON.stringify({ diet: selected.join(',') }),
      });
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  const toggle = (value: string) => {
    setSelected(prev => prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]);
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-16 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight flex-1">Diet Type</h1>
          {saved && <span className="text-xs text-brand-green font-body">Saved ✓</span>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-5">
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          Select one or more dietary styles to personalise your recipe recommendations.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {DIET_TYPES.map((d) => {
            const isSelected = selected.includes(d.value);
            return (
              <button
                key={d.value}
                onClick={() => toggle(d.value)}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-accent shadow-sm' : 'border-border hover:border-accent/40'} ${d.bg}`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-accent-foreground" />
                  </div>
                )}
                <span className="text-3xl leading-none block mb-2">{d.emoji}</span>
                <p className="text-sm font-display text-foreground tracking-tight">{d.label}</p>
                <p className="text-[11px] font-body text-muted-foreground mt-0.5 leading-snug">{d.desc}</p>
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
