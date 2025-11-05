'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';

interface AddToPlannerModalProps {
  isOpen: boolean;
  recipeId: string;
  recipeName: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const MEAL_SLOTS = [
  { value: 'breakfast', label: '🌅 Breakfast' },
  { value: 'lunch', label: '🍽️ Lunch' },
  { value: 'dinner', label: '🌙 Dinner' },
  { value: 'dessert', label: '🍰 Dessert' },
];

export function AddToPlannerModal({
  isOpen,
  recipeId,
  recipeName,
  onClose,
  onSuccess,
}: AddToPlannerModalProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string>('lunch');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddToPlanner = async () => {
    if (!selectedDay && selectedDay !== 0) {
      setError('Please select a day');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a meal slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate the date for the selected day (starting from today)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Adjust to match our day numbering (0 = Monday)
      const adjustedToday = (dayOfWeek + 6) % 7;
      const daysToAdd = (selectedDay - adjustedToday + 7) % 7;

      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysToAdd);

      const dayISO = targetDate.toISOString().split('T')[0];

      const response = await fetch('/api/plans/addMeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          dayISO,
          slot: selectedSlot,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to planner');
      }

      const dayName = DAYS.find(d => d.value === selectedDay)?.label || 'selected day';
      const slotName = MEAL_SLOTS.find(s => s.value === selectedSlot)?.label || selectedSlot;

      onSuccess(`${recipeName} added to ${dayName} ${slotName}!`);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDay(0);
    setSelectedSlot('lunch');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Add to Planner</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-3xl leading-none -mr-2 -mt-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Recipe Display */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Recipe</p>
            <p className="font-semibold text-foreground">{recipeName}</p>
          </div>

          {/* Day Selector */}
          <div>
            <Select
              label="Day of Week"
              value={selectedDay.toString()}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              options={DAYS.map(d => ({ value: d.value.toString(), label: d.label }))}
              disabled={loading}
            />
          </div>

          {/* Meal Slot Selector */}
          <div>
            <Select
              label="Meal Slot"
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              options={MEAL_SLOTS}
              disabled={loading}
            />
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-sm text-foreground">
              💡 <strong>Tip:</strong> You can edit or remove meals from your planner anytime.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end pt-6 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddToPlanner} disabled={loading}>
            {loading ? 'Adding...' : 'Add to Planner'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
