'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { getNutritionSummary } from '@/lib/nutrition';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [formData, setFormData] = useState({
    caloriesTarget: 2000,
    proteinTarget: 120,
    diet: 'balanced,clean-eating',
    halalEnabled: false,
    vegetarianEnabled: false,
    veganEnabled: false,
    allergens: '',
    allergenCustom: '',
    commonAllergens: [] as string[],
    dislikes: '',
    dislikesCustom: '',
    commonDislikes: [] as string[],
    cuisines: 'Cambodian,Thai,Vietnamese',
    cuisinesList: ['Cambodian', 'Thai', 'Vietnamese'] as string[],
    customCuisineInput: '',
    timeBudgetMins: 40,
    budgetLevel: 'medium',
    equipment: 'stovetop,rice cooker',
    equipmentList: ['stovetop', 'rice cooker'] as string[],
    equipmentCustom: '',
    region: 'KH',
    currency: 'KHR',
    // Weight goal fields
    currentWeight: 70,
    targetWeight: 70,
    weightGoal: 'maintain',
    height: 170,
    age: 30,
    activityLevel: 'moderate',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDietToggle = (dietValue: string) => {
    setFormData((prev) => {
      const diets = prev.diet.split(',').map(d => d.trim()).filter(Boolean);
      if (diets.includes(dietValue)) {
        return {
          ...prev,
          diet: diets.filter(d => d !== dietValue).join(','),
        };
      } else {
        return {
          ...prev,
          diet: [...diets, dietValue].join(','),
        };
      }
    });
  };

  const handleAllergenToggle = (allergen: string) => {
    setFormData((prev) => {
      if (prev.commonAllergens.includes(allergen)) {
        return {
          ...prev,
          commonAllergens: prev.commonAllergens.filter(a => a !== allergen),
        };
      } else {
        return {
          ...prev,
          commonAllergens: [...prev.commonAllergens, allergen],
        };
      }
    });
  };

  const handleDislikeToggle = (dislike: string) => {
    setFormData((prev) => {
      if (prev.commonDislikes.includes(dislike)) {
        return {
          ...prev,
          commonDislikes: prev.commonDislikes.filter(d => d !== dislike),
        };
      } else {
        return {
          ...prev,
          commonDislikes: [...prev.commonDislikes, dislike],
        };
      }
    });
  };

  const addCustomAllergen = () => {
    if (formData.allergenCustom.trim()) {
      const allergens = formData.commonAllergens;
      if (!allergens.includes(formData.allergenCustom.trim())) {
        setFormData((prev) => ({
          ...prev,
          commonAllergens: [...allergens, prev.allergenCustom.trim()],
          allergenCustom: '',
        }));
      }
    }
  };

  const addCustomDislike = () => {
    if (formData.dislikesCustom.trim()) {
      const dislikes = formData.commonDislikes;
      if (!dislikes.includes(formData.dislikesCustom.trim())) {
        setFormData((prev) => ({
          ...prev,
          commonDislikes: [...dislikes, prev.dislikesCustom.trim()],
          dislikesCustom: '',
        }));
      }
    }
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData((prev) => {
      if (prev.cuisinesList.includes(cuisine)) {
        return {
          ...prev,
          cuisinesList: prev.cuisinesList.filter(c => c !== cuisine),
        };
      } else {
        return {
          ...prev,
          cuisinesList: [...prev.cuisinesList, cuisine],
        };
      }
    });
  };

  const addCustomCuisine = () => {
    if (formData.customCuisineInput.trim()) {
      const cuisines = formData.cuisinesList;
      if (!cuisines.includes(formData.customCuisineInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          cuisinesList: [...cuisines, prev.customCuisineInput.trim()],
          customCuisineInput: '',
        }));
      }
    }
  };

  const handleEquipmentToggle = (equip: string) => {
    setFormData((prev) => {
      if (prev.equipmentList.includes(equip)) {
        return {
          ...prev,
          equipmentList: prev.equipmentList.filter(e => e !== equip),
        };
      } else {
        return {
          ...prev,
          equipmentList: [...prev.equipmentList, equip],
        };
      }
    });
  };

  const addCustomEquipment = () => {
    if (formData.equipmentCustom.trim()) {
      const equipment = formData.equipmentList;
      if (!equipment.includes(formData.equipmentCustom.trim())) {
        setFormData((prev) => ({
          ...prev,
          equipmentList: [...equipment, prev.equipmentCustom.trim()],
          equipmentCustom: '',
        }));
      }
    }
  };

  const handleCalculateNutrition = (e: React.MouseEvent) => {
    e.preventDefault();
    setCalculating(true);

    try {
      // Validate required fields
      if (!formData.currentWeight || !formData.height || !formData.age || !formData.weightGoal || !formData.activityLevel) {
        alert('Please fill in all body metrics and weight goal fields');
        setCalculating(false);
        return;
      }

      // Calculate nutrition targets
      const summary = getNutritionSummary({
        currentWeight: Number(formData.currentWeight),
        height: Number(formData.height),
        age: Number(formData.age),
        weightGoal: formData.weightGoal as 'maintain' | 'lose' | 'gain' | 'bulk',
        activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
        targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
      });

      // Update form with calculated values
      setFormData((prev) => ({
        ...prev,
        caloriesTarget: summary.targets.dailyCalories,
        proteinTarget: summary.targets.proteinG,
      }));

      // Show summary
      setNutritionSummary(summary);
    } catch (error) {
      console.error('Error calculating nutrition targets:', error);
      alert('Failed to calculate nutrition targets. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine common allergens and custom input
      const allAllergens = [
        ...formData.commonAllergens,
        ...(formData.allergenCustom.trim() ? [formData.allergenCustom.trim()] : [])
      ].join(',');

      // Combine common dislikes and custom input
      const allDislikes = [
        ...formData.commonDislikes,
        ...(formData.dislikesCustom.trim() ? [formData.dislikesCustom.trim()] : [])
      ].join(',');

      // Combine cuisines
      const allCuisines = formData.cuisinesList.join(',');

      // Combine equipment
      const allEquipment = formData.equipmentList.join(',');

      // Prepare form data for submission
      const submitData = {
        ...formData,
        allergens: allAllergens,
        dislikes: allDislikes,
        cuisines: allCuisines,
        equipment: allEquipment,
        // Remove internal state fields
        allergenCustom: undefined,
        dislikesCustom: undefined,
        commonAllergens: undefined,
        commonDislikes: undefined,
        cuisinesList: undefined,
        customCuisineInput: undefined,
        equipmentList: undefined,
        equipmentCustom: undefined,
      };

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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
            Create Your Personal Profile
          </h1>
          <p className="text-slate-600">
            Start with your weight goals and nutrition optimization, then customize your meal plan
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Weight Goals & Nutrition Optimization - FIRST SECTION */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Weight Goals & Nutrition Optimization
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                Help us calculate your optimal nutrition targets based on your body metrics and goals
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <Input
                  label="Current Weight (kg)"
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  step="0.1"
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="100"
                  max="250"
                  step="0.1"
                />
                <Input
                  label="Age (years)"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="13"
                  max="120"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Select
                  label="Activity Level"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  options={[
                    { value: 'sedentary', label: '🪑 Sedentary - Little or no exercise' },
                    { value: 'light', label: '🚶 Light - 1-3 days/week exercise' },
                    { value: 'moderate', label: '🏃 Moderate - 3-5 days/week exercise' },
                    { value: 'active', label: '💪 Active - 6-7 days/week exercise' },
                    { value: 'veryActive', label: '⚡ Very Active - Intense exercise daily' },
                  ]}
                />
                <Select
                  label="Weight Goal"
                  name="weightGoal"
                  value={formData.weightGoal}
                  onChange={handleChange}
                  options={[
                    { value: 'maintain', label: '⚖️ Maintain - Stay at current weight' },
                    { value: 'lose', label: '📉 Lose Weight - Gradual weight loss' },
                    { value: 'gain', label: '📈 Gain Weight - Lean mass gain' },
                    { value: 'bulk', label: '💪 Bulk - Build muscle mass' },
                  ]}
                />
              </div>

              <Input
                label="Target Weight (kg)"
                type="number"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleChange}
                min="30"
                max="300"
                step="0.1"
              />

              {/* Calculate Button */}
              <div className="mt-6">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCalculateNutrition}
                  disabled={calculating}
                  className="w-full"
                >
                  {calculating ? 'Calculating...' : 'Calculate Nutrition Targets'}
                </Button>
              </div>

              {/* Nutrition Summary Display */}
              {nutritionSummary && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h3 className="font-semibold text-emerald-900 mb-3">Your Optimal Nutrition Targets</h3>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded border border-emerald-100">
                      <p className="text-sm text-slate-600">Daily Calories</p>
                      <p className="text-2xl font-bold text-emerald-600">{nutritionSummary.targets.dailyCalories}</p>
                      <p className="text-xs text-slate-500 mt-1">kcal/day</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-emerald-100">
                      <p className="text-sm text-slate-600">Daily Protein</p>
                      <p className="text-2xl font-bold text-emerald-600">{nutritionSummary.targets.proteinG}</p>
                      <p className="text-xs text-slate-500 mt-1">grams/day</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-emerald-100">
                      <p className="text-sm text-slate-600">Carbs</p>
                      <p className="text-2xl font-bold text-blue-600">{nutritionSummary.targets.carbsG}</p>
                      <p className="text-xs text-slate-500 mt-1">grams/day</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-emerald-100">
                      <p className="text-sm text-slate-600">Fat</p>
                      <p className="text-2xl font-bold text-orange-600">{nutritionSummary.targets.fatG}</p>
                      <p className="text-xs text-slate-500 mt-1">grams/day</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-emerald-100">
                    <p className="text-sm text-slate-600 mb-2">Your Profile</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="font-semibold">BMI:</span> {nutritionSummary.bmi}</p>
                      <p><span className="font-semibold">BMR:</span> {nutritionSummary.bmr} cal</p>
                      <p><span className="font-semibold">TDEE:</span> {nutritionSummary.tdee} cal</p>
                      {nutritionSummary.targets.estimatedWeeksToGoal && (
                        <p><span className="font-semibold">Timeline:</span> ~{nutritionSummary.targets.estimatedWeeksToGoal} weeks</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-emerald-100 rounded">
                    <p className="text-sm text-emerald-900"><strong>Recommendation:</strong> {nutritionSummary.recommendation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Nutrition Targets */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Nutrition Targets
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                Auto-calculated based on your weight goal. Adjust if needed.
              </p>
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

            {/* Diet Type - Multiple Selection */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Diet Types (Select All That Apply)
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                Choose one or multiple diet approaches
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { value: 'balanced', label: '⚖️ Balanced - All food groups in moderation' },
                  { value: 'keto', label: '🥑 Keto - High-fat, moderate-protein, very low-carb' },
                  { value: 'mediterranean', label: '🫒 Mediterranean - Fish, olive oil, vegetables' },
                  { value: 'paleo', label: '🍖 Paleo - Lean meats, fish, fruits, vegetables' },
                  { value: 'dash', label: '💚 DASH - Low sodium, fruits, vegetables, whole grains' },
                  { value: 'intermittent-fasting', label: '⏰ Intermittent Fasting - Timed eating patterns' },
                  { value: 'low-carb', label: '🥗 Low-Carb - Restricted carbohydrate intake' },
                  { value: 'cardiac', label: '❤️ Cardiac - Low fat, cholesterol, and salt' },
                  { value: 'clear-liquid', label: '💧 Clear Liquid - See-through liquids only' },
                  { value: 'diabetic', label: '🩺 Diabetic - Controlled carbohydrate intake' },
                  { value: 'gluten-free', label: '🌾 Gluten-Free - No wheat, barley, or rye' },
                  { value: 'high-fiber', label: '🥕 High-Fiber - Increased fiber intake' },
                  { value: 'clean-eating', label: '🍎 Clean Eating - Whole, unprocessed foods' },
                  { value: 'intuitive-eating', label: '🧠 Intuitive Eating - Body-led eating' },
                ].map((diet) => {
                  const selectedDiets = formData.diet.split(',').map(d => d.trim()).filter(Boolean);
                  const isSelected = selectedDiets.includes(diet.value);
                  return (
                    <label key={diet.value} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDietToggle(diet.value)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 text-sm">{diet.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Dietary Restrictions */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Dietary Restrictions</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="halalEnabled"
                      checked={formData.halalEnabled}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">🕌 Halal only - Islamic dietary guidelines</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="vegetarianEnabled"
                      checked={formData.vegetarianEnabled}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">🥦 Vegetarian - No meat or fish</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="veganEnabled"
                      checked={formData.veganEnabled}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700">🌿 Vegan - No animal products</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Allergens & Dislikes */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Allergens & Ingredients to Avoid
              </h2>

              {/* Common Allergens */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Common Allergens</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {['🥜 Peanuts', '🦐 Shellfish', '🥛 Dairy', '🥚 Eggs', '🌰 Tree Nuts', '🐟 Fish', '🌾 Wheat', '🥄 Sesame'].map((allergen) => {
                    const allergenValue = allergen.split(' ').slice(1).join(' ');
                    return (
                      <label key={allergen} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.commonAllergens.includes(allergenValue)}
                          onChange={() => handleAllergenToggle(allergenValue)}
                          className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-slate-700">{allergen}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Allergen Input */}
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-slate-600 mb-2">Add other allergens not listed above</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.allergenCustom}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergenCustom: e.target.value }))}
                    placeholder="e.g., sulfites, histamine"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomAllergen()}
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergen}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Add
                  </button>
                </div>
                {formData.commonAllergens.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.commonAllergens.map((allergen, idx) => (
                      <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {allergen}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.commonAllergens.filter((_, i) => i !== idx);
                            setFormData(prev => ({ ...prev, commonAllergens: updated }));
                          }}
                          className="hover:text-red-900 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Common Dislikes */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Common Foods to Avoid</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {['🦬 Beef', '🐔 Chicken', '🐷 Pork', '🧅 Onion', '🧄 Garlic', '🌶️ Spicy Foods', '🫘 Beans', '🦑 Squid', '🍄 Mushrooms', '🥦 Bitter Gourd', '🫒 Olive Oil', '🍅 Tomato'].map((dislike) => {
                    const dislikeValue = dislike.split(' ').slice(1).join(' ');
                    return (
                      <label key={dislike} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.commonDislikes.includes(dislikeValue)}
                          onChange={() => handleDislikeToggle(dislikeValue)}
                          className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-slate-700">{dislike}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Dislike Input */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-slate-600 mb-2">Add other foods you dislike</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.dislikesCustom}
                    onChange={(e) => setFormData(prev => ({ ...prev, dislikesCustom: e.target.value }))}
                    placeholder="e.g., liver, durian"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDislike()}
                  />
                  <button
                    type="button"
                    onClick={addCustomDislike}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                  >
                    Add
                  </button>
                </div>
                {formData.commonDislikes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.commonDislikes.map((dislike, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {dislike}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.commonDislikes.filter((_, i) => i !== idx);
                            setFormData(prev => ({ ...prev, commonDislikes: updated }));
                          }}
                          className="hover:text-amber-900 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Preferences
              </h2>

              {/* Cuisines */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Cuisines (Select Your Preferences)</h3>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  {['🇰🇭 Cambodian', '🇹🇭 Thai', '🇻🇳 Vietnamese', '🇺🇸 American', '🇮🇹 Italian', '🇲🇽 Mexican', '🇯🇵 Japanese', '🇨🇳 Chinese', '🇮🇳 Indian', '🇬🇧 British', '🇪🇸 Spanish', '🇫🇷 French', '🇰🇷 Korean', '🇵🇭 Filipino', '🇲🇾 Malaysian', '🇹🇼 Taiwanese', '🇬🇷 Greek', '🇹🇷 Turkish', '🇧🇷 Brazilian', '🇲🇦 Moroccan'].map((cuisine) => {
                    const cuisineValue = cuisine.split(' ').slice(1).join(' ');
                    return (
                      <label key={cuisine} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cuisinesList.includes(cuisineValue)}
                          onChange={() => handleCuisineToggle(cuisineValue)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 text-sm">{cuisine}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Cuisine Input */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-600 mb-2">Add other cuisines not listed above</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.customCuisineInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCuisineInput: e.target.value }))}
                      placeholder="e.g., Lebanese, Vietnamese"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomCuisine()}
                    />
                    <button
                      type="button"
                      onClick={addCustomCuisine}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.cuisinesList.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.cuisinesList.map((cuisine, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {cuisine}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.cuisinesList.filter((_, i) => i !== idx);
                              setFormData(prev => ({ ...prev, cuisinesList: updated }));
                            }}
                            className="hover:text-blue-900 font-bold"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cooking Time and Budget */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                    { value: 'low', label: '💰 Low - Budget-friendly ingredients' },
                    { value: 'medium', label: '💵 Medium - Balanced cost & quality' },
                    { value: 'high', label: '💎 High - Premium ingredients' },
                  ]}
                />
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Cooking Equipment (Select What You Have)</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {['🔥 Stovetop', '⏲️ Rice Cooker', '🥘 Wok', '🍳 Frying Pan', '🍲 Pot', '🔪 Cutting Board', '🥄 Spoon', '🔨 Mortar & Pestle', '🌡️ Oven', '⚡ Blender', '🧊 Microwave', '✂️ Kitchen Scissors', '🥣 Mixing Bowl', '🫖 Steamer', '📍 Knife Set'].map((equip) => {
                    const equipValue = equip.split(' ').slice(1).join(' ');
                    return (
                      <label key={equip} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.equipmentList.includes(equipValue)}
                          onChange={() => handleEquipmentToggle(equipValue)}
                          className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-slate-700 text-sm">{equip}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Equipment Input */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-slate-600 mb-2">Add other equipment you have</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.equipmentCustom}
                      onChange={(e) => setFormData(prev => ({ ...prev, equipmentCustom: e.target.value }))}
                      placeholder="e.g., pressure cooker, air fryer"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyDown={(e) => e.key === 'Enter' && addCustomEquipment()}
                    />
                    <button
                      type="button"
                      onClick={addCustomEquipment}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.equipmentList.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.equipmentList.map((equip, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {equip}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.equipmentList.filter((_, i) => i !== idx);
                              setFormData(prev => ({ ...prev, equipmentList: updated }));
                            }}
                            className="hover:text-purple-900 font-bold"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
                    { value: 'KH', label: '🇰🇭 Cambodia' },
                    { value: 'TH', label: '🇹🇭 Thailand' },
                    { value: 'VN', label: '🇻🇳 Vietnam' },
                    { value: 'AU', label: '🇦🇺 Australia' },
                    { value: 'US', label: '🇺🇸 United States' },
                  ]}
                />
                <Select
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  options={[
                    { value: 'KHR', label: '💲 KHR - Cambodian Riel' },
                    { value: 'THB', label: '💲 THB - Thai Baht' },
                    { value: 'VND', label: '💲 VND - Vietnamese Dong' },
                    { value: 'AUD', label: '💲 AUD - Australian Dollar' },
                    { value: 'USD', label: '💲 USD - US Dollar' },
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
