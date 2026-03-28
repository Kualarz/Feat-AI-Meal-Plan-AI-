import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-middleware';
import { handleAPIError } from '@/lib/api-errors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET /api/curated-collections — return all cached collections with full recipe objects
export async function GET() {
  try {
    const collections = await (db as any).curatedCollection.findMany({
      orderBy: { generatedAt: 'desc' },
    });

    if (collections.length === 0) {
      return NextResponse.json([]);
    }

    // Gather all unique recipe IDs across collections
    const allRecipeIds = Array.from(
      new Set(
        collections.flatMap((c: any) => {
          try { return JSON.parse(c.recipeIds) as string[]; }
          catch { return []; }
        })
      )
    );

    const recipes = await db.recipe.findMany({
      where: { id: { in: allRecipeIds as string[] } },
    });

    const recipeMap = Object.fromEntries(recipes.map((r) => [r.id, r]));

    const result = collections.map((c: any) => {
      const ids: string[] = (() => { try { return JSON.parse(c.recipeIds); } catch { return []; } })();
      return {
        id: c.id,
        title: c.title,
        emoji: c.emoji,
        tagline: c.tagline,
        generatedAt: c.generatedAt,
        recipes: ids.map((id) => recipeMap[id]).filter(Boolean),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to fetch curated collections');
    return NextResponse.json(response, { status: statusCode });
  }
}

// POST /api/curated-collections — generate fresh collections via Gemini, replace existing
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) return createUnauthorizedResponse();

    // Fetch all recipes
    const recipes = await db.recipe.findMany({
      select: { id: true, title: true, cuisine: true, tags: true, dietTags: true },
    });

    if (recipes.length === 0) {
      return NextResponse.json({ error: 'No recipes in library to generate collections from' }, { status: 400 });
    }

    const recipeList = recipes
      .map((r) => `${r.id}|${r.title}|${r.cuisine ?? ''}|${[r.tags, r.dietTags].filter(Boolean).join(',')}`)
      .join('\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: 'You are a food editor. Return ONLY valid JSON, no markdown, no explanations.',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
      } as any,
    });

    const result = await model.generateContent(
      `Given this recipe library, create 3 to 5 themed curated collections.

Each collection must:
- Have a catchy title (2-4 words)
- Have a single emoji that fits the theme
- Have a short witty tagline (max 8 words)
- Contain 4 to 8 recipe IDs from the list

Only use recipe IDs from the list below. Return ONLY valid JSON — no markdown, no explanation.

Format:
[
  { "title": "string", "emoji": "string", "tagline": "string", "recipeIds": ["id1", "id2"] },
  ...
]

Recipe library:
${recipeList}`
    );

    let parsed: { title: string; emoji: string; tagline: string; recipeIds: string[] }[];

    try {
      parsed = JSON.parse(result.response.text());
    } catch {
      return NextResponse.json({ error: 'Gemini returned invalid JSON', raw: result.response.text() }, { status: 500 });
    }

    // Validate all returned recipe IDs exist
    const validIds = new Set(recipes.map((r) => r.id));
    const sanitized = parsed.map((c) => ({
      ...c,
      recipeIds: c.recipeIds.filter((id) => validIds.has(id)),
    })).filter((c) => c.recipeIds.length > 0);

    // Replace all existing curated collections
    await (db as any).curatedCollection.deleteMany({});
    await (db as any).curatedCollection.createMany({
      data: sanitized.map((c) => ({
        title: c.title,
        emoji: c.emoji,
        tagline: c.tagline,
        recipeIds: JSON.stringify(c.recipeIds),
      })),
    });

    return NextResponse.json({ generated: sanitized.length });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to generate curated collections');
    return NextResponse.json(response, { status: statusCode });
  }
}
