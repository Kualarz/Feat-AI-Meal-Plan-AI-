import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_USER_ID = 'default-user';

export async function GET() {
  try {
    const plan = await db.plan.findFirst({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        meals: {
          include: {
            recipe: true,
          },
          orderBy: { dateISO: 'asc' },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching latest plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest plan' },
      { status: 500 }
    );
  }
}
