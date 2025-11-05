'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caloriesTarget: 2000,
    proteinTarget: 120,
    diet: 'balanced',
    halalEnabled: false,
    vegetarianEnabled: false,
    veganEnabled: false,
    allergens: '',
    dislikes: '',
    cuisines: 'Cambodian,Thai,Vietnamese',
    timeBudgetMins: 40,
    budgetLevel: 'medium',
    equipment: 'stovetop,rice cooker',
    region: 'KH',
    currency: 'KHR',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      router.push('/planner');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Set Your Preferences
          </h1>
          <p className="text-slate-600">
            Customize your meal plan to match your dietary needs and lifestyle
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nutrition Targets */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Nutrition Targets
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Daily Calories"
                  type="number"
                  name="caloriesTarget"
                  value={formData.caloriesTarget}
                  onChange={handleChange}
                  min="1000"
                  max="5000"
                  required
                />
                <Input
                  label="Daily Protein (g)"
                  type="number"
                  name="proteinTarget"
                  value={formData.proteinTarget}
                  onChange={handleChange}
                  min="50"
                  max="300"
                  required
                />
              </div>
            </div>

            {/* Diet Type */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Diet Type
              </h2>
              <Select
                label="Primary Diet"
                name="diet"
                value={formData.diet}
                onChange={handleChange}
                options={[
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'vegetarian', label: 'Vegetarian' },
                  { value: 'vegan', label: 'Vegan' },
                  { value: 'pescatarian', label: 'Pescatarian' },
                  { value: 'keto', label: 'Keto' },
                ]}
              />

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="halalEnabled"
                    checked={formData.halalEnabled}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">Halal only</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="vegetarianEnabled"
                    checked={formData.vegetarianEnabled}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">Vegetarian</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="veganEnabled"
                    checked={formData.veganEnabled}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">Vegan</span>
                </label>
              </div>
            </div>

            {/* Restrictions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Restrictions
              </h2>
              <div className="space-y-4">
                <Input
                  label="Allergens (comma-separated)"
                  type="text"
                  name="allergens"
                  value={formData.allergens}
                  onChange={handleChange}
                  placeholder="e.g., peanut, shellfish"
                />
                <Input
                  label="Foods I Dislike (comma-separated)"
                  type="text"
                  name="dislikes"
                  value={formData.dislikes}
                  onChange={handleChange}
                  placeholder="e.g., bitter gourd, liver"
                />
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Preferences
              </h2>
              <div className="space-y-4">
                <Input
                  label="Cuisines (comma-separated)"
                  type="text"
                  name="cuisines"
                  value={formData.cuisines}
                  onChange={handleChange}
                  placeholder="e.g., Cambodian, Thai, Vietnamese"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Max Cooking Time (minutes)"
                    type="number"
                    name="timeBudgetMins"
                    value={formData.timeBudgetMins}
                    onChange={handleChange}
                    min="10"
                    max="180"
                  />
                  <Select
                    label="Budget Level"
                    name="budgetLevel"
                    value={formData.budgetLevel}
                    onChange={handleChange}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                  />
                </div>
                <Input
                  label="Equipment (comma-separated)"
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  placeholder="e.g., stovetop, rice cooker, wok"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Location
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  options={[
                    { value: 'KH', label: 'Cambodia (KH)' },
                    { value: 'TH', label: 'Thailand (TH)' },
                    { value: 'VN', label: 'Vietnam (VN)' },
                    { value: 'AU', label: 'Australia (AU)' },
                    { value: 'US', label: 'United States (US)' },
                  ]}
                />
                <Select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  options={[
                    { value: 'KHR', label: 'KHR (Cambodian Riel)' },
                    { value: 'THB', label: 'THB (Thai Baht)' },
                    { value: 'VND', label: 'VND (Vietnamese Dong)' },
                    { value: 'AUD', label: 'AUD (Australian Dollar)' },
                    { value: 'USD', label: 'USD (US Dollar)' },
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
