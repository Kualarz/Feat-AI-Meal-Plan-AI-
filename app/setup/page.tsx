'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';

const steps = [
  { icon: '⚖️', title: 'Weight Goals & Nutrition', desc: 'Body metrics and calorie targets' },
  { icon: '🥗', title: 'Diet Types', desc: 'Dietary style and restrictions' },
  { icon: '🚫', title: 'Allergens', desc: 'Ingredients to filter out completely' },
  { icon: '👎', title: 'Foods You Dislike', desc: 'Ingredients to avoid in recipes' },
  { icon: '🌍', title: 'Cuisines & Location', desc: 'Preferred cuisines and region' },
];

export default function SetupWelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Create Your Personal Profile
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us about yourself so Feast AI can personalise every recipe and meal plan to match your goals.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">Step {i + 1} — {step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-xs text-muted-foreground">
                {i + 1}
              </div>
            </div>
          ))}
        </div>

        <Link href="/setup/body">
          <Button variant="primary" className="w-full text-base py-3">
            Get Started →
          </Button>
        </Link>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Takes about 2 minutes · You can update these anytime in Settings
        </p>
      </div>
    </div>
  );
}
