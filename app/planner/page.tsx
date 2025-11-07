'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';
import { MealPlannerCalendar } from '@/components/MealPlannerCalendar';

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
  const [selectedDate, setSelectedDate] = useState<string>('');

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
        // Weight goal and body metrics
        currentWeight: preferences.currentWeight,
        targetWeight: preferences.targetWeight,
        height: preferences.height,
        age: preferences.age,
        weightGoal: preferences.weightGoal,
        activityLevel: preferences.activityLevel,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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

  const getFilteredMeals = (): [string, PlanMeal[]][] => {
    if (!plan) return [];

    if (!selectedDate) {
      return groupMealsByDate() as [string, PlanMeal[]][];
    }

    const mealsForDate = plan.meals.filter((meal) => meal.dateISO === selectedDate);
    if (mealsForDate.length === 0) {
      return [];
    }

    return [[selectedDate, mealsForDate]];
  };

  const groupedMeals = getFilteredMeals();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Your Meal Plan
            </h2>
            {plan && (
              <p className="text-muted-foreground mt-1">
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No meal plan yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Click "Generate Plan" to create your personalized 7-day meal plan
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Calendar */}
            <MealPlannerCalendar
              meals={plan.meals}
              weekStart={plan.weekStart}
              weekEnd={plan.weekEnd}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            {/* Selected Date Info and Clear Button */}
            {selectedDate && (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Showing meals for{' '}
                    <span className="font-semibold">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedDate('')} className="text-sm">
                  Show All Meals
                </Button>
              </div>
            )}

            {/* Meals List */}
            {groupedMeals.length > 0 ? (
            <div className="grid gap-6">
            {groupedMeals.map(([date, meals]) => (
              <Card key={date}>
                <h3 className="text-xl font-semibold text-foreground mb-4">
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
                        className="bg-muted rounded-xl p-4 border border-border"
                      >
                        <div className="text-xs font-semibold text-primary uppercase mb-2">
                          {slot}
                        </div>
                        {meal?.recipe ? (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              {meal.recipe.title}
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
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
                              className="text-sm text-primary hover:opacity-80 mt-3 inline-block"
                            >
                              View recipe →
                            </Link>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
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
            ) : selectedDate ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No meals planned
                </h3>
                <p className="text-muted-foreground">
                  No meals scheduled for this date. Click "Show All Meals" to view your full plan.
                </p>
              </Card>
            ) : null}
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
