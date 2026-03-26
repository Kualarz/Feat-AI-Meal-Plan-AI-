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

const COMMON_DISLIKES = ['🦬 Beef', '🐔 Chicken', '🐷 Pork', '🧅 Onion', '🧄 Garlic', '🌶️ Spicy Foods', '🫘 Beans', '🦑 Squid', '🍄 Mushrooms', '🥦 Bitter Gourd', '🫒 Olive Oil', '🍅 Tomato'];

export default function SetupDislikesPage() {
  const router = useRouter();
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [dislikeInput, setDislikeInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.dislikes) setDislikes(p.dislikes.split(',').filter(Boolean));
      } catch {}
    }
  }, []);

  const toggleDislike = (val: string) =>
    setDislikes(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]);

  const addCustom = () => {
    const trimmed = dislikeInput.trim();
    if (trimmed && !dislikes.includes(trimmed)) setDislikes(prev => [...prev, trimmed]);
    setDislikeInput('');
  };

  const handleNext = () => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...existing,
      dislikes: dislikes.join(','),
    }));
    router.push('/setup/preferences');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <StepHeader step={4} total={5} title="Foods You Dislike" desc="We'll avoid suggesting recipes with these" />

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-1">Common Dislikes</h2>
            <p className="text-sm text-muted-foreground mb-4">Select any ingredients you'd rather avoid</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-4">
              {COMMON_DISLIKES.map(dislike => {
                const val = dislike.split(' ').slice(1).join(' ');
                return (
                  <label key={dislike} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${dislikes.includes(val) ? 'border-amber-500 bg-amber-500/5' : 'border-border hover:bg-muted/50'}`}>
                    <input type="checkbox" checked={dislikes.includes(val)} onChange={() => toggleDislike(val)} className="w-4 h-4 rounded border-border" />
                    <span className="text-sm text-foreground">{dislike}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={dislikeInput}
                onChange={e => setDislikeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add custom dislike…"
                className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="button" onClick={addCustom} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition">Add</button>
            </div>
            {dislikes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {dislikes.map((d, i) => (
                  <span key={i} className="bg-amber-500/15 text-amber-600 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    {d}
                    <button type="button" onClick={() => setDislikes(prev => prev.filter((_, j) => j !== i))} className="font-bold hover:opacity-70">✕</button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/setup/allergens')}>← Back</Button>
            <Button type="button" variant="primary" onClick={handleNext}>Next →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
