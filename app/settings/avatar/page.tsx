'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload, Check } from 'lucide-react';

const PRESET_AVATARS = [
  { emoji: '🌿', bg: 'bg-brand-green/20', label: 'Herb' },
  { emoji: '🍊', bg: 'bg-orange-200/60', label: 'Citrus' },
  { emoji: '🥑', bg: 'bg-lime-200/60', label: 'Avocado' },
  { emoji: '🍓', bg: 'bg-rose-200/60', label: 'Berry' },
  { emoji: '🫐', bg: 'bg-violet-200/60', label: 'Blueberry' },
  { emoji: '🍋', bg: 'bg-yellow-200/60', label: 'Lemon' },
  { emoji: '🥦', bg: 'bg-emerald-200/60', label: 'Broccoli' },
  { emoji: '🌶️', bg: 'bg-red-200/60', label: 'Chili' },
  { emoji: '🍄', bg: 'bg-amber-200/60', label: 'Mushroom' },
  { emoji: '🧄', bg: 'bg-stone-200/60', label: 'Garlic' },
  { emoji: '🍅', bg: 'bg-red-300/60', label: 'Tomato' },
  { emoji: '🥕', bg: 'bg-orange-300/60', label: 'Carrot' },
];

export default function AvatarPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveAvatar = async (avatarUrl: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => { setSaved(false); router.back(); }, 1000);
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const handlePreset = (emoji: string) => {
    // Store emoji as a data URI via canvas — or just use the emoji as a "text avatar" identifier
    setSelected(emoji);
    saveAvatar(`emoji:${emoji}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setSelected(dataUrl);
        saveAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight flex-1">Choose Avatar</h1>
          {saved && <span className="text-xs text-brand-green font-body">Saved ✓</span>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Upload options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">Upload Photo</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <Camera className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">Take Photo</span>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Preset avatars */}
        <div>
          <p className="text-xs font-display uppercase tracking-[0.18em] text-muted-foreground mb-3 px-1">
            Choose a Preset
          </p>
          <div className="grid grid-cols-4 gap-3">
            {PRESET_AVATARS.map((a) => {
              const isSelected = selected === a.emoji;
              return (
                <button
                  key={a.emoji}
                  onClick={() => handlePreset(a.emoji)}
                  disabled={saving}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${a.bg} ${isSelected ? 'ring-2 ring-accent ring-offset-2' : 'hover:scale-105'}`}
                >
                  <span className="text-3xl leading-none">{a.emoji}</span>
                  <span className="text-[9px] font-display uppercase tracking-widest text-foreground/60">{a.label}</span>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
