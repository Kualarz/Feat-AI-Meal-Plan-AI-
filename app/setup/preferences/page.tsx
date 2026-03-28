'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';

const STORAGE_KEY = 'setupData';

function StepHeader({ step, total, title, desc }: { step: number; total: number; title: string; desc: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all ${i < step ? 'bg-primary w-8' : 'bg-muted w-3'}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-1">Step {step} of {total}</p>
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

const CUISINES = ['🇰🇭 Cambodian', '🇹🇭 Thai', '🇻🇳 Vietnamese', '🇺🇸 American', '🇮🇹 Italian', '🇲🇽 Mexican', '🇯🇵 Japanese', '🇨🇳 Chinese', '🇮🇳 Indian', '🇬🇧 British', '🇪🇸 Spanish', '🇫🇷 French', '🇰🇷 Korean', '🇵🇭 Filipino', '🇲🇾 Malaysian', '🇹🇼 Taiwanese', '🇬🇷 Greek', '🇹🇷 Turkish', '🇧🇷 Brazilian', '🇲🇦 Moroccan'];

export default function SetupPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [cuisinesList, setCuisinesList] = useState<string[]>(['Cambodian', 'Thai', 'Vietnamese']);
  const [cuisineInput, setCuisineInput] = useState('');
  const [region, setRegion] = useState('KH');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.cuisines) setCuisinesList(p.cuisines.split(',').filter(Boolean));
        if (p.region) setRegion(p.region);
        if (p.currency) setCurrency(p.currency);
      } catch {}
    }
  }, []);

  const toggleCuisine = (val: string) =>
    setCuisinesList(prev => prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]);

  const addCustomCuisine = () => {
    const trimmed = cuisineInput.trim();
    if (trimmed && !cuisinesList.includes(trimmed)) setCuisinesList(prev => [...prev, trimmed]);
    setCuisineInput('');
  };

  const handleSubmit = async () => {
    setLoading(true);

    const existing = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();

    const submitData = {
      ...existing,
      cuisines: cuisinesList.join(','),
      region,
      currency,
    };

    // Persist final data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submitData));
    localStorage.setItem('pendingPreferences', JSON.stringify(submitData));
    localStorage.setItem('setupComplete', 'true');

    // Try to save to API if already signed in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(submitData),
        });
      } catch {
        // Will sync after sign in
      }
    }

    setLoading(false);
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <StepHeader step={5} total={5} title="Cuisines & Location" desc="Tell us what you love to cook and where you are" />

        <div className="space-y-6">
          {/* Cuisines */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-1">Preferred Cuisines</h2>
            <p className="text-sm text-muted-foreground mb-4">These will be prioritised in your recipe feed</p>
            <div className="grid sm:grid-cols-3 gap-2 mb-4">
              {CUISINES.map(cuisine => {
                const val = cuisine.split(' ').slice(1).join(' ');
                return (
                  <label key={cuisine} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${cuisinesList.includes(val) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                    <input type="checkbox" checked={cuisinesList.includes(val)} onChange={() => toggleCuisine(val)} className="w-4 h-4 rounded border-border text-primary" />
                    <span className="text-foreground">{cuisine}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={cuisineInput}
                onChange={e => setCuisineInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomCuisine()}
                placeholder="Add other cuisine..."
                className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="button" onClick={addCustomCuisine} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition">Add</button>
            </div>
            {cuisinesList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cuisinesList.map((c, i) => (
                  <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    {c}
                    <button type="button" onClick={() => setCuisinesList(prev => prev.filter((_, j) => j !== i))} className="font-bold hover:opacity-70">✕</button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Location */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Region"
                value={region}
                onChange={e => setRegion(e.target.value)}
                options={[
                  { value: 'KH', label: '🇰🇭 Cambodia' },
                  { value: 'TH', label: '🇹🇭 Thailand' },
                  { value: 'VN', label: '🇻🇳 Vietnam' },
                  { value: 'MY', label: '🇲🇾 Malaysia' },
                  { value: 'SG', label: '🇸🇬 Singapore' },
                  { value: 'AU', label: '🇦🇺 Australia' },
                  { value: 'US', label: '🇺🇸 United States' },
                  { value: 'GB', label: '🇬🇧 United Kingdom' },
                ]}
              />
              <Select
                label="Currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
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

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/setup/dislikes')}>← Back</Button>
            <Button type="button" variant="primary" disabled={loading} onClick={handleSubmit}>
              {loading ? 'Saving...' : 'Save & Continue →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
