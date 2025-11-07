'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { GroceryCategory } from '@/lib/groceries';

interface LeftoverIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  expirationDate: string | null;
  addedDate: string;
  used: boolean;
}

interface LeftoversCalendarProps {
  leftovers: LeftoverIngredient[];
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export function LeftoversCalendar({
  leftovers,
  onDateSelect,
  selectedDate,
}: LeftoversCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const isExpired = (expirationDate: string | null): boolean => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  const isExpiringSoon = (expirationDate: string | null): boolean => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
  };

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

  const getLeftoversForDay = (day: number) => {
    const dateKey = getDateKey(day);
    return leftovers.filter((item) => {
      if (!item.expirationDate) return false;
      return item.expirationDate === dateKey;
    });
  };

  const getLeftoversAddedOnDay = (day: number) => {
    const dateKey = getDateKey(day);
    return leftovers.filter((item) => item.addedDate === dateKey);
  };

  const getExpiredCountForDay = (day: number) => {
    return leftovers.filter((item) => {
      const dateKey = getDateKey(day);
      return item.expirationDate === dateKey && isExpired(item.expirationDate);
    }).length;
  };

  const getExpiringCountForDay = (day: number) => {
    return leftovers.filter((item) => {
      const dateKey = getDateKey(day);
      return item.expirationDate === dateKey && isExpiringSoon(item.expirationDate);
    }).length;
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

  const isToday = (day: number) => {
    if (!day) return false;
    const dateKey = getDateKey(day);
    const today = new Date().toISOString().split('T')[0];
    return dateKey === today;
  };

  const hasLeftovers = (day: number) => {
    if (!day) return false;
    return getLeftoversForDay(day).length > 0 || getLeftoversAddedOnDay(day).length > 0;
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{monthName}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Expiration & Inventory Tracking
            </p>
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

              const dateKey = getDateKey(day);
              const isSelected = selectedDate === dateKey;
              const isTodayDate = isToday(day);
              const has = hasLeftovers(day);
              const expiredCount = getExpiredCountForDay(day);
              const expiringCount = getExpiringCountForDay(day);
              const addedCount = getLeftoversAddedOnDay(day).length;

              return (
                <button
                  key={day}
                  onClick={() => onDateSelect?.(dateKey)}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-colors
                    flex flex-col items-start justify-start text-left text-xs
                    ${isSelected
                      ? 'border-primary bg-primary/10'
                      : expiredCount > 0
                      ? 'border-red-500/50 bg-red-500/5 hover:border-red-500/70'
                      : expiringCount > 0
                      ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500/70'
                      : has
                      ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                      : 'border-border bg-muted hover:border-muted-foreground/30'
                    }
                    ${isTodayDate ? 'ring-2 ring-primary ring-offset-2' : ''}
                  `}
                >
                  <div className="font-semibold text-foreground">{day}</div>

                  {has && (
                    <div className="w-full flex-1 flex flex-col justify-end gap-0.5">
                      {expiredCount > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 font-medium truncate">
                          ❌ {expiredCount} expired
                        </div>
                      )}
                      {expiringCount > 0 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium truncate">
                          ⚠️ {expiringCount} soon
                        </div>
                      )}
                      {addedCount > 0 && (
                        <div className="text-xs text-primary font-medium truncate">
                          ➕ {addedCount} added
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
        <div className="border-t border-border pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-red-500/50 bg-red-500/5"></div>
            <span className="text-muted-foreground">Expired</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-amber-500/50 bg-amber-500/5"></div>
            <span className="text-muted-foreground">Expiring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary/30 bg-primary/5"></div>
            <span className="text-muted-foreground">With items</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
