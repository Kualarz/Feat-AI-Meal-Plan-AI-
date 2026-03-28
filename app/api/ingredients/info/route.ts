import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing ingredient name' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: 'You are a culinary ingredient expert. Return ONLY valid JSON, no markdown, no explanations.',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 400,
      } as any,
    });

    const result = await model.generateContent(
      `Give me a quick reference card for the ingredient: "${name}".
Return JSON matching exactly this schema:
{
  "storage_tips": "string — 1-2 sentences on how to store it",
  "shelf_life": "string — e.g. '3-5 days refrigerated'",
  "substitutes": ["string", "string"],
  "nutrition_note": "string — one interesting nutrition fact",
  "fun_fact": "string — one interesting culinary or cultural fact"
}`
    );

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ingredient info error:', error);
    return NextResponse.json({ error: 'Failed to get ingredient info' }, { status: 500 });
  }
}
