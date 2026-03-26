'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { getNutritionSummary } from '@/lib/nutrition';
import { Navbar } from '@/components/Navbar';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  // Imperial display values (used only for UI, always converted to metric for storage)
  const [imperialWeight, setImperialWeight] = useState({ lbs: 154 });
  const [imperialTargetWeight, setImperialTargetWeight] = useState({ lbs: 154 });
  const [imperialHeight, setImperialHeight] = useState({ ft: 5, inches: 7 });
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
    showCalories: true,
  });

  // ─── Unit conversion helpers ───────────────────────────────────────────────
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
  const lbsToKg = (lbs: number) => Math.round(lbs / 2.20462 * 10) / 10;
  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    return { ft: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
  };
  const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * 2.54);

  const toggleUnitSystem = () => {
    if (unitSystem === 'metric') {
      // Convert metric → imperial for display state
      setImperialWeight({ lbs: kgToLbs(Number(formData.currentWeight)) });
      setImperialTargetWeight({ lbs: kgToLbs(Number(formData.targetWeight)) });
      setImperialHeight(cmToFtIn(Number(formData.height)));
      setUnitSystem('imperial');
    } else {
      // Convert imperial → metric and store back in formData
      setFormData(prev => ({
        ...prev,
        currentWeight: lbsToKg(imperialWeight.lbs),
        targetWeight: lbsToKg(imperialTargetWeight.lbs),
        height: ftInToCm(imperialHeight.ft, imperialHeight.inches),
      }));
      setUnitSystem('metric');
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

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
      // Resolve metric values regardless of current unit system
      const weightKg = unitSystem === 'imperial' ? lbsToKg(imperialWeight.lbs) : Number(formData.currentWeight);
      const heightCm = unitSystem === 'imperial' ? ftInToCm(imperialHeight.ft, imperialHeight.inches) : Number(formData.height);
      const targetWeightKg = unitSystem === 'imperial' ? lbsToKg(imperialTargetWeight.lbs) : Number(formData.targetWeight);

      if (!weightKg || !heightCm || !formData.age || !formData.weightGoal || !formData.activityLevel) {
        alert('Please fill in all body metrics and weight goal fields');
        setCalculating(false);
        return;
      }

      // Also sync imperial values back into formData so API submission has latest values
      if (unitSystem === 'imperial') {
        setFormData(prev => ({
          ...prev,
          currentWeight: weightKg,
          height: heightCm,
          targetWeight: targetWeightKg,
        }));
      }

      const summary = getNutritionSummary({
        currentWeight: weightKg,
        height: heightCm,
        age: Number(formData.age),
        weightGoal: formData.weightGoal as 'maintain' | 'lose' | 'gain' | 'bulk',
        activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
        targetWeight: targetWeightKg || undefined,
      });

      setFormData((prev) => ({
        ...prev,
        caloriesTarget: summary.targets.dailyCalories,
        proteinTarget: summary.targets.proteinG,
      }));

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
      const allAllergens = [
        ...formData.commonAllergens,
        ...(formData.allergenCustom.trim() ? [formData.allergenCustom.trim()] : [])
      ].join(',');

      const allDislikes = [
        ...formData.commonDislikes,
        ...(formData.dislikesCustom.trim() ? [formData.dislikesCustom.trim()] : [])
      ].join(',');

      const allCuisines = formData.cuisinesList.join(',');
      const allEquipment = formData.equipmentList.join(',');

      // Always submit in metric — convert if user was in imperial mode
      const metricWeight = unitSystem === 'imperial' ? lbsToKg(imperialWeight.lbs) : Number(formData.currentWeight);
      const metricHeight = unitSystem === 'imperial' ? ftInToCm(imperialHeight.ft, imperialHeight.inches) : Number(formData.height);
      const metricTargetWeight = unitSystem === 'imperial' ? lbsToKg(imperialTargetWeight.lbs) : Number(formData.targetWeight);

      const submitData = {
        ...formData,
        currentWeight: metricWeight,
        height: metricHeight,
        targetWeight: metricTargetWeight,
        allergens: allAllergens,
        dislikes: allDislikes,
        cuisines: allCuisines,
        equipment: allEquipment,
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

      // After preferences are saved, take the user to the Meal Planner
      router.push('/recipes');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 1:
        return 'Weight Goals & Nutrition Optimization';
      case 2:
        return 'Diet & Dietary Preferences';
      case 3:
        return 'Cooking Preferences & Location';
      default:
        return 'Create Your Personal Profile';
    }
  };

  const getPageDescription = () => {
    switch (currentPage) {
      case 1:
        return 'Start by setting your weight goals and let us calculate your optimal nutrition targets';
      case 2:
        return 'Choose your diet types, dietary restrictions, and ingredients to avoid';
      case 3:
        return 'Select your cuisine preferences, equipment, and location';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Create Your Personal Profile
          </h1>
          <p className="text-muted-foreground mb-4">
            {getPageDescription()}
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((page) => (
              <div
                key={page}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentPage === page ? 'bg-primary w-8' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PAGE 1: Weight Goals & Nutrition Optimization */}
            {currentPage === 1 && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Weight Goals & Nutrition Optimization
                    </h2>
                    {/* ── Metric / Imperial Toggle ── */}
                    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          unitSystem === 'metric'
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Metric
                      </button>
                      <button
                        type="button"
                        onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          unitSystem === 'imperial'
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Imperial
                      </button>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Help us calculate your optimal nutrition targets based on your body metrics and goals
                  </p>

                  {/* ── Body Metrics ── */}
                  {unitSystem === 'metric' ? (
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
                  ) : (
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <Input
                        label="Current Weight (lbs)"
                        type="number"
                        value={imperialWeight.lbs}
                        onChange={(e) => setImperialWeight({ lbs: Number(e.target.value) })}
                        min="66"
                        max="660"
                        step="0.1"
                      />
                      <Input
                        label="Height (ft)"
                        type="number"
                        value={imperialHeight.ft}
                        onChange={(e) => setImperialHeight(prev => ({ ...prev, ft: Number(e.target.value) }))}
                        min="3"
                        max="8"
                      />
                      <Input
                        label="Height (in)"
                        type="number"
                        value={imperialHeight.inches}
                        onChange={(e) => setImperialHeight(prev => ({ ...prev, inches: Number(e.target.value) }))}
                        min="0"
                        max="11"
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
                  )}

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

                  {unitSystem === 'metric' ? (
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
                  ) : (
                    <Input
                      label="Target Weight (lbs)"
                      type="number"
                      value={imperialTargetWeight.lbs}
                      onChange={(e) => setImperialTargetWeight({ lbs: Number(e.target.value) })}
                      min="66"
                      max="660"
                      step="0.1"
                    />
                  )}

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

                  {nutritionSummary && (
                    <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-lg">
                      <h3 className="font-semibold text-success mb-3">Your Optimal Nutrition Targets</h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-card p-3 rounded border border-success/30">
                          <p className="text-sm text-muted-foreground">Daily Calories</p>
                          <p className="text-2xl font-bold text-success">{nutritionSummary.targets.dailyCalories}</p>
                          <p className="text-xs text-muted-foreground mt-1">kcal/day</p>
                        </div>
                        <div className="bg-card p-3 rounded border border-success/30">
                          <p className="text-sm text-muted-foreground">Daily Protein</p>
                          <p className="text-2xl font-bold text-success">{nutritionSummary.targets.proteinG}</p>
                          <p className="text-xs text-muted-foreground mt-1">grams/day</p>
                        </div>
                        <div className="bg-card p-3 rounded border border-success/30">
                          <p className="text-sm text-muted-foreground">Carbs</p>
                          <p className="text-2xl font-bold text-success">{nutritionSummary.targets.carbsG}</p>
                          <p className="text-xs text-muted-foreground mt-1">grams/day</p>
                        </div>
                        <div className="bg-card p-3 rounded border border-success/30">
                          <p className="text-sm text-muted-foreground">Fat</p>
                          <p className="text-2xl font-bold text-success">{nutritionSummary.targets.fatG}</p>
                          <p className="text-xs text-muted-foreground mt-1">grams/day</p>
                        </div>
                      </div>

                      <div className="bg-card p-3 rounded border border-success/30">
                        <p className="text-sm text-muted-foreground mb-2">Your Profile</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                          <p><span className="font-semibold">BMI:</span> {nutritionSummary.bmi}</p>
                          <p><span className="font-semibold">BMR:</span> {nutritionSummary.bmr} cal</p>
                          <p><span className="font-semibold">TDEE:</span> {nutritionSummary.tdee} cal</p>
                          {nutritionSummary.targets.estimatedWeeksToGoal && (
                            <p><span className="font-semibold">Timeline:</span> ~{nutritionSummary.targets.estimatedWeeksToGoal} weeks</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-success/10 rounded">
                        <p className="text-sm text-foreground"><strong>Recommendation:</strong> {nutritionSummary.recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Nutrition Targets
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
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
              </>
            )}

            {/* PAGE 2: Diet Types & Allergens */}
            {currentPage === 2 && (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Diet Types (Select All That Apply)
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">
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
                        <label key={diet.value} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleDietToggle(diet.value)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-foreground text-sm">{diet.label}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Dietary Restrictions</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="halalEnabled"
                          checked={formData.halalEnabled}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">🕌 Halal only - Islamic dietary guidelines</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="vegetarianEnabled"
                          checked={formData.vegetarianEnabled}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">🥦 Vegetarian - No meat or fish</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="veganEnabled"
                          checked={formData.veganEnabled}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">🌿 Vegan - No animal products</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Allergens & Ingredients to Avoid
                  </h2>

                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-foreground mb-3">Common Allergens</h3>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {['🥜 Peanuts', '🦐 Shellfish', '🥛 Dairy', '🥚 Eggs', '🌰 Tree Nuts', '🐟 Fish', '🌾 Wheat', '🥄 Sesame'].map((allergen) => {
                        const allergenValue = allergen.split(' ').slice(1).join(' ');
                        return (
                          <label key={allergen} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.commonAllergens.includes(allergenValue)}
                              onChange={() => handleAllergenToggle(allergenValue)}
                              className="w-5 h-5 rounded border-border text-destructive focus:ring-destructive"
                            />
                            <span className="text-foreground">{allergen}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="text-sm text-muted-foreground mb-2">Add other allergens not listed above</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.allergenCustom}
                        onChange={(e) => setFormData(prev => ({ ...prev, allergenCustom: e.target.value }))}
                        placeholder="e.g., sulfites, histamine"
                        className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive"
                        onKeyDown={(e) => e.key === 'Enter' && addCustomAllergen()}
                      />
                      <button
                        type="button"
                        onClick={addCustomAllergen}
                        className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition"
                      >
                        Add
                      </button>
                    </div>
                    {formData.commonAllergens.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.commonAllergens.map((allergen, idx) => (
                          <span key={idx} className="bg-destructive/20 text-destructive px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {allergen}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.commonAllergens.filter((_, i) => i !== idx);
                                setFormData(prev => ({ ...prev, commonAllergens: updated }));
                              }}
                              className="hover:text-destructive/70 font-bold"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-foreground mb-3">Common Foods to Avoid</h3>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {['🦬 Beef', '🐔 Chicken', '🐷 Pork', '🧅 Onion', '🧄 Garlic', '🌶️ Spicy Foods', '🫘 Beans', '🦑 Squid', '🍄 Mushrooms', '🥦 Bitter Gourd', '🫒 Olive Oil', '🍅 Tomato'].map((dislike) => {
                        const dislikeValue = dislike.split(' ').slice(1).join(' ');
                        return (
                          <label key={dislike} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.commonDislikes.includes(dislikeValue)}
                              onChange={() => handleDislikeToggle(dislikeValue)}
                              className="w-5 h-5 rounded border-border text-warning focus:ring-warning"
                            />
                            <span className="text-foreground">{dislike}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
                    <p className="text-sm text-muted-foreground mb-2">Add other foods you dislike</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.dislikesCustom}
                        onChange={(e) => setFormData(prev => ({ ...prev, dislikesCustom: e.target.value }))}
                        placeholder="e.g., liver, durian"
                        className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-warning"
                        onKeyDown={(e) => e.key === 'Enter' && addCustomDislike()}
                      />
                      <button
                        type="button"
                        onClick={addCustomDislike}
                        className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition"
                      >
                        Add
                      </button>
                    </div>
                    {formData.commonDislikes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.commonDislikes.map((dislike, idx) => (
                          <span key={idx} className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {dislike}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.commonDislikes.filter((_, i) => i !== idx);
                                setFormData(prev => ({ ...prev, commonDislikes: updated }));
                              }}
                              className="hover:text-warning/70 font-bold"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PAGE 3: Preferences & Location */}
            {currentPage === 3 && (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Preferences
                  </h2>

                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-foreground mb-3">Cuisines (Select Your Preferences)</h3>
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      {['🇰🇭 Cambodian', '🇹🇭 Thai', '🇻🇳 Vietnamese', '🇺🇸 American', '🇮🇹 Italian', '🇲🇽 Mexican', '🇯🇵 Japanese', '🇨🇳 Chinese', '🇮🇳 Indian', '🇬🇧 British', '🇪🇸 Spanish', '🇫🇷 French', '🇰🇷 Korean', '🇵🇭 Filipino', '🇲🇾 Malaysian', '🇹🇼 Taiwanese', '🇬🇷 Greek', '🇹🇷 Turkish', '🇧🇷 Brazilian', '🇲🇦 Moroccan'].map((cuisine) => {
                        const cuisineValue = cuisine.split(' ').slice(1).join(' ');
                        return (
                          <label key={cuisine} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.cuisinesList.includes(cuisineValue)}
                              onChange={() => handleCuisineToggle(cuisineValue)}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-foreground text-sm">{cuisine}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <p className="text-sm text-muted-foreground mb-2">Add other cuisines not listed above</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.customCuisineInput}
                          onChange={(e) => setFormData(prev => ({ ...prev, customCuisineInput: e.target.value }))}
                          placeholder="e.g., Lebanese, Vietnamese"
                          className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => e.key === 'Enter' && addCustomCuisine()}
                        />
                        <button
                          type="button"
                          onClick={addCustomCuisine}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                        >
                          Add
                        </button>
                      </div>
                      {formData.cuisinesList.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.cuisinesList.map((cuisine, idx) => (
                            <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                              {cuisine}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.cuisinesList.filter((_, i) => i !== idx);
                                  setFormData(prev => ({ ...prev, cuisinesList: updated }));
                                }}
                                className="hover:text-primary/70 font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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

                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-3">Cooking Equipment (Select What You Have)</h3>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {['🔥 Stovetop', '⏲️ Rice Cooker', '🥘 Wok', '🍳 Frying Pan', '🍲 Pot', '🔪 Cutting Board', '🥄 Spoon', '🔨 Mortar & Pestle', '🌡️ Oven', '⚡ Blender', '🧊 Microwave', '✂️ Kitchen Scissors', '🥣 Mixing Bowl', '🫖 Steamer', '📍 Knife Set'].map((equip) => {
                        const equipValue = equip.split(' ').slice(1).join(' ');
                        return (
                          <label key={equip} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.equipmentList.includes(equipValue)}
                              onChange={() => handleEquipmentToggle(equipValue)}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-foreground text-sm">{equip}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <p className="text-sm text-muted-foreground mb-2">Add other equipment you have</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.equipmentCustom}
                          onChange={(e) => setFormData(prev => ({ ...prev, equipmentCustom: e.target.value }))}
                          placeholder="e.g., pressure cooker, air fryer"
                          className="flex-1 px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => e.key === 'Enter' && addCustomEquipment()}
                        />
                        <button
                          type="button"
                          onClick={addCustomEquipment}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                        >
                          Add
                        </button>
                      </div>
                      {formData.equipmentList.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.equipmentList.map((equip, idx) => (
                            <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                              {equip}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.equipmentList.filter((_, i) => i !== idx);
                                  setFormData(prev => ({ ...prev, equipmentList: updated }));
                                }}
                                className="hover:text-primary/70 font-bold"
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

                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
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

                {/* ── Display Preferences ── */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Display Preferences
                  </h2>
                  <div className="p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">&#x1F525; Show Calorie Information</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Display calorie counts on recipe cards and meal planner
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-muted rounded-full p-1 ml-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, showCalories: true }))}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            formData.showCalories
                              ? 'bg-primary text-primary-foreground shadow'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Show
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, showCalories: false }))}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            !formData.showCalories
                              ? 'bg-primary text-primary-foreground shadow'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Hide
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between pt-6 border-t border-border">
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ← Back
                  </Button>
                )}
                {currentPage === 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div>
                {currentPage < 3 && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next →
                  </Button>
                )}
                {currentPage === 3 && (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save & Continue'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
      </div>
    </div>
  );
}
