'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

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

interface MealPlannerCalendarProps {
  meals: PlanMeal[];
  weekStart?: string;
  weekEnd?: string;
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export function MealPlannerCalendar({
  meals,
  weekStart,
  weekEnd,
  onDateSelect,
  selectedDate,
}: MealPlannerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const mealsMap = new Map<string, PlanMeal[]>();
  meals.forEach((meal) => {
    const key = meal.dateISO;
    if (!mealsMap.has(key)) {
      mealsMap.set(key, []);
    }
    mealsMap.get(key)!.push(meal);
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDateKey = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const getMealsForDay = (day: number) => {
    const dateKey = getDateKey(day);
    return mealsMap.get(dateKey) || [];
  };

  const getCaloriesForDay = (day: number) => {
    const dayMeals = getMealsForDay(day);
    return dayMeals.reduce((total, meal) => total + (meal.recipe?.kcal || 0), 0);
  };

  const getProteinForDay = (day: number) => {
    const dayMeals = getMealsForDay(day);
    return dayMeals.reduce((total, meal) => total + (meal.recipe?.proteinG || 0), 0);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isDateInPlan = (day: number) => {
    if (!day) return false;
    const dateKey = getDateKey(day);
    return (
      (weekStart && weekEnd && dateKey >= weekStart && dateKey <= weekEnd) ||
      mealsMap.has(dateKey)
    );
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const dateKey = getDateKey(day);
    const today = new Date().toISOString().split('T')[0];
    return dateKey === today;
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{monthName}</h2>
            {weekStart && weekEnd && (
              <p className="text-sm text-muted-foreground mt-1">
                Plan period: {new Date(weekStart).toLocaleDateString()} -{' '}
                {new Date(weekEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrevMonth}>
              ← Prev
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" onClick={handleNextMonth}>
              Next →
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return (
                  <div key={`empty-${index}`} className="aspect-square"></div>
                );
              }

              const dayMeals = getMealsForDay(day);
              const mealCount = dayMeals.length;
              const filledMeals = dayMeals.filter((m) => m.recipe).length;
              const calories = getCaloriesForDay(day);
              const protein = getProteinForDay(day);
              const dateKey = getDateKey(day);
              const isSelected = selectedDate === dateKey;
              const inPlan = isDateInPlan(day);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => onDateSelect?.(dateKey)}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-colors
                    flex flex-col items-start justify-start text-left text-xs
                    ${isSelected
                      ? 'border-primary bg-primary/10'
                      : inPlan
                      ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                      : 'border-border bg-muted hover:border-muted-foreground/30'
                    }
                    ${isTodayDate ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}
                >
                  <div className="font-semibold text-foreground">{day}</div>

                  {inPlan && (
                    <div className="w-full flex-1 flex flex-col justify-end gap-0.5">
                      {filledMeals > 0 && (
                        <div className="text-xs text-primary font-medium">
                          {filledMeals}/{mealCount} meals
                        </div>
                      )}
                      {calories > 0 && (
                        <div className="text-xs text-muted-foreground truncate">
                          🔥 {calories} kcal
                        </div>
                      )}
                      {protein > 0 && (
                        <div className="text-xs text-muted-foreground truncate">
                          💪 {protein}g protein
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-border pt-4 grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary/30 bg-primary/5"></div>
            <span className="text-muted-foreground">With meals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-border bg-muted"></div>
            <span className="text-muted-foreground">No meals</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
