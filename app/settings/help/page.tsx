'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, Play, Utensils, CalendarDays, ShoppingCart, Settings } from 'lucide-react';

const SECTIONS = [
  {
    icon: <Play className="w-5 h-5" />,
    iconBg: 'bg-accent/10 text-accent',
    title: 'Getting Started',
    items: [
      {
        q: 'How do I add my first recipe?',
        a: 'Go to Recipes and tap the + button. You can enter a recipe manually, paste a link, or import from a video reel. Our AI will extract all the details automatically.',
      },
      {
        q: 'How does AI recipe import work?',
        a: 'Paste a link to an Instagram Reel or YouTube Short. Feast AI\'s vision model watches the video, identifies the dish, and extracts all ingredients and cooking steps — usually in under 30 seconds.',
      },
      {
        q: 'Do I need an account to use Feast AI?',
        a: 'You can browse recipes as a guest, but you\'ll need an account to save recipes, create meal plans, and sync your preferences across devices.',
      },
    ],
  },
  {
    icon: <CalendarDays className="w-5 h-5" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    title: 'Meal Planning',
    items: [
      {
        q: 'How do I create a weekly meal plan?',
        a: 'Go to the Planner tab and tap any meal slot (Breakfast, Lunch, Dinner). Search for a recipe or pick one from your library. Your plan auto-saves as you go.',
      },
      {
        q: 'Can I plan for multiple people?',
        a: 'Yes! Upgrade to the Family plan to share your meal plan with up to 5 household members. Everyone can see and edit the weekly plan in real-time.',
      },
      {
        q: 'How do I change the number of servings?',
        a: 'Open any recipe and use the serving size control. Ingredient quantities scale automatically. The updated amounts carry through to your grocery list.',
      },
    ],
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    iconBg: 'bg-brand-green/10 text-brand-green',
    title: 'Grocery List',
    items: [
      {
        q: 'How does the grocery list work?',
        a: 'Your grocery list is automatically generated from your weekly meal plan. Ingredients are grouped by category. Tap any item to check it off as you shop.',
      },
      {
        q: 'Can I add items manually?',
        a: 'Yes — tap the + at the top of the Groceries page to type in any item. Manual items appear in an "Other" category.',
      },
    ],
  },
  {
    icon: <Utensils className="w-5 h-5" />,
    iconBg: 'bg-yellow-500/10 text-yellow-500',
    title: 'Recipes & Nutrition',
    items: [
      {
        q: 'Where does nutrition information come from?',
        a: 'Nutrition data is estimated by our AI based on the ingredients and quantities in the recipe. It\'s a guide rather than a medical measurement.',
      },
      {
        q: 'How do I save a recipe to a collection?',
        a: 'On any recipe page, tap the bookmark icon. You can save to an existing collection or create a new one. Access your saved recipes in the Library tab.',
      },
      {
        q: 'Can I filter recipes by dietary restrictions?',
        a: 'Yes. Go to Settings → Dietary Preferences to set up your allergies, dislikes, and diet type. Recipes will be filtered accordingly across the app.',
      },
    ],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    iconBg: 'bg-purple-500/10 text-purple-500',
    title: 'Account & Settings',
    items: [
      {
        q: 'How do I change my password?',
        a: 'Go to Settings → Account Details → Change Password. Enter your current password and your new one. If you signed up with a social account, you may not have a password set.',
      },
      {
        q: 'How do I change measurement units?',
        a: 'Go to Settings → App Preferences → Measuring Units. Choose between Metric (g, ml, cm) and Imperial (oz, cups, inches). The change applies everywhere in the app.',
      },
      {
        q: 'How do I delete my account?',
        a: 'To delete your account, please send a message via Settings → Support → Leave Feedback and select "Other". Our team will process your request within 48 hours.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-border/50 last:border-0 ${open ? 'bg-muted/20' : ''}`}>
      <button
        className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-sm font-medium text-foreground">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm font-body text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight">Help & FAQ</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-display text-foreground tracking-tight">How can we help?</h2>
          <p className="text-sm text-muted-foreground font-body mt-1.5 max-w-xs">
            Find answers to the most common questions about Feast AI.
          </p>
        </div>

        {/* FAQ sections */}
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.title} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 bg-muted/20">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${section.iconBg}`}>
                  {section.icon}
                </div>
                <p className="text-sm font-display text-foreground">{section.title}</p>
              </div>
              {/* FAQ items */}
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-6 bg-accent/5 border border-accent/20 rounded-2xl p-5 text-center">
          <p className="text-sm font-display text-foreground mb-1">Still need help?</p>
          <p className="text-xs font-body text-muted-foreground mb-4">
            Our team is happy to assist you with anything not covered here.
          </p>
          <button
            onClick={() => router.push('/settings/feedback')}
            className="px-6 py-2.5 bg-accent text-accent-foreground rounded-xl font-display text-sm uppercase tracking-widest hover:brightness-105 transition-all"
          >
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
