import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { aggregateIngredients } from '@/lib/groceries';
import { ErrorMessages, createErrorResponse, handleAPIError } from '@/lib/api-errors';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    // Validate planId parameter
    if (!planId) {
      return NextResponse.json(
        createErrorResponse(400, ErrorMessages.GROCERY_PLAN_REQUIRED),
        { status: 400 }
      );
    }

    // Fetch the plan with all meals and recipes
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
    });

    // Handle plan not found
    if (!plan) {
      return NextResponse.json(
        createErrorResponse(404, ErrorMessages.PLAN_NOT_FOUND),
        { status: 404 }
      );
    }

    // Filter out meals without recipes
    const mealsWithRecipes = plan.meals.filter((meal) => meal.recipe);

    // Return empty groceries list if no meals have recipes
    if (mealsWithRecipes.length === 0) {
      console.log(`[Groceries] No meals with recipes found for plan ${planId}`);
      return NextResponse.json(
        {
          success: true,
          planId,
          planDates: {
            weekStart: plan.weekStart.toISOString(),
            weekEnd: plan.weekEnd.toISOString(),
          },
          ingredients: [],
          totalMeals: 0,
          message: 'No recipes added to this meal plan yet',
        },
        { status: 200 }
      );
    }

    // Aggregate ingredients
    const aggregated = aggregateIngredients(
      mealsWithRecipes.map((meal) => ({
        recipe: meal.recipe!,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        planId,
        planDates: {
          weekStart: plan.weekStart.toISOString(),
          weekEnd: plan.weekEnd.toISOString(),
        },
        ingredients: aggregated,
        totalMeals: mealsWithRecipes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, response } = handleAPIError(
      error,
      'Failed to fetch groceries'
    );

    return NextResponse.json(response, { status: statusCode });
  }
}
