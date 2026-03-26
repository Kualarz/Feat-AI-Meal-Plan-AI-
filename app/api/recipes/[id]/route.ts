import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Cookware data keyed by sample recipe ID
const cookwareMap: Record<string, string[]> = {
  'kh-1': ['Wok or large pan', 'Cutting board', 'Sharp knife', 'Spatula'],
  'kh-2': ['Large pot', 'Mortar and pestle', 'Saucepan', 'Strainer', 'Serving bowls'],
  'kh-3': ['Steamer', 'Mixing bowl', 'Whisk', 'Cutting board', 'Sharp knife'],
  'th-1': ['Wok', 'Spatula', 'Large bowl', 'Colander'],
  'th-2': ['Large deep pan', 'Cutting board', 'Sharp knife', 'Wooden spoon'],
  'th-3': ['Large pot', 'Ladle', 'Sharp knife', 'Serving bowls'],
  'vn-1': ['Large stockpot', 'Skimmer', 'Fine mesh strainer', 'Serving bowls', 'Sharp knife'],
  'vn-2': ['Oven or toaster', 'Bread knife', 'Cutting board'],
  'vn-3': ['Large shallow bowl', 'Damp towel', 'Saucepan'],
  'au-1': ['Oven', 'Baking tray', 'Saucepan', 'Small pan', 'Zester'],
  'au-2': ['Oven', 'Baking pan', 'Mixing bowls', 'Electric mixer', 'Wire rack', 'Double boiler'],
  'au-3': ['Oven', 'Large mixing bowl', 'Electric mixer', 'Baking tray', 'Baking paper', 'Spatula'],
  'us-1': ['Grill or skillet', 'Spatula', 'Cutting board', 'Knife'],
  'us-2': ['Oven', 'Large pot', 'Saucepan', 'Whisk', 'Baking dish', 'Cheese grater'],
  'us-3': ['Oven', 'Baking tray', 'Aluminum foil', 'Basting brush', 'Cast iron skillet', 'Mixing bowls'],
  'extra-1': ['Mortar and pestle', 'Serving plate'],
  'extra-2': ['Wok', 'Spatula', 'Large bowl'],
  'extra-3': ['Large pot', 'Cutting board', 'Sharp knife', 'Wooden spoon'],
  'extra-4': ['Oven', 'Baking tray', 'Saucepan', 'Mixing bowl'],
  'extra-5': ['Grill or pan', 'Tongs', 'Small pan', 'Cutting board'],
  'extra-6': ['Large pot', 'Ladle', 'Saucepan', 'Serving bowls'],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First try the database
    const dbRecipe = await db.recipe.findUnique({
      where: { id: params.id },
    });

    if (dbRecipe) {
      return NextResponse.json(dbRecipe);
    }

    // Fall back to sample data from the list endpoint
    const baseUrl = request.nextUrl.origin;
    const listResponse = await fetch(`${baseUrl}/api/recipes`);
    if (listResponse.ok) {
      const recipes = await listResponse.json();
      const found = Array.isArray(recipes)
        ? recipes.find((r: { id: string }) => r.id === params.id)
        : null;

      if (found) {
        // Ensure cookwareJson is present
        if (!found.cookwareJson && cookwareMap[found.id]) {
          found.cookwareJson = JSON.stringify(cookwareMap[found.id]);
        }
        return NextResponse.json(found);
      }
    }

    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}
