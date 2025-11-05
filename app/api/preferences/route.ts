import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getNutritionSummary } from '@/lib/nutrition';

const DEFAULT_USER_ID = 'default-user';

export async function GET() {
  try {
    // Ensure default user exists
    await db.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: {
        id: DEFAULT_USER_ID,
        name: 'Default User',
      },
    });

    const preference = await db.preference.findFirst({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { updatedAt: 'desc' },
    });

    if (!preference) {
      // Return default preferences
      return NextResponse.json({
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
        currentWeight: 70,
        targetWeight: 70,
        weightGoal: 'maintain',
        height: 170,
        age: 30,
        activityLevel: 'moderate',
      });
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ensure default user exists
    await db.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: {
        id: DEFAULT_USER_ID,
        name: 'Default User',
      },
    });

    // Delete old preferences and create new one
    await db.preference.deleteMany({
      where: { userId: DEFAULT_USER_ID },
    });

    // Calculate optimal nutrition targets if weight goal data is provided
    let caloriesTarget = body.caloriesTarget || 2000;
    let proteinTarget = body.proteinTarget || 120;

    if (
      body.currentWeight &&
      body.height &&
      body.age &&
      body.weightGoal &&
      body.activityLevel
    ) {
      const nutritionSummary = getNutritionSummary({
        currentWeight: body.currentWeight,
        height: body.height,
        age: body.age,
        activityLevel: body.activityLevel,
        weightGoal: body.weightGoal,
        targetWeight: body.targetWeight,
      });

      caloriesTarget = nutritionSummary.targets.dailyCalories;
      proteinTarget = nutritionSummary.targets.proteinG;
    }

    const preference = await db.preference.create({
      data: {
        userId: DEFAULT_USER_ID,
        caloriesTarget,
        proteinTarget,
        diet: body.diet || 'balanced',
        halalEnabled: body.halalEnabled || false,
        vegetarianEnabled: body.vegetarianEnabled || false,
        veganEnabled: body.veganEnabled || false,
        allergens: body.allergens || '',
        dislikes: body.dislikes || '',
        cuisines: body.cuisines || 'Cambodian,Thai,Vietnamese',
        timeBudgetMins: body.timeBudgetMins || 40,
        budgetLevel: body.budgetLevel || 'medium',
        equipment: body.equipment || 'stovetop,rice cooker',
        region: body.region || 'KH',
        currency: body.currency || 'KHR',
        currentWeight: body.currentWeight || 70,
        targetWeight: body.targetWeight || 70,
        weightGoal: body.weightGoal || 'maintain',
        height: body.height || 170,
        age: body.age || 30,
        activityLevel: body.activityLevel || 'moderate',
      },
    });

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
