'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, ChefHat, Zap, ShoppingCart, Star } from 'lucide-react';

const UPDATES = [
  {
    version: 'v1.3.0',
    date: 'March 2026',
    tag: 'Latest',
    tagColor: 'bg-accent text-accent-foreground',
    icon: <Sparkles className="w-5 h-5" />,
    iconBg: 'bg-accent/10 text-accent',
    title: 'AI-Powered Recipe Import',
    items: [
      'Import recipes directly from Instagram Reels and YouTube Shorts',
      'AI extracts ingredients, steps, and nutrition automatically',
      'Smarter dish descriptions with sensory language and cultural context',
      'Improved ingredient splitting — no more grouped ingredients',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'February 2026',
    tag: 'Update',
    tagColor: 'bg-muted text-muted-foreground',
    icon: <ChefHat className="w-5 h-5" />,
    iconBg: 'bg-brand-green/10 text-brand-green',
    title: 'Dietary Preferences Overhaul',
    items: [
      'New Diet Type picker with visual cards (Keto, Paleo, Vegan, and more)',
      'Allergen management with custom add support',
      'Food dislikes list to filter recipes you\'d rather avoid',
      'Halal, Vegetarian, Vegan toggles in Dietary Restrictions',
    ],
  },
  {
    version: 'v1.1.0',
    date: 'January 2026',
    tag: 'Update',
    tagColor: 'bg-muted text-muted-foreground',
    icon: <ShoppingCart className="w-5 h-5" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    title: 'Smart Grocery List',
    items: [
      'Auto-generate grocery list from your weekly meal plan',
      'Group ingredients by category',
      'Check off items as you shop',
      'Currency and region settings for local pricing',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'December 2025',
    tag: 'Launch',
    tagColor: 'bg-brand-green/10 text-brand-green',
    icon: <Star className="w-5 h-5" />,
    iconBg: 'bg-yellow-500/10 text-yellow-500',
    title: 'Feast AI Launches',
    items: [
      'Weekly meal planner with drag-and-drop scheduling',
      'Recipe library with save and collections',
      'User profiles and household sharing',
      'Nutrition info and calorie tracking',
    ],
  },
];

export default function WhatsNewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight">What's New</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 rounded-pill mb-3">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-display uppercase tracking-widest text-accent">Latest Updates</span>
          </div>
          <h2 className="text-2xl font-display text-foreground tracking-tight">What we've been cooking</h2>
          <p className="text-sm text-muted-foreground font-body mt-1.5">
            New features, improvements, and fixes — served fresh.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {UPDATES.map((update, i) => (
            <div key={update.version} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${update.iconBg}`}>
                  {update.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2 py-0.5 rounded-pill text-[9px] font-display uppercase tracking-widest ${update.tagColor}`}>
                      {update.tag}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-body">{update.date}</span>
                  </div>
                  <p className="text-sm font-display text-foreground">{update.title}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-body flex-shrink-0">{update.version}</span>
              </div>

              {/* Features list */}
              <ul className="px-5 py-4 space-y-2.5">
                {update.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm font-body text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/50 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-8 pb-4">
          More updates on the way. Stay tuned! 🍽️
        </p>
      </div>
    </div>
  );
}
