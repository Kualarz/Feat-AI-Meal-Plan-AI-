'use client';

import { useState, useEffect, useRef } from 'react';

interface IngredientInfo {
  storage_tips: string;
  shelf_life: string;
  substitutes: string[];
  nutrition_note: string;
  fun_fact: string;
}

interface Props {
  ingredient: string | null;
  onClose: () => void;
}

export function IngredientDetailModal({ ingredient, onClose }: Props) {
  const [info, setInfo] = useState<IngredientInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ingredient) return;
    setInfo(null);
    setError('');
    setLoading(true);
    fetch('/api/ingredients/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: ingredient }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setInfo(d);
      })
      .catch(() => setError('Failed to load ingredient info'))
      .finally(() => setLoading(false));
  }, [ingredient]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!ingredient) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Ingredient</p>
            <h2 className="text-xl font-bold text-foreground capitalize">{ingredient}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${70 + i * 5}%` }} />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-rose-500">{error}</p>
          )}

          {info && (
            <>
              <InfoRow icon="📦" label="Storage" value={info.storage_tips} />
              <InfoRow icon="⏳" label="Shelf Life" value={info.shelf_life} />
              {info.substitutes?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">🔄 Substitutes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {info.substitutes.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <InfoRow icon="💊" label="Nutrition" value={info.nutrition_note} />
              <InfoRow icon="✨" label="Fun Fact" value={info.fun_fact} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">Powered by Claude AI</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{icon} {label}</p>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
