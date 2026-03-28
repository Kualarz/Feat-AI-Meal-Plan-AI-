import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

import * as fs from 'fs';

async function main() {
    const mappings = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
    for (const { title, url } of mappings) {
        const recipe = await (prisma.recipe as any).findFirst({ where: { title } });
        if (recipe) {
            await (prisma.recipe as any).update({
                where: { id: recipe.id },
                data: { imageUrl: url }
            });
            console.log(`Updated ${title} with ${url}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
