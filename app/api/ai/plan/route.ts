import { NextRequest, NextResponse } from 'next/server';
import { generateMealPlan, ProfileInput, DateRange } from '@/lib/ai';
import { db } from '@/lib/db';

const DEFAULT_USER_ID = 'default-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, range } = body as {
      profile: ProfileInput;
      range: DateRange;
    };

    if (!profile || !range) {
      return NextResponse.json(
        { error: 'Missing profile or range' },
        { status: 400 }
      );
    }

    // Generate meal plan using AI
    console.log('Generating meal plan with AI...');
    const mealPlanJson = await generateMealPlan(profile, range);

    // Ensure default user exists (with required password field)
    await db.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: {
        id: DEFAULT_USER_ID,
        name: profile.name || 'Default User',
        email: 'default@feastai.local',
        password: 'default-user-password-not-for-auth',
      } as any,
    });

    // Save plan to database
    const plan = await db.plan.create({
      data: {
        userId: DEFAULT_USER_ID,
        weekStart: new Date(range.startISO),
        weekEnd: new Date(range.endISO),
      },
    });

    // Save each meal and recipe
    for (const day of mealPlanJson.days) {
      const slots = ['breakfast', 'lunch', 'dinner', 'dessert'] as const;

      for (const slot of slots) {
        const meal = day[slot];
        if (!meal) continue;

        // Create recipe
        const recipe = await db.recipe.create({
          data: {
            title: meal.title,
            description: meal.why,
            cuisine: profile.cuisines.split(',')[0] || 'Southeast Asian',
            dietTags: [
              profile.vegetarian ? 'vegetarian' : '',
              profile.vegan ? 'vegan' : '',
              profile.halal ? 'halal' : '',
            ]
              .filter(Boolean)
              .join(','),
            difficulty: 'medium',
            timeMins: meal.time_mins,
            estimatedPrice: meal.estimated_price,
            currency: meal.currency,
            kcal: meal.macros.kcal,
            proteinG: meal.macros.protein,
            carbsG: meal.macros.carbs,
            fatG: meal.macros.fat,
            ingredientsJson: JSON.stringify(meal.ingredients),
            stepsMd: meal.steps,
            safetyMd: 'Always wash hands before cooking. Cook proteins to safe temperatures. Refrigerate leftovers within 2 hours.',
            imageUrl: meal.image_url || null,
            tags: slot,
          },
        });

        // Create plan meal
        await db.planMeal.create({
          data: {
            planId: plan.id,
            dateISO: day.date,
            slot,
            recipeId: recipe.id,
            notes: meal.why,
          },
        });
      }
    }

    return NextResponse.json({
      plan,
      mealPlan: mealPlanJson,
      success: true,
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate meal plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
