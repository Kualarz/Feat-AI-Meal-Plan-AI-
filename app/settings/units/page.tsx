'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

const UNIT_OPTIONS = [
  {
    value: false,
    label: 'Metric',
    desc: 'Grams (g), kilograms (kg), millilitres (ml), centimetres (cm)',
    examples: '500g flour · 1.5L water · 170cm height',
    emoji: '📏',
  },
  {
    value: true,
    label: 'Imperial',
    desc: 'Ounces (oz), pounds (lbs), cups, fluid ounces (fl oz), inches',
    examples: "2 cups flour · 48 fl oz water · 5'7\" height",
    emoji: '🇺🇸',
  },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-display uppercase tracking-[0.18em] text-muted-foreground px-1 mb-3 mt-6 first:mt-0">
      {label}
    </p>
  );
}

export default function DisplayAndUnitsPage() {
  const router = useRouter();
  const [imperial, setImperial] = useState(false);
  const [showCalories, setShowCalories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('units');
    setImperial(stored === 'imperial');

    const storedNutrition = localStorage.getItem('showNutrition');
    if (storedNutrition !== null) setShowCalories(storedNutrition !== 'false');

    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          if (d.useImperial !== undefined) setImperial(!!d.useImperial);
          if (d.showCalories !== undefined) setShowCalories(d.showCalories !== false);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    localStorage.setItem('units', imperial ? 'imperial' : 'metric');
    localStorage.setItem('showNutrition', String(showCalories));

    const token = localStorage.getItem('token');
    if (!token) { setIsDirty(false); return; }
    setSaving(true);
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ useImperial: imperial, showCalories }),
      });
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleUnitSelect = (val: boolean) => {
    setImperial(val);
    setIsDirty(true);
  };

  const toggleCalories = () => {
    setShowCalories(v => !v);
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-16 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight flex-1">Display & Units</h1>
          {saved && <span className="text-xs text-brand-green font-body">Saved ✓</span>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-1">

        {/* ── Measuring Units ── */}
        <SectionLabel label="Measuring Units" />
        <p className="text-sm font-body text-muted-foreground leading-relaxed mb-4">
          Choose how ingredient quantities and measurements are displayed.
        </p>
        <div className="space-y-3">
          {UNIT_OPTIONS.map((opt) => {
            const isSelected = imperial === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => handleUnitSelect(opt.value)}
                className={`w-full text-left flex items-start gap-4 p-5 rounded-2xl border-2 transition-all ${isSelected ? 'border-accent bg-accent/5' : 'border-border bg-card hover:border-accent/40'}`}
              >
                <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-display text-foreground tracking-tight">{opt.label}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
                  <p className="text-[11px] font-body text-muted-foreground/70 mt-1.5 italic">{opt.examples}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${isSelected ? 'bg-accent border-accent' : 'border-border'}`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Display Preferences ── */}
        <SectionLabel label="Display Preferences" />
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between py-4 px-5">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-medium text-foreground">Show Nutrition Info</p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Display calories and macros on recipe cards and in the planner
              </p>
            </div>
            <button
              type="button"
              onClick={toggleCalories}
              aria-label="Show Nutrition Info"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all flex-shrink-0 ${showCalories ? 'bg-accent' : 'bg-muted-foreground/30'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${showCalories ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`w-full py-3.5 rounded-xl font-display text-sm uppercase tracking-widest transition-all ${isDirty ? 'bg-accent text-accent-foreground hover:brightness-105 active:brightness-95' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
