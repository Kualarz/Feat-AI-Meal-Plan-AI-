'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { getNutritionSummary } from '@/lib/nutrition';

const STORAGE_KEY = 'setupData';

function StepHeader({ step, total, title, desc }: { step: number; total: number; title: string; desc: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${i < step ? 'bg-primary w-8' : i === step - 1 ? 'bg-primary w-8' : 'bg-muted w-3'}`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-1">Step {step} of {total}</p>
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

export default function SetupBodyPage() {
  const router = useRouter();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [imperialWeight, setImperialWeight] = useState({ lbs: 154 });
  const [imperialTargetWeight, setImperialTargetWeight] = useState({ lbs: 154 });
  const [imperialHeight, setImperialHeight] = useState({ ft: 5, inches: 7 });
  const [calculating, setCalculating] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);

  const [data, setData] = useState({
    caloriesTarget: 2000,
    proteinTarget: 120,
    currentWeight: 70,
    targetWeight: 70,
    height: 170,
    age: 30,
    weightGoal: 'maintain',
    activityLevel: 'moderate',
  });

  const kgToLbs = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
  const lbsToKg = (lbs: number) => Math.round((lbs / 2.20462) * 10) / 10;
  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    return { ft: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
  };
  const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * 2.54);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  const toggleUnit = () => {
    if (unitSystem === 'metric') {
      setImperialWeight({ lbs: kgToLbs(data.currentWeight) });
      setImperialTargetWeight({ lbs: kgToLbs(data.targetWeight) });
      setImperialHeight(cmToFtIn(data.height));
      setUnitSystem('imperial');
    } else {
      setData(prev => ({
        ...prev,
        currentWeight: lbsToKg(imperialWeight.lbs),
        targetWeight: lbsToKg(imperialTargetWeight.lbs),
        height: ftInToCm(imperialHeight.ft, imperialHeight.inches),
      }));
      setUnitSystem('metric');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = (e: React.MouseEvent) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const weightKg = unitSystem === 'imperial' ? lbsToKg(imperialWeight.lbs) : Number(data.currentWeight);
      const heightCm = unitSystem === 'imperial' ? ftInToCm(imperialHeight.ft, imperialHeight.inches) : Number(data.height);
      const targetWeightKg = unitSystem === 'imperial' ? lbsToKg(imperialTargetWeight.lbs) : Number(data.targetWeight);

      if (!weightKg || !heightCm || !data.age || !data.weightGoal || !data.activityLevel) {
        alert('Please fill in all fields first');
        return;
      }

      if (unitSystem === 'imperial') {
        setData(prev => ({ ...prev, currentWeight: weightKg, height: heightCm, targetWeight: targetWeightKg }));
      }

      const summary = getNutritionSummary({
        currentWeight: weightKg,
        height: heightCm,
        age: Number(data.age),
        weightGoal: data.weightGoal as 'maintain' | 'lose' | 'gain' | 'bulk',
        activityLevel: data.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
        targetWeight: targetWeightKg || undefined,
      });

      setData(prev => ({ ...prev, caloriesTarget: summary.targets.dailyCalories, proteinTarget: summary.targets.proteinG }));
      setNutritionSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleNext = () => {
    const weightKg = unitSystem === 'imperial' ? lbsToKg(imperialWeight.lbs) : Number(data.currentWeight);
    const heightCm = unitSystem === 'imperial' ? ftInToCm(imperialHeight.ft, imperialHeight.inches) : Number(data.height);
    const targetWeightKg = unitSystem === 'imperial' ? lbsToKg(imperialTargetWeight.lbs) : Number(data.targetWeight);

    const existing = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...existing,
      ...data,
      currentWeight: weightKg,
      height: heightCm,
      targetWeight: targetWeightKg,
    }));
    router.push('/setup/diet');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <StepHeader step={1} total={5} title="Weight Goals & Nutrition Optimization" desc="Help us calculate your optimal daily targets" />

        <Card>
          <div className="space-y-6">
            {/* Unit toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Body Metrics</h2>
              <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                {(['metric', 'imperial'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => unitSystem !== u && toggleUnit()}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                      unitSystem === u ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {unitSystem === 'metric' ? (
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Current Weight (kg)" type="number" name="currentWeight" value={data.currentWeight} onChange={handleChange} min="30" max="300" step="0.1" />
                <Input label="Height (cm)" type="number" name="height" value={data.height} onChange={handleChange} min="100" max="250" step="0.1" />
                <Input label="Age (years)" type="number" name="age" value={data.age} onChange={handleChange} min="13" max="120" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-4 gap-4">
                <Input label="Weight (lbs)" type="number" value={imperialWeight.lbs} onChange={e => setImperialWeight({ lbs: Number(e.target.value) })} min="66" max="660" step="0.1" />
                <Input label="Height (ft)" type="number" value={imperialHeight.ft} onChange={e => setImperialHeight(prev => ({ ...prev, ft: Number(e.target.value) }))} min="3" max="8" />
                <Input label="Height (in)" type="number" value={imperialHeight.inches} onChange={e => setImperialHeight(prev => ({ ...prev, inches: Number(e.target.value) }))} min="0" max="11" />
                <Input label="Age (years)" type="number" name="age" value={data.age} onChange={handleChange} min="13" max="120" />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Activity Level"
                name="activityLevel"
                value={data.activityLevel}
                onChange={handleChange}
                options={[
                  { value: 'sedentary', label: '🪑 Sedentary — little/no exercise' },
                  { value: 'light', label: '🚶 Light — 1-3 days/week' },
                  { value: 'moderate', label: '🏃 Moderate — 3-5 days/week' },
                  { value: 'active', label: '💪 Active — 6-7 days/week' },
                  { value: 'veryActive', label: '⚡ Very Active — intense daily' },
                ]}
              />
              <Select
                label="Weight Goal"
                name="weightGoal"
                value={data.weightGoal}
                onChange={handleChange}
                options={[
                  { value: 'maintain', label: '⚖️ Maintain current weight' },
                  { value: 'lose', label: '📉 Lose weight gradually' },
                  { value: 'gain', label: '📈 Gain weight (lean mass)' },
                  { value: 'bulk', label: '💪 Bulk — build muscle' },
                ]}
              />
            </div>

            {unitSystem === 'metric' ? (
              <Input label="Target Weight (kg)" type="number" name="targetWeight" value={data.targetWeight} onChange={handleChange} min="30" max="300" step="0.1" />
            ) : (
              <Input label="Target Weight (lbs)" type="number" value={imperialTargetWeight.lbs} onChange={e => setImperialTargetWeight({ lbs: Number(e.target.value) })} min="66" max="660" step="0.1" />
            )}

            <Button type="button" variant="primary" onClick={handleCalculate} disabled={calculating} className="w-full">
              {calculating ? 'Calculating...' : '🧮 Calculate Nutrition Targets'}
            </Button>

            {nutritionSummary && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="font-semibold text-green-600 mb-3">Your Optimal Targets</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    { label: 'Calories', value: nutritionSummary.targets.dailyCalories, unit: 'kcal' },
                    { label: 'Protein', value: nutritionSummary.targets.proteinG, unit: 'g' },
                    { label: 'Carbs', value: nutritionSummary.targets.carbsG, unit: 'g' },
                    { label: 'Fat', value: nutritionSummary.targets.fatG, unit: 'g' },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="bg-card p-3 rounded-lg border border-green-500/20 text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold text-green-600">{value}</p>
                      <p className="text-xs text-muted-foreground">{unit}/day</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-foreground"><strong>Tip:</strong> {nutritionSummary.recommendation}</p>
              </div>
            )}

            {/* Manual override */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Nutrition Targets <span className="text-muted-foreground font-normal">(auto-filled above — adjust if needed)</span></p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Daily Calories" type="number" name="caloriesTarget" value={data.caloriesTarget} onChange={handleChange} min="1000" max="5000" />
                <Input label="Daily Protein (g)" type="number" name="proteinTarget" value={data.proteinTarget} onChange={handleChange} min="50" max="300" />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => router.push('/setup')}>← Back</Button>
              <Button type="button" variant="primary" onClick={handleNext}>Next →</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
