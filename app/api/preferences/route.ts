import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getNutritionSummary } from '@/lib/nutrition';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = requireAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const preference = await db.preference.findFirst({
      where: { userId: user.userId },
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
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch preferences');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = requireAuth(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();

    // Delete old preferences and create new one
    await db.preference.deleteMany({
      where: { userId: user.userId },
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
        userId: user.userId,
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
    const { statusCode, response } = handleAPIError(error, 'Failed to save preferences');
    return NextResponse.json(response, { status: statusCode });
  }
}
