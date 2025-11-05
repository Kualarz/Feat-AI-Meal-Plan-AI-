'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';

interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  notes?: string;
}

const DIET_TAGS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'halal',
  'kosher',
  'keto',
  'paleo',
  'high-protein',
];

const CUISINES = [
  'Cambodian',
  'Thai',
  'Vietnamese',
  'Australian',
  'American',
  'Malaysian',
  'Indian',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Korean',
];

const UNITS = ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'oz', 'lb', 'whole', 'pinch', 'clove'];

export default function AddRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', qty: '', unit: 'g', notes: '' },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: '',
    difficulty: 'easy',
    timeMins: '',
    estimatedPrice: '',
    currency: 'USD',
    imageUrl: '',
    kcal: '',
    proteinG: '',
    carbsG: '',
    fatG: '',
    fiberG: '',
    sugarG: '',
    sodiumMg: '',
    stepsMd: '',
    safetyMd: '',
    tags: '',
  });

  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', qty: '', unit: 'g', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleDietTag = (tag: string) => {
    setSelectedDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Recipe title is required');
      return false;
    }
    if (!formData.cuisine.trim()) {
      setError('Cuisine is required');
      return false;
    }
    if (ingredients.some((i) => !i.name.trim() || !i.qty.trim())) {
      setError('All ingredients must have a name and quantity');
      return false;
    }
    if (!formData.stepsMd.trim()) {
      setError('Cooking steps are required');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timeMins: formData.timeMins ? parseInt(formData.timeMins) : null,
          estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : null,
          kcal: formData.kcal ? parseInt(formData.kcal) : null,
          proteinG: formData.proteinG ? parseInt(formData.proteinG) : null,
          carbsG: formData.carbsG ? parseInt(formData.carbsG) : null,
          fatG: formData.fatG ? parseInt(formData.fatG) : null,
          fiberG: formData.fiberG ? parseInt(formData.fiberG) : null,
          sugarG: formData.sugarG ? parseInt(formData.sugarG) : null,
          sodiumMg: formData.sodiumMg ? parseInt(formData.sodiumMg) : null,
          ingredientsJson: JSON.stringify(ingredients),
          dietTags: selectedDietTags.join(','),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save recipe');
      }

      const result = await response.json();
      router.push(`/recipes/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Add New Recipe</h2>
            <Link href="/recipes">
              <Button variant="outline">← Back to Recipes</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Basic Information</h3>
              <div className="space-y-4">
                <Input
                  label="Recipe Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., Green Curry with Chicken"
                  required
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Brief description of the recipe..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Cuisine"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleFormChange}
                    options={[
                      { value: '', label: 'Select Cuisine' },
                      ...CUISINES.map((c) => ({ value: c, label: c })),
                    ]}
                    required
                  />

                  <Select
                    label="Difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleFormChange}
                    options={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' },
                    ]}
                  />
                </div>

                <Input
                  label="Image URL"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Cooking Details */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Cooking Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Time (minutes)"
                    name="timeMins"
                    type="number"
                    value={formData.timeMins}
                    onChange={handleFormChange}
                    placeholder="30"
                  />

                  <Input
                    label="Price"
                    name="estimatedPrice"
                    type="number"
                    step="0.01"
                    value={formData.estimatedPrice}
                    onChange={handleFormChange}
                    placeholder="5.50"
                  />

                  <Select
                    label="Currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    options={[
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'KHR', label: 'KHR (៛)' },
                      { value: 'THB', label: 'THB (฿)' },
                      { value: 'VND', label: 'VND (₫)' },
                      { value: 'AUD', label: 'AUD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'GBP', label: 'GBP (£)' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Nutritional Information (per serving)</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Calories (kcal)"
                    name="kcal"
                    type="number"
                    value={formData.kcal}
                    onChange={handleFormChange}
                    placeholder="450"
                  />

                  <Input
                    label="Protein (g)"
                    name="proteinG"
                    type="number"
                    value={formData.proteinG}
                    onChange={handleFormChange}
                    placeholder="20"
                  />

                  <Input
                    label="Carbs (g)"
                    name="carbsG"
                    type="number"
                    value={formData.carbsG}
                    onChange={handleFormChange}
                    placeholder="45"
                  />

                  <Input
                    label="Fat (g)"
                    name="fatG"
                    type="number"
                    value={formData.fatG}
                    onChange={handleFormChange}
                    placeholder="18"
                  />

                  <Input
                    label="Fiber (g)"
                    name="fiberG"
                    type="number"
                    value={formData.fiberG}
                    onChange={handleFormChange}
                    placeholder="3"
                  />

                  <Input
                    label="Sugar (g)"
                    name="sugarG"
                    type="number"
                    value={formData.sugarG}
                    onChange={handleFormChange}
                    placeholder="5"
                  />

                  <Input
                    label="Sodium (mg)"
                    name="sodiumMg"
                    type="number"
                    value={formData.sodiumMg}
                    onChange={handleFormChange}
                    placeholder="600"
                  />
                </div>
              </div>
            </div>

            {/* Diet Tags */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Dietary Tags</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIET_TAGS.map((tag) => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDietTags.includes(tag)}
                      onChange={() => toggleDietTag(tag)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground capitalize">{tag.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-foreground">Ingredients</h3>
                <Button type="button" onClick={addIngredient} variant="outline" className="px-4 py-2 text-sm">
                  + Add Ingredient
                </Button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <Input
                      label={index === 0 ? 'Ingredient Name' : ''}
                      placeholder="e.g., Chicken breast"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="flex-1"
                    />

                    <Input
                      label={index === 0 ? 'Qty' : ''}
                      type="number"
                      placeholder="200"
                      value={ingredient.qty}
                      onChange={(e) => handleIngredientChange(index, 'qty', e.target.value)}
                      className="w-24"
                    />

                    <Select
                      label={index === 0 ? 'Unit' : ''}
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      options={UNITS.map((u) => ({ value: u, label: u }))}
                      className="w-24"
                    />

                    <Input
                      label={index === 0 ? 'Notes' : ''}
                      placeholder="Optional notes"
                      value={ingredient.notes || ''}
                      onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                      className="flex-1"
                    />

                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        variant="outline"
                        className="px-3 py-2 text-sm"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Steps */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Cooking Steps</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Enter numbered steps. You can use markdown for formatting (e.g., **bold**, *italic*)
              </p>
              <textarea
                name="stepsMd"
                value={formData.stepsMd}
                onChange={handleFormChange}
                placeholder={`1. Preheat oven to 200°C
2. Mix ingredients in a bowl
3. Pour into baking dish
4. Bake for 25 minutes until golden`}
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={8}
                required
              />
            </div>

            {/* Food Safety */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Food Safety Tips (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Add important safety information for this recipe
              </p>
              <textarea
                name="safetyMd"
                value={formData.safetyMd}
                onChange={handleFormChange}
                placeholder={`**Food Safety Tips:**
- Store at proper temperature
- Cook until internal temperature reaches 165°F
- Wash hands after handling raw ingredients`}
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                rows={6}
              />
            </div>

            {/* Tags */}
            <div>
              <Input
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={handleFormChange}
                placeholder="e.g., quick, easy, budget-friendly"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-border">
              <Link href="/recipes">
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Recipe'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
