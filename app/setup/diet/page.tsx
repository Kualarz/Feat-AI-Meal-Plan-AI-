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

const DIET_OPTIONS = [
  { value: 'balanced', label: '⚖️ Balanced', desc: 'All food groups in moderation' },
  { value: 'keto', label: '🥑 Keto', desc: 'High-fat, very low-carb' },
  { value: 'mediterranean', label: '🫒 Mediterranean', desc: 'Fish, olive oil, vegetables' },
  { value: 'paleo', label: '🍖 Paleo', desc: 'Lean meats, fruits, vegetables' },
  { value: 'dash', label: '💚 DASH', desc: 'Low sodium, whole grains' },
  { value: 'intermittent-fasting', label: '⏰ Intermittent Fasting', desc: 'Timed eating patterns' },
  { value: 'low-carb', label: '🥗 Low-Carb', desc: 'Restricted carbohydrates' },
  { value: 'gluten-free', label: '🌾 Gluten-Free', desc: 'No wheat, barley, or rye' },
  { value: 'high-fiber', label: '🥕 High-Fiber', desc: 'Increased fiber intake' },
  { value: 'clean-eating', label: '🍎 Clean Eating', desc: 'Whole, unprocessed foods' },
  { value: 'diabetic', label: '🩺 Diabetic', desc: 'Controlled carbohydrate intake' },
  { value: 'cardiac', label: '❤️ Cardiac', desc: 'Low fat, cholesterol, and salt' },
];

export default function SetupDietPage() {
  const router = useRouter();
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['balanced']);
  const [halalEnabled, setHalalEnabled] = useState(false);
  const [vegetarianEnabled, setVegetarianEnabled] = useState(false);
  const [veganEnabled, setVeganEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.diet) setSelectedDiets(p.diet.split(',').filter(Boolean));
        if (p.halalEnabled != null) setHalalEnabled(p.halalEnabled);
        if (p.vegetarianEnabled != null) setVegetarianEnabled(p.vegetarianEnabled);
        if (p.veganEnabled != null) setVeganEnabled(p.veganEnabled);
      } catch {}
    }
  }, []);

  const toggleDiet = (val: string) =>
    setSelectedDiets(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]);

  const handleNext = () => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...existing,
      diet: selectedDiets.join(','),
      halalEnabled,
      vegetarianEnabled,
      veganEnabled,
    }));
    router.push('/setup/allergens');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <StepHeader step={2} total={5} title="Diet Types" desc="Choose your dietary style and restrictions" />

        <div className="space-y-6">
          {/* Diet Types */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-1">Diet Types</h2>
            <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {DIET_OPTIONS.map(({ value, label, desc }) => (
                <label key={value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedDiets.includes(value) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <input type="checkbox" checked={selectedDiets.includes(value)} onChange={() => toggleDiet(value)} className="mt-0.5 w-4 h-4 rounded border-border text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Dietary Restrictions */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Dietary Restrictions</h2>
            <div className="space-y-3">
              {[
                { label: '🕌 Halal', desc: 'No pork, no alcohol', checked: halalEnabled, onChange: setHalalEnabled },
                { label: '🥦 Vegetarian', desc: 'No meat or fish', checked: vegetarianEnabled, onChange: setVegetarianEnabled },
                { label: '🌿 Vegan', desc: 'No animal products', checked: veganEnabled, onChange: setVeganEnabled },
              ].map(({ label, desc, checked, onChange }) => (
                <label key={label} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 rounded border-border text-primary" />
                </label>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/setup/body')}>← Back</Button>
            <Button type="button" variant="primary" onClick={handleNext}>Next →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
