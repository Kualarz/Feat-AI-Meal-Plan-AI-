'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

const RESTRICTIONS = [
  {
    id: 'halal',
    emoji: '☪️',
    label: 'Halal',
    desc: 'No pork, no alcohol, and only halal-certified meat. All recipes will follow Islamic dietary law.',
    field: 'halalEnabled' as const,
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    id: 'vegetarian',
    emoji: '🥦',
    label: 'Vegetarian',
    desc: 'No meat or seafood. Dairy and eggs are still included. Great for flexitarians too.',
    field: 'vegetarianEnabled' as const,
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    id: 'vegan',
    emoji: '🌱',
    label: 'Vegan',
    desc: 'No animal products at all — no meat, seafood, dairy, eggs, or honey.',
    field: 'veganEnabled' as const,
    bg: 'bg-lime-50 dark:bg-lime-950/20',
  },
];

type RestrictionFields = { halalEnabled: boolean; vegetarianEnabled: boolean; veganEnabled: boolean };

export default function RestrictionsPage() {
  const router = useRouter();
  const [state, setState] = useState<RestrictionFields>({ halalEnabled: false, vegetarianEnabled: false, veganEnabled: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setState({ halalEnabled: !!d.halalEnabled, vegetarianEnabled: !!d.vegetarianEnabled, veganEnabled: !!d.veganEnabled });
      })
      .catch(() => {});
  }, []);

  const toggle = async (field: keyof RestrictionFields) => {
    const next = { ...state, [field]: !state[field] };
    setState(next);
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(next),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight flex-1">Dietary Restrictions</h1>
          {saved && <span className="text-xs text-brand-green font-body">Saved ✓</span>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <p className="text-sm font-body text-muted-foreground mb-5 leading-relaxed">
          Select restrictions that apply to you. These are applied across your entire experience.
        </p>

        <div className="space-y-3">
          {RESTRICTIONS.map((r) => {
            const isOn = state[r.field];
            return (
              <button
                key={r.id}
                onClick={() => toggle(r.field)}
                disabled={saving}
                className={`w-full text-left flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${isOn ? 'border-accent' : 'border-border hover:border-accent/40'} ${r.bg}`}
              >
                <span className="text-3xl leading-none flex-shrink-0">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-display text-foreground tracking-tight">{r.label}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${isOn ? 'bg-accent border-accent' : 'border-border'}`}>
                  {isOn && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
