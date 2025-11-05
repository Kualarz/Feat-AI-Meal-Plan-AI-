import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { aggregateIngredients } from '@/lib/groceries';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
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

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Filter out meals without recipes
    const mealsWithRecipes = plan.meals.filter((meal) => meal.recipe);

    if (mealsWithRecipes.length === 0) {
      return NextResponse.json(
        {
          success: true,
          planId,
          planDates: {
            weekStart: plan.weekStart,
            weekEnd: plan.weekEnd,
          },
          ingredients: [],
          totalMeals: 0,
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
          weekStart: plan.weekStart,
          weekEnd: plan.weekEnd,
        },
        ingredients: aggregated,
        totalMeals: mealsWithRecipes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching groceries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groceries' },
      { status: 500 }
    );
  }
}
