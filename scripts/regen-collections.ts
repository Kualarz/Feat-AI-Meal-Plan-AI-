import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function main() {
  console.log('Fetching all recipes...');
  const recipes = await prisma.recipe.findMany({
    select: { id: true, title: true, cuisine: true, tags: true, dietTags: true },
  });

  if (recipes.length === 0) {
    console.log('No recipes found.');
    return;
  }

  const recipeList = recipes
    .map((r) => `${r.id}|${r.title}|${r.cuisine ?? ''}|${[r.tags, r.dietTags].filter(Boolean).join(',')}`)
    .join('\n');

  console.log('Generating curated collections with Gemini...');
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: 'You are a food editor. Return ONLY valid JSON, no markdown, no explanations.',
  });

  const prompt = `Given this recipe library, create 4 themed curated collections.
Each collection must:
- Have a catchy title (2-4 words)
- Have a single emoji
- Have a short witty tagline
- Contain 6 to 10 recipe IDs from the list

Return ONLY valid JSON:
[
  { "title": "string", "emoji": "string", "tagline": "string", "recipeIds": ["id1", "id2"] },
  ...
]

Recipe library:
${recipeList}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log('Gemini response received.');

  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

  console.log('Updating database...');
  await (prisma as any).curatedCollection.deleteMany({});
  await (prisma as any).curatedCollection.createMany({
    data: parsed.map((c: any) => ({
      title: c.title,
      emoji: c.emoji,
      tagline: c.tagline,
      recipeIds: JSON.stringify(c.recipeIds),
    })),
  });

  console.log('Curated collections updated successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
