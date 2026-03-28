import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

import * as fs from 'fs';

async function main() {
    const recipes = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
    for (const data of recipes) {
        const existing = await (prisma.recipe as any).findFirst({ where: { title: data.title } });
        const recipeData = {
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
            imageUrl: data.imageUrl,
            cookwareJson: data.cookwareJson,
            tags: data.cuisine,
        };

        if (existing) {
            await (prisma.recipe as any).update({
                where: { id: existing.id },
                data: recipeData
            });
            console.log(`Updated: ${data.title}`);
        } else {
            await (prisma.recipe as any).create({
                data: recipeData
            });
            console.log(`Created: ${data.title}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
