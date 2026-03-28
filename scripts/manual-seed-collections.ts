import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching recipe IDs...');
  const recipes = await prisma.recipe.findMany({
    select: { id: true, title: true }
  });

  const findId = (title: string) => recipes.find(r => r.title.includes(title))?.id;

  const collections = [
    {
      title: "Global Food Tour",
      emoji: "🌍",
      tagline: "A culinary journey across continents in one click.",
      recipeIds: [
        findId("Miso Ramen"),
        findId("Chicken Tikka Masala"),
        findId("Tacos al Pastor"),
        findId("Paella Valenciana"),
        findId("Bibimbap"),
        findId("Feijoada")
      ].filter(Boolean)
    },
    {
      title: "Chef's Classics",
      emoji: "👨‍🍳",
      tagline: "Timeless recipes every home cook should master.",
      recipeIds: [
        findId("Coq au Vin"),
        findId("Spaghetti Carbonara"),
        findId("Beef Lasagna"),
        findId("Ratatouille"),
        findId("Palak Paneer"),
        findId("Moussaka")
      ].filter(Boolean)
    },
    {
      title: "Street Food Vibes",
      emoji: "🌯",
      tagline: "Bold flavors from the world's best food stalls.",
      recipeIds: [
        findId("Shawarma Wrap"),
        findId("Dim Sum: Siu Mai"),
        findId("Okonomiyaki"),
        findId("Tacos al Pastor"),
        findId("Banh Mi"),
        findId("Kung Pao Chicken")
      ].filter(Boolean)
    }
  ];

  console.log('Seeding manually created collections...');
  await (prisma as any).curatedCollection.deleteMany({});
  await (prisma as any).curatedCollection.createMany({
    data: collections.map(c => ({
      title: c.title,
      emoji: c.emoji,
      tagline: c.tagline,
      recipeIds: JSON.stringify(c.recipeIds),
    }))
  });

  console.log('Manual collections seeded!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
