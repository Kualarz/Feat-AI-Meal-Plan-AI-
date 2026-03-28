'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { ChefHat, ShoppingCart, Calendar, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl lg:text-7xl font-display text-primary mb-6 tracking-tight">
              COOK SMARTER,<br />
              <span className="text-accent underline decoration-brand-green/30 underline-offset-8">SAVE MORE</span>
            </h1>
            <p className="text-xl text-muted-foreground font-body font-medium max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              Feast AI helps you turn TikTok inspiration into organized meal plans, 
              automatic grocery lists, and budget-friendly feasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button className="h-14 px-10 text-lg font-display rounded-pill shadow-xl shadow-accent/20 flex items-center gap-2">
                  Get Started for Free <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="h-14 px-10 text-lg font-display rounded-pill border-2">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 space-y-4 rounded-large-card border-none shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center group-hover:bg-brand-green/20 transition-colors">
                  <Zap className="h-6 w-6 text-brand-green" />
                </div>
                <h3 className="text-xl font-display text-foreground pt-2">AI Social Import</h3>
                <p className="text-sm text-muted-foreground font-body font-medium leading-relaxed">
                  Paste any TikTok or Instagram URL. Our AI extracts ingredients, steps, and nutrition facts in seconds.
                </p>
              </Card>

              <Card className="p-8 space-y-4 rounded-large-card border-none shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-display text-foreground pt-2">Smart Planner</h3>
                <p className="text-sm text-muted-foreground font-body font-medium leading-relaxed">
                  Drag and drop recipes into your week. Optimize for leftovers and reduce food waste automatically.
                </p>
              </Card>

              <Card className="p-8 space-y-4 rounded-large-card border-none shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display text-foreground pt-2">One-Click Lists</h3>
                <p className="text-sm text-muted-foreground font-body font-medium leading-relaxed">
                  Generate categorized grocery lists instantly. Save money by only buying exactly what you need.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Vision Statement */}
        <section className="py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 px-4 sm:px-6 lg:px-8">
            <ChefHat className="h-12 w-12 text-brand-green mx-auto mb-8" />
            <h2 className="text-4xl font-display text-foreground mb-6">Built for the Modern Home Cook</h2>
            <p className="text-lg text-muted-foreground font-body font-medium italic leading-relaxed">
              "We believe looking for what to eat shouldn't be a chore. Feast AI turns the chaos of social media 
              inspiration into a structured, sustainable, and joyful cooking experience."
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display text-brand-green uppercase tracking-widest">FEAST AI</span>
          </div>
          <div className="flex gap-8 text-sm font-display text-muted-foreground uppercase tracking-widest">
            <Link href="/recipes" className="hover:text-primary transition-colors">Browse</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <p className="text-xs text-muted-foreground font-body">© 2024 Feast AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
