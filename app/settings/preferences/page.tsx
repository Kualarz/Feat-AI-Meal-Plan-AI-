'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';

interface Preferences {
  halalEnabled: boolean;
  vegetarianEnabled: boolean;
  veganEnabled: boolean;
  allergens: string;
  dislikes: string;
  cuisines: string;
  equipment: string;
  timeBudgetMins: number;
  budgetLevel: string;
  region: string;
  currency: string;
  diet: string;
}

const DEFAULT: Preferences = {
  halalEnabled: false,
  vegetarianEnabled: false,
  veganEnabled: false,
  allergens: '',
  dislikes: '',
  cuisines: 'Cambodian,Thai,Vietnamese',
  equipment: 'stovetop,rice cooker',
  timeBudgetMins: 40,
  budgetLevel: 'medium',
  region: 'KH',
  currency: 'KHR',
  diet: 'balanced',
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeader = () => {
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
            cuisines: data.cuisines ?? 'Cambodian,Thai,Vietnamese',
            equipment: data.equipment ?? 'stovetop,rice cooker',
            timeBudgetMins: data.timeBudgetMins ?? 40,
            budgetLevel: data.budgetLevel ?? 'medium',
            region: data.region ?? 'KH',
            currency: data.currency ?? 'KHR',
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

  const set = (field: keyof Preferences, value: unknown) =>
    setPrefs((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Loading preferences...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />
        <div className="flex-1 overflow-y-auto">
          <div className="bg-card border-b border-border">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <h2 className="text-2xl font-bold text-foreground">Customize Preferences</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update your dietary preferences and cooking settings
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
                Preferences saved successfully!
              </div>
            )}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Dietary Restrictions */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Dietary Restrictions</h3>
              <div className="space-y-3">
                {[
                  { key: 'halalEnabled' as const, label: 'Halal', description: 'No pork, no alcohol' },
                  { key: 'vegetarianEnabled' as const, label: 'Vegetarian', description: 'No meat or fish' },
                  { key: 'veganEnabled' as const, label: 'Vegan', description: 'No animal products' },
                ].map(({ key, label, description }) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[key]}
                      onChange={(e) => set(key, e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary"
                    />
                  </label>
                ))}
              </div>
            </Card>

            {/* Allergens & Dislikes */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Allergens &amp; Dislikes</h3>
              <div className="space-y-4">
                <Input
                  label="Allergens to avoid"
                  type="text"
                  value={prefs.allergens}
                  onChange={(e) => set('allergens', e.target.value)}
                  placeholder="e.g. peanuts, shellfish, dairy"
                />
                <Input
                  label="Foods you dislike"
                  type="text"
                  value={prefs.dislikes}
                  onChange={(e) => set('dislikes', e.target.value)}
                  placeholder="e.g. cilantro, mushrooms"
                />
              </div>
            </Card>

            {/* Cuisine & Cooking */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Cuisine &amp; Cooking</h3>
              <div className="space-y-4">
                <Input
                  label="Preferred cuisines"
                  type="text"
                  value={prefs.cuisines}
                  onChange={(e) => set('cuisines', e.target.value)}
                  placeholder="e.g. Cambodian,Thai,Vietnamese"
                />
                <Input
                  label="Available equipment"
                  type="text"
                  value={prefs.equipment}
                  onChange={(e) => set('equipment', e.target.value)}
                  placeholder="e.g. stovetop,rice cooker,oven"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Max cooking time (mins)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={prefs.timeBudgetMins}
                      onChange={(e) => set('timeBudgetMins', parseInt(e.target.value) || 40)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Select
                    label="Budget level"
                    value={prefs.budgetLevel}
                    onChange={(e) => set('budgetLevel', e.target.value)}
                    options={[
                      { value: 'low', label: 'Low — budget-friendly' },
                      { value: 'medium', label: 'Medium — everyday cooking' },
                      { value: 'high', label: 'High — premium ingredients' },
                    ]}
                  />
                </div>
              </div>
            </Card>

            {/* Region & Currency */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Region &amp; Currency</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Region"
                  value={prefs.region}
                  onChange={(e) => set('region', e.target.value)}
                  options={[
                    { value: 'KH', label: 'Cambodia' },
                    { value: 'TH', label: 'Thailand' },
                    { value: 'VN', label: 'Vietnam' },
                    { value: 'MY', label: 'Malaysia' },
                    { value: 'SG', label: 'Singapore' },
                    { value: 'ID', label: 'Indonesia' },
                    { value: 'AU', label: 'Australia' },
                    { value: 'US', label: 'United States' },
                    { value: 'GB', label: 'United Kingdom' },
                  ]}
                />
                <Select
                  label="Currency"
                  value={prefs.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  options={[
                    { value: 'KHR', label: 'KHR (៛)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'AUD', label: 'AUD ($)' },
                    { value: 'THB', label: 'THB (฿)' },
                    { value: 'VND', label: 'VND (₫)' },
                    { value: 'MYR', label: 'MYR (RM)' },
                    { value: 'SGD', label: 'SGD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                />
              </div>
            </Card>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
