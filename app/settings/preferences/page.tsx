'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChefHat, 
  ShieldCheck, 
  XOctagon, 
  Save, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';

interface Preferences {
  halalEnabled: boolean;
  vegetarianEnabled: boolean;
  veganEnabled: boolean;
  allergens: string;
  dislikes: string;
  diet: string;
}

const DEFAULT: Preferences = {
  halalEnabled: false,
  vegetarianEnabled: false,
  veganEnabled: false,
  allergens: '',
  dislikes: '',
  diet: 'balanced',
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch('/api/preferences', {
          headers: { ...getAuthHeader() },
        });
        if (res.ok) {
          const data = await res.json();
          setPrefs({
            halalEnabled: data.halalEnabled ?? false,
            vegetarianEnabled: data.vegetarianEnabled ?? false,
            veganEnabled: data.veganEnabled ?? false,
            allergens: data.allergens ?? '',
            dislikes: data.dislikes ?? '',
            diet: data.diet ?? 'balanced',
          });
        }
      } catch {
        // Use defaults on error
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save preferences');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof Preferences, value: any) =>
    setPrefs((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="motion-safe:animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Settings
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-display text-primary tracking-tight mb-2">Dietary Strategy</h1>
          <p className="text-sm text-muted-foreground font-body italic">
            Configure your nutritional rails to ensure every recipe fits your lifestyle.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm font-body italic">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ── Pillar 1: Diet Type ─────────────────────────── */}
          <Card className="p-6 rounded-large-card overflow-hidden">
            <h4 className="flex items-center gap-2 text-sm font-display text-foreground uppercase tracking-widest mb-6 border-b border-border/50 pb-4">
              <ChefHat className="w-4 h-4 text-accent" /> 01. Diet Type
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'balanced', label: 'Balanced', icon: '🥗' },
                { id: 'keto', label: 'Keto', icon: '🥩' },
                { id: 'vegetarian', label: 'Veggie', icon: '🥕' },
                { id: 'vegan', label: 'Vegan', icon: '🌱' },
                { id: 'pescatarian', label: 'Pesc', icon: '🐟' },
                { id: 'paleo', label: 'Paleo', icon: '🦴' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => set('diet', d.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    prefs.diet === d.id 
                      ? 'bg-accent/10 border-accent text-accent shadow-sm' 
                      : 'bg-muted border-transparent text-muted-foreground hover:border-accent/20'
                  }`}
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-xs font-display uppercase tracking-widest">{d.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-body italic leading-relaxed px-1">
              Selecting a diet type prioritises recipes that naturally fit these macros and ingredients.
            </p>
          </Card>

          {/* ── Pillar 2: Health & Religion ──────────────────── */}
          <Card className="p-6 rounded-large-card overflow-hidden">
            <h4 className="flex items-center gap-2 text-sm font-display text-foreground uppercase tracking-widest mb-6 border-b border-border/50 pb-4">
              <ShieldCheck className="w-4 h-4 text-accent" /> 02. Restrictions
            </h4>
            <div className="space-y-3">
              {[
                { key: 'halalEnabled' as const, label: 'Halal Certified', desc: 'Strictly no pork or non-halal alcohol products.' },
                { key: 'vegetarianEnabled' as const, label: 'Strict Vegetarian', desc: 'Removes all meat, poultry, and seafood.' },
                { key: 'veganEnabled' as const, label: 'Strict Vegan', desc: 'Removes all animal-derived ingredients.' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-transparent hover:border-accent/10 cursor-pointer transition-all">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-display text-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-[10px] text-muted-foreground font-body italic">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="w-5 h-5 rounded-lg border-muted-foreground/30 text-accent focus:ring-accent transition-all cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </Card>

          {/* ── Pillar 3: Ingredient Exclusions ──────────────── */}
          <Card className="p-6 rounded-large-card overflow-hidden">
            <h4 className="flex items-center gap-2 text-sm font-display text-foreground uppercase tracking-widest mb-6 border-b border-border/50 pb-4">
              <XOctagon className="w-4 h-4 text-accent" /> 03. Exclusions
            </h4>
            <div className="space-y-6">
              <Input
                label="Allergens (Filter absolute)"
                placeholder="e.g. peanuts, shellfish, egg"
                value={prefs.allergens}
                onChange={(e) => set('allergens', e.target.value)}
              />
              <Input
                label="Specific Dislikes (Downrank)"
                placeholder="e.g. cilantro, olives, liver"
                value={prefs.dislikes}
                onChange={(e) => set('dislikes', e.target.value)}
              />
            </div>
          </Card>

          <Button
            type="submit"
            disabled={saving}
            className="w-full rounded-pill py-6 font-display uppercase tracking-widest shadow-xl shadow-accent/20 overflow-hidden"
          >
            {saving ? (
              'SavingStrategy...'
            ) : success ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Saved Successfully
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Dietary Profile
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
