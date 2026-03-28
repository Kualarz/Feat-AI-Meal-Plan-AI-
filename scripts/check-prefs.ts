import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const prefs = await (prisma as any).preference.findMany();
  console.log('User Preferences:', JSON.stringify(prefs, null, 2));
}
main().finally(() => prisma.$disconnect());
