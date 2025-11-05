'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Welcome to Feast AI
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            AI-Powered Meal Planning & Nutrition Optimization
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get personalized meal plans with nutrition targets calculated specifically for your weight goals,
            dietary preferences, and fitness level. Featuring authentic Southeast Asian, Mediterranean,
            and global cuisines.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/setup">
              <Button variant="primary">Get Started</Button>
            </Link>
            <Link href="/recipes">
              <Button variant="outline">Browse Recipes</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Weight Goal Optimization
            </h3>
            <p className="text-muted-foreground">
              Auto-calculated nutrition targets based on your body metrics and fitness goals
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              AI-Powered Planning
            </h3>
            <p className="text-muted-foreground">
              Personalized meal plans that respect your dietary preferences, allergens, and budget
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Global Cuisines
            </h3>
            <p className="text-muted-foreground">
              Authentic recipes from 20+ countries with detailed nutrition info and cooking time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
