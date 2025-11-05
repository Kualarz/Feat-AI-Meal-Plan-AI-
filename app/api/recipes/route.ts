import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const diet = searchParams.get('diet') || '';
    const maxTime = searchParams.get('maxTime');
    const maxPrice = searchParams.get('maxPrice');
    const tags = searchParams.get('tags') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (cuisine) {
      where.cuisine = { contains: cuisine, mode: 'insensitive' };
    }

    if (diet) {
      where.dietTags = { contains: diet, mode: 'insensitive' };
    }

    if (maxTime) {
      where.timeMins = { lte: parseInt(maxTime) };
    }

    if (maxPrice) {
      where.estimatedPrice = { lte: parseFloat(maxPrice) };
    }

    if (tags) {
      where.tags = { contains: tags, mode: 'insensitive' };
    }

    const [recipes, total] = await Promise.all([
      db.recipe.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          cuisine: true,
          dietTags: true,
          difficulty: true,
          timeMins: true,
          estimatedPrice: true,
          currency: true,
          kcal: true,
          proteinG: true,
          imageUrl: true,
          tags: true,
        },
      }),
      db.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}
