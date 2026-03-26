import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleAPIError } from '@/lib/api-errors';
import { extractRecipeFromVideo } from '@/lib/gemini';

function detectPlatform(url: string): 'tiktok' | 'instagram' | 'facebook' | 'unknown' {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) return 'facebook';
  return 'unknown';
}

async function fetchVideoMetadata(url: string): Promise<{ title: string; description: string; imageUrl: string | null }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                    html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"/);
    const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/) ||
                   html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"/);
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ||
                    html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);
    return {
      title: ogTitle?.[1] || '',
      description: ogDesc?.[1] || '',
      imageUrl: ogImage?.[1] || null,
    };
  } catch {
    return { title: '', description: '', imageUrl: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, currency = 'USD' } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      return NextResponse.json(
        { error: 'Only TikTok, Instagram, and Facebook URLs are supported' },
        { status: 400 }
      );
    }

    const metadata = await fetchVideoMetadata(url);
    const recipeData = await generateRecipeFromVideo(url, platform, metadata, currency);

    const recipe = await db.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description || '',
        cuisine: recipeData.cuisine || 'International',
        dietTags: recipeData.dietTags || '',
        difficulty: recipeData.difficulty || 'medium',
        timeMins: recipeData.timeMins || null,
        estimatedPrice: recipeData.estimatedPrice || null,
        currency: recipeData.currency || currency,
        kcal: recipeData.kcal || null,
        proteinG: recipeData.proteinG || null,
        carbsG: recipeData.carbsG || null,
        fatG: recipeData.fatG || null,
        fiberG: recipeData.fiberG || null,
        sugarG: recipeData.sugarG || null,
        sodiumMg: recipeData.sodiumMg || null,
        ingredientsJson: JSON.stringify(recipeData.ingredients || []),
        stepsMd: recipeData.steps || '',
        safetyMd: recipeData.safety || 'Follow standard food safety practices.',
        imageUrl: metadata.imageUrl || null,
        sourceUrl: url,
        cookwareJson: JSON.stringify(recipeData.cookware || []),
        tags: `${recipeData.tags || ''},${platform}-import,ai-generated`,
      },
    });

    return NextResponse.json({ recipe, success: true });
  } catch (error) {
    const { statusCode, response } = handleAPIError(error, 'Failed to import video recipe');
    return NextResponse.json(response, { status: statusCode });
  }
}
