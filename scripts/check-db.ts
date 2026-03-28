import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await (prisma.recipe as any).count();
  console.log(`Total recipes in DB: ${count}`);
  const titles = await (prisma.recipe as any).findMany({ select: { title: true } });
  console.log('All titles:', titles.map((r: any) => r.title));
}
main().finally(() => prisma.$disconnect());
