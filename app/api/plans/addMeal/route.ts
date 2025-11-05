import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, dayISO, slot } = body;

    // Validate inputs
    if (!recipeId || !dayISO || !slot) {
      return NextResponse.json(
        { error: 'Missing required fields: recipeId, dayISO, slot' },
        { status: 400 }
      );
    }

    // Validate slot value
    const validSlots = ['breakfast', 'lunch', 'dinner', 'dessert'];
    if (!validSlots.includes(slot)) {
      return NextResponse.json(
        { error: `Invalid slot. Must be one of: ${validSlots.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dayISO)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Get or create a plan for the user
    // For now, we'll use a default plan (you can add user auth later)
    let plan = await prisma.plan.findFirst({
      where: {
        // If you have user auth, add: userId: currentUserId
        startDate: {
          lte: new Date(dayISO),
        },
        endDate: {
          gte: new Date(dayISO),
        },
      },
    });

    // If no plan exists for this date, create one (7-day plan starting from this date)
    if (!plan) {
      const startDate = new Date(dayISO);
      const endDate = new Date(dayISO);
      endDate.setDate(endDate.getDate() + 6);

      plan = await prisma.plan.create({
        data: {
          startDate,
          endDate,
          notes: `Plan created on ${new Date().toLocaleDateString()}`,
          // If you have user auth: userId: currentUserId
        },
      });
    }

    // Check if a meal already exists for this day and slot
    const existingMeal = await prisma.planMeal.findFirst({
      where: {
        planId: plan.id,
        dayISO,
        slot,
      },
    });

    // If a meal already exists, replace it
    if (existingMeal) {
      const updated = await prisma.planMeal.update({
        where: { id: existingMeal.id },
        data: { recipeId },
        include: { recipe: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Meal updated in planner',
        planMeal: updated,
      });
    }

    // Create new plan meal entry
    const planMeal = await prisma.planMeal.create({
      data: {
        planId: plan.id,
        recipeId,
        dayISO,
        slot,
      },
      include: {
        recipe: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Meal added to planner',
        planMeal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding meal to planner:', error);
    return NextResponse.json(
      { error: 'Failed to add meal to planner' },
      { status: 500 }
    );
  }
}
