/**
 * Nutrition calculation service
 * Calculates optimal daily nutrition targets based on body metrics and goals
 */

export interface NutritionProfile {
  currentWeight: number; // kg
  height: number; // cm
  age: number;
  gender?: 'male' | 'female'; // default to 'male' for neutral calculation
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  weightGoal: 'maintain' | 'lose' | 'gain' | 'bulk';
  targetWeight?: number; // kg
}

export interface NutritionTargets {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  weeklyCalorieDeficit?: number; // for weight loss
  estimatedWeeksToGoal?: number;
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<
  'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive',
  number
> = {
  sedentary: 1.2, // Little or no exercise
  light: 1.375, // 1-3 days/week exercise
  moderate: 1.55, // 3-5 days/week exercise
  active: 1.725, // 6-7 days/week exercise
  veryActive: 1.9, // Intense exercise daily
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * This is more accurate than Harris-Benedict
 */
function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: 'male' | 'female' = 'male'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Calculate BMI for reference
 */
function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Calculate optimal nutrition targets based on profile and goals
 */
export function calculateNutritionTargets(
  profile: NutritionProfile
): NutritionTargets {
  const {
    currentWeight,
    height,
    age,
    gender = 'male',
    activityLevel,
    weightGoal,
    targetWeight,
  } = profile;

  // Calculate baseline TDEE
  const bmr = calculateBMR(currentWeight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  let dailyCalories = tdee;
  let proteinPercentage = 0.3; // 30% for maintain
  let weeklyCalorieDeficit = 0;
  let estimatedWeeksToGoal = undefined;

  switch (weightGoal) {
    case 'lose': {
      // 500 cal deficit per day = ~0.5 kg per week
      dailyCalories = tdee - 500;
      proteinPercentage = 0.35; // Higher protein to preserve muscle
      weeklyCalorieDeficit = 3500; // 500 cal/day * 7 days

      if (targetWeight && targetWeight < currentWeight) {
        const weightToLose = currentWeight - targetWeight;
        estimatedWeeksToGoal = Math.round((weightToLose * 7700) / (500 * 7)); // 7700 cal per kg
      }
      break;
    }

    case 'gain': {
      // 300 cal surplus per day = ~0.3 kg per week
      dailyCalories = tdee + 300;
      proteinPercentage = 0.32; // Slightly higher protein for lean gain
      break;
    }

    case 'bulk': {
      // 500 cal surplus per day = ~0.5 kg per week (lean mass focus)
      dailyCalories = tdee + 500;
      proteinPercentage = 0.35; // High protein for muscle building
      break;
    }

    case 'maintain':
    default: {
      dailyCalories = tdee;
      proteinPercentage = 0.3; // Moderate protein for maintenance
    }
  }

  // Ensure minimum calories
  dailyCalories = Math.max(dailyCalories, 1200);

  // Calculate macronutrients
  const proteinCalories = dailyCalories * proteinPercentage;
  const proteinG = proteinCalories / 4; // 4 cal per gram

  // Fat: 25-30% of calories
  const fatPercentage = 0.25;
  const fatCalories = dailyCalories * fatPercentage;
  const fatG = fatCalories / 9; // 9 cal per gram

  // Carbs: remainder
  const carbsCalories = dailyCalories - proteinCalories - fatCalories;
  const carbsG = carbsCalories / 4; // 4 cal per gram

  return {
    dailyCalories: Math.round(dailyCalories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    weeklyCalorieDeficit: weeklyCalorieDeficit || undefined,
    estimatedWeeksToGoal,
  };
}

/**
 * Get a nutritional summary with recommendations
 */
export function getNutritionSummary(
  profile: NutritionProfile
): {
  targets: NutritionTargets;
  bmi: number;
  bmr: number;
  tdee: number;
  recommendation: string;
} {
  const targets = calculateNutritionTargets(profile);
  const bmr = calculateBMR(
    profile.currentWeight,
    profile.height,
    profile.age,
    profile.gender
  );
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const bmi = calculateBMI(profile.currentWeight, profile.height);

  let recommendation = '';
  if (profile.weightGoal === 'lose') {
    const deficit = profile.targetWeight
      ? Math.round((profile.currentWeight - profile.targetWeight) * 7700 / 7)
      : 3500;
    recommendation = `Aim for a calorie deficit of 500 cal/day (${deficit} cal/week) to reach your target weight.`;
  } else if (profile.weightGoal === 'gain') {
    recommendation =
      'Consume a 300 calorie surplus daily to support lean weight gain with adequate protein.';
  } else if (profile.weightGoal === 'bulk') {
    recommendation =
      'Consume a 500 calorie surplus daily with high protein intake to maximize muscle gain.';
  } else {
    recommendation =
      'Maintain your current calorie intake while focusing on nutrient-dense foods.';
  }

  return {
    targets,
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommendation,
  };
}
