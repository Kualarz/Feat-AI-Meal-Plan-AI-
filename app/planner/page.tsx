'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

interface Recipe {
  id: string;
  title: string;
  timeMins: number | null;
  estimatedPrice: number | null;
  currency: string | null;
  kcal: number | null;
  proteinG: number | null;
  imageUrl: string | null;
}

interface PlanMeal {
  id: string;
  dateISO: string;
  slot: string;
  notes: string | null;
  recipe: Recipe | null;
}

interface Plan {
  id: string;
  weekStart: string;
  weekEnd: string;
  meals: PlanMeal[];
}

export default function PlannerPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    loadPlanAndPreferences();
  }, []);

  const loadPlanAndPreferences = async () => {
    try {
      const [planRes, prefRes] = await Promise.all([
        fetch('/api/plans/latest'),
        fetch('/api/preferences'),
      ]);

      const planData = await planRes.json();
      const prefData = await prefRes.json();

      setPlan(planData.plan);
      setPreferences(prefData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!preferences) {
      alert('Please set your preferences first');
      return;
    }

    setGenerating(true);

    try {
      // Calculate week start (Monday) and end (Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const profile = {
        name: 'User',
        cal: preferences.caloriesTarget || 2000,
        protein: preferences.proteinTarget || 120,
        diet: preferences.diet || 'balanced',
        halal: preferences.halalEnabled || false,
        vegetarian: preferences.vegetarianEnabled || false,
        vegan: preferences.veganEnabled || false,
        allergens: preferences.allergens || '',
        dislikes: preferences.dislikes || '',
        cuisines: preferences.cuisines || 'Cambodian,Thai,Vietnamese',
        time: preferences.timeBudgetMins || 40,
        equipment: preferences.equipment || 'stovetop,rice cooker',
        region: preferences.region || 'KH',
        currency: preferences.currency || 'KHR',
        budget: preferences.budgetLevel || 'medium',
      };

      const range = {
        startISO: monday.toISOString().split('T')[0],
        endISO: sunday.toISOString().split('T')[0],
      };

      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, range }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to generate plan');
      }

      await loadPlanAndPreferences();
      alert('Meal plan generated successfully!');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const groupMealsByDate = () => {
    if (!plan) return [];

    const grouped: { [key: string]: PlanMeal[] } = {};
    plan.meals.forEach((meal) => {
      if (!grouped[meal.dateISO]) {
        grouped[meal.dateISO] = [];
      }
      grouped[meal.dateISO].push(meal);
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const groupedMeals = groupMealsByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">eatr-vibe</h1>
            <div className="flex gap-4">
              <Link href="/recipes">
                <Button variant="outline">Recipes</Button>
              </Link>
              <Link href="/groceries">
                <Button variant="outline">Groceries</Button>
              </Link>
              <Link href="/setup">
                <Button variant="secondary">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Your Meal Plan
            </h2>
            {plan && (
              <p className="text-slate-600 mt-1">
                {new Date(plan.weekStart).toLocaleDateString()} -{' '}
                {new Date(plan.weekEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            onClick={generatePlan}
            disabled={generating}
          >
            {generating ? 'Generating...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
          </Button>
        </div>

        {!plan ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🍜</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No meal plan yet
            </h3>
            <p className="text-slate-600 mb-6">
              Click "Generate Plan" to create your personalized 7-day meal plan
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {groupedMeals.map(([date, meals]) => (
              <Card key={date}>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['breakfast', 'lunch', 'dinner', 'dessert'].map((slot) => {
                    const meal = meals.find((m) => m.slot === slot);

                    return (
                      <div
                        key={slot}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                      >
                        <div className="text-xs font-semibold text-emerald-600 uppercase mb-2">
                          {slot}
                        </div>
                        {meal?.recipe ? (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">
                              {meal.recipe.title}
                            </h4>
                            <div className="space-y-1 text-sm text-slate-600">
                              {meal.recipe.timeMins && (
                                <div>⏱️ {meal.recipe.timeMins} min</div>
                              )}
                              {meal.recipe.kcal && (
                                <div>🔥 {meal.recipe.kcal} kcal</div>
                              )}
                              {meal.recipe.proteinG && (
                                <div>💪 {meal.recipe.proteinG}g protein</div>
                              )}
                              {meal.recipe.estimatedPrice && (
                                <div>
                                  💰 {meal.recipe.estimatedPrice}{' '}
                                  {meal.recipe.currency}
                                </div>
                              )}
                            </div>
                            <Link
                              href={`/recipes/${meal.recipe.id}`}
                              className="text-sm text-emerald-600 hover:text-emerald-700 mt-3 inline-block"
                            >
                              View recipe →
                            </Link>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">
                            No meal planned
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
