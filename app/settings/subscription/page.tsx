'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Zap, Crown, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with meal planning.',
    color: 'border-border bg-card',
    badge: null,
    features: [
      '5 saved recipes',
      '1 weekly meal plan',
      'Basic grocery list',
      'Manual recipe entry',
    ],
    disabled: ['AI recipe import', 'Unlimited plans', 'Supermarket sync', 'Nutrition tracking'],
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4.99',
    period: 'per month',
    description: 'For food lovers who want the full experience.',
    color: 'border-accent bg-accent/5',
    badge: 'Most Popular',
    features: [
      'Unlimited saved recipes',
      'Unlimited meal plans',
      'AI recipe import from reels',
      'Smart grocery list',
      'Nutrition tracking',
      'Supermarket price sync',
    ],
    disabled: [],
    current: false,
  },
  {
    id: 'family',
    name: 'Family',
    price: '$8.99',
    period: 'per month',
    description: 'Share plans and grocery lists with your household.',
    color: 'border-border bg-card',
    badge: null,
    features: [
      'Everything in Pro',
      'Up to 5 household members',
      'Shared meal plans',
      'Shared grocery list',
      'Priority support',
    ],
    disabled: [],
    current: false,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight">Subscription</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
            <Crown className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl font-display text-foreground tracking-tight">Upgrade your plan</h2>
          <p className="text-sm text-muted-foreground font-body mt-1.5">
            Unlock AI-powered meal planning and unlimited recipes.
          </p>
        </div>

        {/* Current plan label */}
        <p className="text-xs font-display uppercase tracking-[0.18em] text-muted-foreground px-1 mb-3">
          Current Plan
        </p>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-display text-foreground">Free Plan</p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">You are on the free tier</p>
          </div>
          <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-pill text-[10px] font-display uppercase tracking-widest">
            Active
          </span>
        </div>

        {/* Plan cards */}
        <p className="text-xs font-display uppercase tracking-[0.18em] text-muted-foreground px-1 mb-3">
          Available Plans
        </p>
        <div className="space-y-4">
          {PLANS.filter(p => !p.current).map((plan) => (
            <div key={plan.id} className={`border-2 rounded-2xl overflow-hidden ${plan.color}`}>
              {plan.badge && (
                <div className="bg-accent px-4 py-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent-foreground" />
                  <span className="text-[10px] font-display uppercase tracking-widest text-accent-foreground">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-display text-foreground">{plan.name}</h3>
                  <div className="text-right">
                    <span className="text-xl font-display text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground font-body ml-1">/{plan.period}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-body mb-4">{plan.description}</p>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-body text-foreground">
                      <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-display text-sm uppercase tracking-widest hover:brightness-105 active:brightness-95 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Upgrade to {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-6">
          Cancel anytime. Billed monthly. Prices in USD.
        </p>
      </div>
    </div>
  );
}
