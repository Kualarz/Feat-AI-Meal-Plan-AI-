'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
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

const COMMON_ALLERGENS = ['🥜 Peanuts', '🦐 Shellfish', '🥛 Dairy', '🥚 Eggs', '🌰 Tree Nuts', '🐟 Fish', '🌾 Wheat', '🥄 Sesame'];

export default function SetupAllergensPage() {
  const router = useRouter();
  const [allergens, setAllergens] = useState<string[]>([]);
  const [allergenInput, setAllergenInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.allergens) setAllergens(p.allergens.split(',').filter(Boolean));
      } catch {}
    }
  }, []);

  const toggleAllergen = (val: string) =>
    setAllergens(prev => prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val]);

  const addCustom = () => {
    const trimmed = allergenInput.trim();
    if (trimmed && !allergens.includes(trimmed)) setAllergens(prev => [...prev, trimmed]);
    setAllergenInput('');
  };

  const handleNext = () => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...existing,
      allergens: allergens.join(','),
    }));
    router.push('/setup/dislikes');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <StepHeader step={3} total={5} title="Allergens" desc="These ingredients will be filtered out completely" />

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-1">Common Allergens</h2>
            <p className="text-sm text-muted-foreground mb-4">Select any that apply to you</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-4">
              {COMMON_ALLERGENS.map(allergen => {
                const val = allergen.split(' ').slice(1).join(' ');
                return (
                  <label key={allergen} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${allergens.includes(val) ? 'border-destructive bg-destructive/5' : 'border-border hover:bg-muted/50'}`}>
                    <input type="checkbox" checked={allergens.includes(val)} onChange={() => toggleAllergen(val)} className="w-4 h-4 rounded border-border text-destructive" />
                    <span className="text-sm text-foreground">{allergen}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={allergenInput}
                onChange={e => setAllergenInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add custom allergen..."
                className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
              />
              <button type="button" onClick={addCustom} className="px-4 py-2 bg-destructive text-white rounded-lg text-sm hover:bg-destructive/90 transition">Add</button>
            </div>
            {allergens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {allergens.map((a, i) => (
                  <span key={i} className="bg-destructive/15 text-destructive px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    {a}
                    <button type="button" onClick={() => setAllergens(prev => prev.filter((_, j) => j !== i))} className="font-bold hover:opacity-70">✕</button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/setup/diet')}>← Back</Button>
            <Button type="button" variant="primary" onClick={handleNext}>Next →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
