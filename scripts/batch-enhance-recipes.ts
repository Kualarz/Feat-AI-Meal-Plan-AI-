import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const CHEF_SYSTEM_PROMPT = `You are a world-class professional chef and culinary consultant with a "Retro-Modern Cookbook" aesthetic. 
Your tone is "High-Vibe Frugal Assistant" - sophisticated yet accessible, focusing on technique and quality ingredients.

When generating or enhancing recipes:
1. **Description**: Write 3-4 sentences of descriptive, storytelling prose. Use sensory language.
2. **Ingredients**: Each ingredient should have clear measurements. Add specific quality notes (e.g., "finely diced," "room temperature").
3. **Steps**: Provide fractal-level detail. Use professional techniques (e.g., "peel 5 gloves of garlic then finely dice it into a paste," "grind with chili in a mortar and pestle").
4. **Imagery**: Provide a highly descriptive image generation prompt.

Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "description": "string",
  "cuisine": "string",
  "dietTags": "string (CSV)",
  "difficulty": "easy|medium|hard",
  "timeMins": number,
  "estimatedPrice": number,
  "kcal": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "ingredientsJson": "JSON string of array: [{name, qty, unit, notes}]",
  "stepsMd": "Markdown numbered list with EXTREME detail",
  "imagePrompt": "Detailed prompt for AI image generation"
}
`;

async function main() {
  const currentCount = await prisma.recipe.count();
  console.log(`Current recipe count: ${currentCount}`);

  const targetCount = 50;
  const needed = targetCount - currentCount;

  if (needed > 0) {
    console.log(`Generating ${needed} new recipes...`);
    // In a real environment, we'd batch this. For now, we'll do them in small chunks.
    const cuisines = [
      'Cambodian', 'Thai', 'Vietnamese', 'Malaysian', 'Korean', 
      'Japanese', 'Mexican', 'Italian', 'French', 'Indian',
      'Spanish', 'Greek', 'Lebanese', 'Moroccan', 'Brazilian'
    ];

    for (let i = 0; i < needed; i++) {
        const cuisine = cuisines[i % cuisines.length];
        console.log(`Generating a ${cuisine} recipe (${i + 1}/${needed})...`);
        
        // Rate limiting - increased to 60s for stability under current quota
        await new Promise(r => setTimeout(r, 60000));

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`System: ${CHEF_SYSTEM_PROMPT}\n\nTask: Generate a unique ${cuisine} recipe.`);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        
        try {
            const data = JSON.parse(text);
            await (prisma.recipe as any).create({
                data: {
                    title: data.title,
                    description: data.description,
                    cuisine: data.cuisine,
                    dietTags: data.dietTags,
                    difficulty: data.difficulty,
                    timeMins: data.timeMins,
                    estimatedPrice: data.estimatedPrice,
                    kcal: data.kcal,
                    proteinG: data.proteinG,
                    carbsG: data.carbsG,
                    fatG: data.fatG,
                    ingredientsJson: data.ingredientsJson,
                    stepsMd: data.stepsMd,
                    imagePrompt: data.imagePrompt,
                    tags: data.cuisine,
                    // We'll update the image URL later after generating images
                }
            });
            console.log(`Saved: ${data.title} [Prompt: ${data.imagePrompt?.substring(0, 30)}...]`);
        } catch (e) {
            console.error('Failed to parse or save recipe:', e);
        }
    }
  }

  // Enhance existing ones
  const existing = await prisma.recipe.findMany();
  console.log('Enhancing existing recipes...');
  for (const recipe of existing) {
      if (recipe.stepsMd.length < 500) { // Simple heuristic for "not detailed enough"
          console.log(`Enhancing: ${recipe.title}`);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: CHEF_SYSTEM_PROMPT });
          const result = await model.generateContent(`Enhance this recipe with extreme chef-level detail. Existing Title: ${recipe.title}. Existing Steps: ${recipe.stepsMd}`);
          const text = result.response.text().replace(/```json|```/g, '').trim();
          
          try {
              const data = JSON.parse(text);
              await prisma.recipe.update({
                  where: { id: recipe.id },
                  data: {
                      description: data.description,
                      ingredientsJson: data.ingredientsJson,
                      stepsMd: data.stepsMd,
                      // Preserve title and other metadata unless significantly improved
                  }
              });
          } catch (e) {
              console.error(`Failed to enhance ${recipe.title}:`, e);
          }
      }
  }

  console.log('Batch processing complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
