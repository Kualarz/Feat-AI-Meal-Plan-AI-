'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'react-router-dom';
import { 
  ArrowLeft, 
  Scale, 
  Ruler, 
  Target, 
  Activity, 
  Zap, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';

interface ProfileStats {
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  activityLevel: string;
  weightGoal: string;
  useImperial: boolean;
  caloriesTarget?: number;
  proteinTarget?: number;
}

const DEFAULT_STATS: ProfileStats = {
  currentWeight: 70,
  targetWeight: 70,
  height: 170,
  age: 30,
  activityLevel: 'moderate',
  weightGoal: 'maintain',
  useImperial: false,
};

export default function ProfileMeasurementsPage() {
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calculatedTargets, setCalculatedTargets] = useState<{ calories: number; protein: number } | null>(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const loadedStats = {
            currentWeight: data.currentWeight || 70,
            targetWeight: data.targetWeight || 70,
            height: data.height || 170,
            age: data.age || 30,
            activityLevel: data.activityLevel || 'moderate',
            weightGoal: data.weightGoal || 'maintain',
            useImperial: data.useImperial || false,
            caloriesTarget: data.caloriesTarget,
            proteinTarget: data.proteinTarget,
          };
          setStats(loadedStats);
          if (data.caloriesTarget && data.proteinTarget) {
            setCalculatedTargets({ calories: data.caloriesTarget, protein: data.proteinTarget });
          }
        }
      } catch (err) {
        console.error('Failed to fetch preferences', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(stats)
      });
      
      if (res.ok) {
        const data = await res.json();
        setCalculatedTargets({ calories: data.caloriesTarget, protein: data.proteinTarget });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof ProfileStats, value: any) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="motion-safe:animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Settings
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-display text-primary tracking-tight mb-2">Body & Nutrients</h1>
          <p className="text-sm text-muted-foreground font-body italic">
            Optimize your meal plans based on your unique body metrics and energy needs.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* ── Units Selection ────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em]">
                System Preference
              </h3>
              <div className="flex p-1 bg-muted rounded-pill border border-border/50">
                <button
                  type="button"
                  onClick={() => update('useImperial', false)}
                  className={`px-4 py-1 rounded-pill text-[10px] font-display uppercase tracking-widest transition-all ${!stats.useImperial ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => update('useImperial', true)}
                  className={`px-4 py-1 rounded-pill text-[10px] font-display uppercase tracking-widest transition-all ${stats.useImperial ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Imperial
                </button>
              </div>
            </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* ── Measurement Form ───────────────────────────── */}
            <div className="space-y-6">
              <Card className="p-6 rounded-large-card">
                <h4 className="flex items-center gap-2 text-sm font-display text-foreground uppercase tracking-widest mb-6 border-b border-border/50 pb-4">
                  <Scale className="w-4 h-4 text-accent" /> Measurements
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`Weight (${stats.useImperial ? 'lbs' : 'kg'})`}
                    type="number"
                    value={stats.currentWeight}
                    onChange={(e) => update('currentWeight', parseFloat(e.target.value))}
                  />
                  <Input
                    label={`Height (${stats.useImperial ? 'in' : 'cm'})`}
                    type="number"
                    value={stats.height}
                    onChange={(e) => update('height', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Age"
                    type="number"
                    value={stats.age}
                    onChange={(e) => update('age', parseInt(e.target.value))}
                  />
                  <Select
                    label="Goal"
                    value={stats.weightGoal}
                    onChange={(e) => update('weightGoal', e.target.value)}
                    options={[
                      { value: 'maintain', label: 'Maintain' },
                      { value: 'lose', label: 'Lose Weight' },
                      { value: 'gain', label: 'Gain Muscle' },
                      { value: 'bulk', label: 'Bulk Up' },
                    ]}
                  />
                </div>

                {stats.weightGoal !== 'maintain' && (
                  <div className="mt-4">
                    <Input
                      label={`Target Weight (${stats.useImperial ? 'lbs' : 'kg'})`}
                      type="number"
                      value={stats.targetWeight}
                      onChange={(e) => update('targetWeight', parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </Card>

              <Card className="p-6 rounded-large-card">
                <h4 className="flex items-center gap-2 text-sm font-display text-foreground uppercase tracking-widest mb-6 border-b border-border/50 pb-4">
                  <Activity className="w-4 h-4 text-accent" /> Lifestyle
                </h4>
                <Select
                  label="Activity Level"
                  value={stats.activityLevel}
                  onChange={(e) => update('activityLevel', e.target.value)}
                  options={[
                    { value: 'sedentary', label: 'Sedentary — Little to no exercise' },
                    { value: 'light', label: 'Light — 1-3 days/week exercise' },
                    { value: 'moderate', label: 'Moderate — 3-5 days/week exercise' },
                    { value: 'active', label: 'Active — 6-7 days/week exercise' },
                    { value: 'veryActive', label: 'Very Active — Intense daily exercise' },
                  ]}
                />
                <p className="mt-4 text-[10px] text-muted-foreground font-body italic flex items-start gap-1.5 leading-relaxed">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  This helps us estimate your TDEE (Total Daily Energy Expenditure) to calculate accurate meal portions.
                </p>
              </Card>
            </div>

            {/* ── Nutrition Insights ─────────────────────────── */}
            <div className="space-y-6">
              <Card className="p-6 rounded-large-card bg-brand-orange-tint/20 border-accent/20">
                <h4 className="flex items-center gap-2 text-sm font-display text-foreground uppercase tracking-widest mb-6 border-b border-accent/10 pb-4 text-accent">
                  <Zap className="w-4 h-4" /> Optimised Targets
                </h4>

                {calculatedTargets ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-accent/5 pb-4">
                      <div>
                        <p className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">Daily Energy</p>
                        <p className="text-4xl font-display text-accent tracking-tighter">{calculatedTargets.calories}</p>
                      </div>
                      <p className="text-xs font-display text-accent/60 mb-1 tracking-widest">KCAL</p>
                    </div>

                    <div className="flex justify-between items-end border-b border-accent/5 pb-4">
                      <div>
                        <p className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">Daily Protein</p>
                        <p className="text-4xl font-display text-accent tracking-tighter">{calculatedTargets.protein}</p>
                      </div>
                      <p className="text-xs font-display text-accent/60 mb-1 tracking-widest">GRAMS</p>
                    </div>

                    <div className="p-3 bg-white/50 rounded-xl border border-accent/5">
                      <p className="text-[10px] text-accent font-display uppercase tracking-widest leading-relaxed">
                        These targets are recalculated automatically based on your Mifflin-St Jeor metabolic profile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Target className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                    <p className="text-xs text-muted-foreground font-body italic">
                      Save your measurements to generate personalized nutrition targets.
                    </p>
                  </div>
                )}
              </Card>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full rounded-pill py-6 font-display uppercase tracking-widest shadow-lg shadow-accent/20 group"
                >
                  {saving ? (
                    'SavingStats...'
                  ) : success ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved Successfully</span>
                  ) : (
                    'Update & Recalculate'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
