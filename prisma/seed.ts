import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RecipeData {
  title: string;
  description: string;
  cuisine: string;
  dietTags: string;
  difficulty: string;
  timeMins: number;
  estimatedPrice: number;
  currency: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  ingredientsJson: string;
  stepsMd: string;
  tags: string;
}

const recipes: { [country: string]: RecipeData[] } = {
  // CAMBODIA (KHR - Cambodian Riel)
  KH: [
    {
      title: 'Lok Lak (Beef Stir-Fry)',
      description:
        'Tender beef stir-fried with fresh vegetables and lime dipping sauce. A traditional Cambodian favorite.',
      cuisine: 'Cambodian',
      dietTags: 'high-protein,gluten-free',
      difficulty: 'medium',
      timeMins: 25,
      estimatedPrice: 35000,
      currency: 'KHR',
      kcal: 420,
      proteinG: 32,
      carbsG: 18,
      fatG: 24,
      fiberG: 3,
      sugarG: 2,
      sodiumMg: 580,
      ingredientsJson: JSON.stringify([
        { name: 'Beef (sirloin)', qty: '400', unit: 'g' },
        { name: 'Tomato', qty: '200', unit: 'g' },
        { name: 'Cucumber', qty: '150', unit: 'g' },
        { name: 'Onion', qty: '100', unit: 'g' },
        { name: 'Lime', qty: '2', unit: 'whole' },
        { name: 'Soy sauce', qty: '3', unit: 'tbsp' },
        { name: 'Oil', qty: '2', unit: 'tbsp' },
        { name: 'Garlic', qty: '3', unit: 'cloves' },
        { name: 'Chili', qty: '1', unit: 'whole', notes: 'optional' },
      ]),
      stepsMd: `1. Cube the beef into bite-sized pieces\n2. Heat oil in a wok or large pan over high heat\n3. Stir-fry beef until cooked through (3-4 minutes)\n4. Add garlic and cook for 30 seconds\n5. Add tomatoes and onions, stir-fry for 2 minutes\n6. Add cucumber last minute to keep fresh\n7. Season with soy sauce\n8. Serve with lime juice and rice`,
      tags: 'beef,stir-fry,traditional,authentic',
    },
    {
      title: 'Nom Banh Chok (Khmer Noodles)',
      description:
        'The national dish of Cambodia - rice noodles with fish gravy and fresh vegetables.',
      cuisine: 'Cambodian',
      dietTags: 'seafood',
      difficulty: 'hard',
      timeMins: 50,
      estimatedPrice: 25000,
      currency: 'KHR',
      kcal: 380,
      proteinG: 20,
      carbsG: 45,
      fatG: 12,
      fiberG: 4,
      sugarG: 3,
      sodiumMg: 720,
      ingredientsJson: JSON.stringify([
        { name: 'Rice noodles', qty: '300', unit: 'g' },
        { name: 'Fresh fish', qty: '200', unit: 'g', notes: 'or canned' },
        { name: 'Lemongrass', qty: '2', unit: 'stalks' },
        { name: 'Garlic', qty: '5', unit: 'cloves' },
        { name: 'Galangal', qty: '2', unit: 'tbsp' },
        { name: 'Turmeric powder', qty: '1', unit: 'tsp' },
        { name: 'Fish sauce', qty: '2', unit: 'tbsp' },
        { name: 'Vegetables (lettuce, cucumber)', qty: '200', unit: 'g' },
        { name: 'Water', qty: '500', unit: 'ml' },
      ]),
      stepsMd: `1. Make the gravy: toast lemongrass, garlic, and galangal\n2. Grind to paste, cook with turmeric and fish\n3. Simmer for 20 minutes, add fish sauce\n4. Cook noodles according to package\n5. Arrange noodles in bowl\n6. Pour hot gravy over noodles\n7. Top with fresh vegetables and herbs\n8. Serve immediately`,
      tags: 'national-dish,noodles,seafood,traditional',
    },
    {
      title: 'Amok (Creamy Fish Curry)',
      description:
        'Fragrant curry made with fish and coconut milk, steamed in banana leaves.',
      cuisine: 'Cambodian',
      dietTags: 'seafood,gluten-free',
      difficulty: 'hard',
      timeMins: 45,
      estimatedPrice: 40000,
      currency: 'KHR',
      kcal: 450,
      proteinG: 28,
      carbsG: 22,
      fatG: 28,
      fiberG: 2,
      sugarG: 4,
      sodiumMg: 640,
      ingredientsJson: JSON.stringify([
        { name: 'Fish (snapper)', qty: '500', unit: 'g' },
        { name: 'Coconut milk', qty: '400', unit: 'ml' },
        { name: 'Red curry paste', qty: '3', unit: 'tbsp' },
        { name: 'Eggs', qty: '3', unit: 'whole' },
        { name: 'Lemongrass', qty: '2', unit: 'stalks' },
        { name: 'Kaffir leaves', qty: '8', unit: 'leaves' },
        { name: 'Fish sauce', qty: '1', unit: 'tbsp' },
        { name: 'Banana leaves', qty: '4', unit: 'pieces' },
      ]),
      stepsMd: `1. Prepare banana leaves as containers\n2. Mix coconut milk with curry paste\n3. Cut fish into chunks\n4. Whisk eggs into coconut mixture\n5. Add fish, lemongrass, kaffir leaves, and fish sauce\n6. Pour into banana leaf cups\n7. Steam for 30 minutes\n8. Serve hot with rice`,
      tags: 'curry,coconut,fish,steamed,special',
    },
  ],

  // THAILAND (THB - Thai Baht)
  TH: [
    {
      title: 'Pad Thai (Stir-Fried Noodles)',
      description:
        'Thailand\'s most famous dish - stir-fried rice noodles with shrimp, tofu, and bean sprouts.',
      cuisine: 'Thai',
      dietTags: 'vegetarian-option,vegan-option',
      difficulty: 'easy',
      timeMins: 20,
      estimatedPrice: 60,
      currency: 'THB',
      kcal: 450,
      proteinG: 18,
      carbsG: 52,
      fatG: 18,
      fiberG: 3,
      sugarG: 8,
      sodiumMg: 920,
      ingredientsJson: JSON.stringify([
        { name: 'Rice noodles', qty: '250', unit: 'g' },
        { name: 'Shrimp', qty: '200', unit: 'g', notes: 'optional' },
        { name: 'Eggs', qty: '2', unit: 'whole' },
        { name: 'Tofu', qty: '100', unit: 'g', notes: 'fried' },
        { name: 'Bean sprouts', qty: '150', unit: 'g' },
        { name: 'Peanuts', qty: '50', unit: 'g' },
        { name: 'Tamarind paste', qty: '2', unit: 'tbsp' },
        { name: 'Fish sauce', qty: '2', unit: 'tbsp' },
        { name: 'Palm sugar', qty: '1', unit: 'tbsp' },
        { name: 'Lime', qty: '1', unit: 'whole' },
      ]),
      stepsMd: `1. Soak rice noodles in warm water for 30 minutes\n2. Heat oil in a wok or large pan\n3. Stir-fry shrimp until pink (2-3 minutes)\n4. Push to side, scramble eggs\n5. Add drained noodles and toss\n6. Pour tamarind paste and fish sauce\n7. Add palm sugar and mix well\n8. Add bean sprouts and tofu\n9. Toss everything together for 1-2 minutes\n10. Serve with crushed peanuts, lime, and chili flakes`,
      tags: 'noodles,shrimp,street-food,famous',
    },
    {
      title: 'Green Curry (Gaeng Keow Wan)',
      description:
        'Spicy and creamy Thai green curry with chicken, vegetables, and basil.',
      cuisine: 'Thai',
      dietTags: 'gluten-free,high-protein',
      difficulty: 'medium',
      timeMins: 30,
      estimatedPrice: 80,
      currency: 'THB',
      kcal: 480,
      proteinG: 32,
      carbsG: 18,
      fatG: 32,
      fiberG: 3,
      sugarG: 6,
      sodiumMg: 680,
      ingredientsJson: JSON.stringify([
        { name: 'Chicken breast', qty: '400', unit: 'g' },
        { name: 'Coconut milk', qty: '400', unit: 'ml' },
        { name: 'Green curry paste', qty: '3', unit: 'tbsp' },
        { name: 'Eggplant', qty: '200', unit: 'g' },
        { name: 'Thai basil', qty: '20', unit: 'leaves' },
        { name: 'Kaffir lime leaves', qty: '4', unit: 'leaves' },
        { name: 'Fish sauce', qty: '1', unit: 'tbsp' },
        { name: 'Palm sugar', qty: '1', unit: 'tsp' },
        { name: 'Chili', qty: '1', unit: 'whole', notes: 'optional' },
      ]),
      stepsMd: `1. Heat coconut milk in a large pan\n2. Add green curry paste and stir until combined\n3. Simmer for 3-4 minutes to develop flavor\n4. Cut chicken into bite-sized pieces\n5. Add chicken to curry and cook for 8 minutes\n6. Add eggplant and cook for 5 minutes\n7. Season with fish sauce and palm sugar\n8. Add basil and kaffir leaves at the end\n9. Serve with jasmine rice`,
      tags: 'curry,chicken,spicy,coconut',
    },
    {
      title: 'Tom Yum Goong (Spicy Shrimp Soup)',
      description:
        'Hot and sour soup with shrimp, lemongrass, and galangal - a Thai classic.',
      cuisine: 'Thai',
      dietTags: 'seafood,gluten-free,low-calorie',
      difficulty: 'medium',
      timeMins: 25,
      estimatedPrice: 70,
      currency: 'THB',
      kcal: 220,
      proteinG: 18,
      carbsG: 12,
      fatG: 8,
      fiberG: 2,
      sugarG: 3,
      sodiumMg: 580,
      ingredientsJson: JSON.stringify([
        { name: 'Shrimp', qty: '300', unit: 'g' },
        { name: 'Chicken stock', qty: '1000', unit: 'ml' },
        { name: 'Lemongrass', qty: '3', unit: 'stalks' },
        { name: 'Galangal', qty: '4', unit: 'slices' },
        { name: 'Kaffir lime leaves', qty: '6', unit: 'leaves' },
        { name: 'Thai chilies', qty: '2', unit: 'whole' },
        { name: 'Fish sauce', qty: '2', unit: 'tbsp' },
        { name: 'Lime juice', qty: '3', unit: 'tbsp' },
        { name: 'Mushrooms', qty: '150', unit: 'g', notes: 'button or straw' },
      ]),
      stepsMd: `1. Lightly bruise lemongrass and galangal\n2. Bring stock to boil with lemongrass and galangal\n3. Add chilies and simmer for 5 minutes\n4. Add shrimp and mushrooms\n5. Cook until shrimp are pink (3-4 minutes)\n6. Add fish sauce and lime juice\n7. Add kaffir leaves\n8. Taste and adjust seasoning\n9. Serve hot in bowls`,
      tags: 'soup,shrimp,spicy,sour,light',
    },
  ],

  // VIETNAM (VND - Vietnamese Dong)
  VN: [
    {
      title: 'Pho Bo (Beef Noodle Soup)',
      description:
        'Vietnam\'s national soup - aromatic beef broth with rice noodles and fresh herbs.',
      cuisine: 'Vietnamese',
      dietTags: 'high-protein,gluten-free',
      difficulty: 'hard',
      timeMins: 120,
      estimatedPrice: 60000,
      currency: 'VND',
      kcal: 380,
      proteinG: 22,
      carbsG: 42,
      fatG: 12,
      fiberG: 2,
      sugarG: 3,
      sodiumMg: 920,
      ingredientsJson: JSON.stringify([
        { name: 'Beef bones', qty: '1000', unit: 'g' },
        { name: 'Beef sirloin', qty: '300', unit: 'g' },
        { name: 'Rice noodles', qty: '200', unit: 'g' },
        { name: 'Onion', qty: '1', unit: 'whole', notes: 'quartered' },
        { name: 'Ginger', qty: '50', unit: 'g', notes: 'sliced' },
        { name: 'Star anise', qty: '3', unit: 'whole' },
        { name: 'Cinnamon stick', qty: '1', unit: 'piece' },
        { name: 'Cloves', qty: '3', unit: 'whole' },
        { name: 'Fresh herbs', qty: '100', unit: 'g', notes: 'basil, cilantro, mint' },
        { name: 'Water', qty: '2000', unit: 'ml' },
      ]),
      stepsMd: `1. Blanch beef bones, then rinse and clean\n2. Char onion and ginger in a pan for color\n3. Bring water to boil and add bones\n4. Add charred onion and ginger\n5. Add spices (star anise, cinnamon, cloves)\n6. Simmer for 1.5-2 hours until rich flavor develops\n7. Strain broth, keep warm\n8. Slice beef sirloin thinly\n9. Cook rice noodles according to package\n10. Assemble: noodles in bowl, top with thin beef slices\n11. Pour hot broth over (heat will cook beef)\n12. Serve with fresh herbs on the side`,
      tags: 'noodles,beef,soup,national-dish',
    },
    {
      title: 'Banh Mi (Vietnamese Sandwich)',
      description:
        'Crispy baguette filled with savory meat, pâté, pickled vegetables, and fresh cilantro.',
      cuisine: 'Vietnamese',
      dietTags: 'vegetarian-option',
      difficulty: 'easy',
      timeMins: 20,
      estimatedPrice: 25000,
      currency: 'VND',
      kcal: 380,
      proteinG: 16,
      carbsG: 44,
      fatG: 14,
      fiberG: 2,
      sugarG: 6,
      sodiumMg: 840,
      ingredientsJson: JSON.stringify([
        { name: 'Baguette', qty: '1', unit: 'whole' },
        { name: 'Pâté', qty: '50', unit: 'g' },
        { name: 'Grilled pork', qty: '100', unit: 'g' },
        { name: 'Vietnamese ham', qty: '50', unit: 'g' },
        { name: 'Cucumber', qty: '50', unit: 'g', notes: 'julienned' },
        { name: 'Pickled daikon and carrot', qty: '80', unit: 'g' },
        { name: 'Cilantro', qty: '15', unit: 'g' },
        { name: 'Mayonnaise', qty: '1', unit: 'tbsp' },
        { name: 'Butter', qty: '1', unit: 'tbsp' },
        { name: 'Chili sauce', qty: '1', unit: 'tsp' },
      ]),
      stepsMd: `1. Slice baguette lengthwise and lightly toast in oven\n2. Spread butter on inside of baguette\n3. Layer pâté on one side\n4. Add grilled pork and ham\n5. Layer pickled vegetables\n6. Add fresh cucumber slices\n7. Top with cilantro and chili sauce\n8. Close sandwich and slice in half\n9. Serve immediately while warm`,
      tags: 'sandwich,pork,quick,street-food',
    },
    {
      title: 'Goi Cuon (Fresh Spring Rolls)',
      description:
        'Translucent rice paper rolls filled with shrimp, herbs, and crispy vermicelli.',
      cuisine: 'Vietnamese',
      dietTags: 'gluten-free,seafood,low-calorie',
      difficulty: 'easy',
      timeMins: 25,
      estimatedPrice: 35000,
      currency: 'VND',
      kcal: 280,
      proteinG: 10,
      carbsG: 32,
      fatG: 11,
      fiberG: 2,
      sugarG: 4,
      sodiumMg: 420,
      ingredientsJson: JSON.stringify([
        { name: 'Rice paper', qty: '12', unit: 'sheets' },
        { name: 'Shrimp', qty: '200', unit: 'g', notes: 'cooked' },
        { name: 'Rice vermicelli', qty: '50', unit: 'g', notes: 'cooked' },
        { name: 'Lettuce', qty: '100', unit: 'g' },
        { name: 'Mint leaves', qty: '30', unit: 'g' },
        { name: 'Cilantro', qty: '20', unit: 'g' },
        { name: 'Water', qty: '500', unit: 'ml', notes: 'for softening paper' },
      ]),
      stepsMd: `1. Prepare a bowl of warm water\n2. Cook rice noodles and shrimp if not already done\n3. Dip rice paper in warm water for 5-10 seconds until pliable\n4. Lay on damp surface\n5. Layer lettuce, herbs, vermicelli, and shrimp in center\n6. Fold sides inward and roll tightly\n7. Serve with peanut sauce or fish sauce dip\n8. Best served immediately after rolling`,
      tags: 'rolls,shrimp,fresh,herbs,appetizer',
    },
  ],

  // AUSTRALIA (AUD - Australian Dollar)
  AU: [
    {
      title: 'Barramundi with Lemon Butter',
      description:
        'Fresh Australian barramundi fish fillet with classic lemon butter and seasonal vegetables.',
      cuisine: 'Australian',
      dietTags: 'seafood,high-protein,gluten-free',
      difficulty: 'easy',
      timeMins: 25,
      estimatedPrice: 28,
      currency: 'AUD',
      kcal: 420,
      proteinG: 38,
      carbsG: 8,
      fatG: 24,
      fiberG: 3,
      sugarG: 1,
      sodiumMg: 520,
      ingredientsJson: JSON.stringify([
        { name: 'Barramundi fillets', qty: '400', unit: 'g' },
        { name: 'Butter', qty: '50', unit: 'g' },
        { name: 'Lemon', qty: '2', unit: 'whole' },
        { name: 'Asparagus', qty: '200', unit: 'g' },
        { name: 'Baby potatoes', qty: '300', unit: 'g' },
        { name: 'Garlic', qty: '2', unit: 'cloves' },
        { name: 'Parsley', qty: '10', unit: 'g' },
        { name: 'Sea salt', qty: '1', unit: 'tsp' },
        { name: 'Black pepper', qty: '1', unit: 'tsp' },
      ]),
      stepsMd: `1. Preheat oven to 200°C (400°F)\n2. Boil baby potatoes until tender (15 minutes)\n3. Trim asparagus and toss with oil, season with salt and pepper\n4. Place barramundi on baking tray\n5. Infuse butter with minced garlic and lemon zest\n6. Top fish with garlic-lemon butter\n7. Bake fish for 12-15 minutes until cooked through\n8. Roast asparagus for 10 minutes\n9. Serve fish with potatoes and asparagus\n10. Garnish with fresh parsley and lemon wedge`,
      tags: 'fish,seafood,australian,healthy,elegant',
    },
    {
      title: 'Lamingtons (Chocolate Coconut Cakes)',
      description:
        'Australian classic - sponge cakes dipped in chocolate and rolled in coconut.',
      cuisine: 'Australian',
      dietTags: 'vegetarian',
      difficulty: 'medium',
      timeMins: 60,
      estimatedPrice: 12,
      currency: 'AUD',
      kcal: 280,
      proteinG: 4,
      carbsG: 38,
      fatG: 12,
      fiberG: 1,
      sugarG: 28,
      sodiumMg: 180,
      ingredientsJson: JSON.stringify([
        { name: 'Butter', qty: '100', unit: 'g' },
        { name: 'Sugar', qty: '100', unit: 'g' },
        { name: 'Eggs', qty: '2', unit: 'whole' },
        { name: 'Flour', qty: '150', unit: 'g' },
        { name: 'Baking powder', qty: '1', unit: 'tsp' },
        { name: 'Milk', qty: '100', unit: 'ml' },
        { name: 'Vanilla extract', qty: '1', unit: 'tsp' },
        { name: 'Dark chocolate', qty: '200', unit: 'g' },
        { name: 'Coconut (desiccated)', qty: '200', unit: 'g' },
      ]),
      stepsMd: `1. Preheat oven to 180°C (350°F)\n2. Cream butter and sugar until fluffy\n3. Beat in eggs one at a time\n4. Alternate adding flour mixture and milk\n5. Add vanilla extract\n6. Pour into lined baking pan and bake 25-30 minutes\n7. Cool completely, then cut into squares\n8. Melt chocolate in a bowl\n9. Dip each cake piece in chocolate\n10. Roll in desiccated coconut\n11. Set on baking paper to cool and harden`,
      tags: 'dessert,cake,coconut,chocolate,classic',
    },
    {
      title: 'Pavlova with Fresh Berries',
      description:
        'Light and crispy meringue base topped with whipped cream and fresh Australian berries.',
      cuisine: 'Australian',
      dietTags: 'vegetarian,gluten-free',
      difficulty: 'medium',
      timeMins: 90,
      estimatedPrice: 18,
      currency: 'AUD',
      kcal: 240,
      proteinG: 3,
      carbsG: 35,
      fatG: 8,
      fiberG: 2,
      sugarG: 32,
      sodiumMg: 40,
      ingredientsJson: JSON.stringify([
        { name: 'Egg whites', qty: '4', unit: 'whole' },
        { name: 'Caster sugar', qty: '200', unit: 'g' },
        { name: 'Cornstarch', qty: '1', unit: 'tbsp' },
        { name: 'Vinegar', qty: '1', unit: 'tbsp' },
        { name: 'Vanilla extract', qty: '1', unit: 'tsp' },
        { name: 'Cream (heavy)', qty: '300', unit: 'ml' },
        { name: 'Strawberries', qty: '200', unit: 'g' },
        { name: 'Blueberries', qty: '150', unit: 'g' },
        { name: 'Raspberries', qty: '150', unit: 'g' },
      ]),
      stepsMd: `1. Preheat oven to 120°C (250°F)\n2. Beat egg whites until soft peaks form\n3. Gradually add sugar while beating until stiff peaks form\n4. Fold in cornstarch, vinegar, and vanilla\n5. Spread meringue on baking paper in circle shape\n6. Create well in center with back of spoon\n7. Bake for 1 hour until pale and crispy\n8. Cool completely\n9. Whip heavy cream until soft peaks\n10. Top pavlova with cream and fresh berries\n11. Serve immediately`,
      tags: 'dessert,meringue,berries,elegant,special',
    },
  ],

  // UNITED STATES (USD - US Dollar)
  US: [
    {
      title: 'Classic Burger with Fries',
      description:
        'American classic - juicy beef burger with cheese, fresh toppings, and crispy fries.',
      cuisine: 'American',
      dietTags: 'high-protein',
      difficulty: 'easy',
      timeMins: 30,
      estimatedPrice: 12,
      currency: 'USD',
      kcal: 680,
      proteinG: 32,
      carbsG: 62,
      fatG: 32,
      fiberG: 3,
      sugarG: 8,
      sodiumMg: 1080,
      ingredientsJson: JSON.stringify([
        { name: 'Ground beef', qty: '200', unit: 'g', notes: '80/20' },
        { name: 'Burger buns', qty: '2', unit: 'whole' },
        { name: 'Cheddar cheese', qty: '50', unit: 'g' },
        { name: 'Tomato', qty: '50', unit: 'g' },
        { name: 'Lettuce', qty: '30', unit: 'g' },
        { name: 'Onion', qty: '30', unit: 'g' },
        { name: 'Pickles', qty: '20', unit: 'g' },
        { name: 'Ketchup', qty: '1', unit: 'tbsp' },
        { name: 'Mustard', qty: '1', unit: 'tbsp' },
        { name: 'Potatoes', qty: '300', unit: 'g' },
      ]),
      stepsMd: `1. Preheat grill or skillet to high heat\n2. Form ground beef into patty, season with salt and pepper\n3. Cook patty 3-4 minutes per side for medium\n4. Add cheese in last minute of cooking\n5. Toast buns lightly\n6. Assemble: bottom bun, patty with cheese, tomato, lettuce, onion, pickles\n7. Spread ketchup and mustard on top bun\n8. Close burger\n9. Serve with crispy fries on the side`,
      tags: 'burger,beef,american,fast-food,classic',
    },
    {
      title: 'Mac and Cheese (Homemade)',
      description:
        'Creamy, cheesy pasta comfort food - a true American favorite made from scratch.',
      cuisine: 'American',
      dietTags: 'vegetarian',
      difficulty: 'easy',
      timeMins: 25,
      estimatedPrice: 8,
      currency: 'USD',
      kcal: 520,
      proteinG: 20,
      carbsG: 48,
      fatG: 24,
      fiberG: 2,
      sugarG: 4,
      sodiumMg: 680,
      ingredientsJson: JSON.stringify([
        { name: 'Elbow pasta', qty: '300', unit: 'g' },
        { name: 'Butter', qty: '40', unit: 'g' },
        { name: 'Flour', qty: '30', unit: 'g' },
        { name: 'Milk', qty: '400', unit: 'ml' },
        { name: 'Cheddar cheese', qty: '200', unit: 'g', notes: 'sharp' },
        { name: 'Gruyere cheese', qty: '100', unit: 'g' },
        { name: 'Breadcrumbs', qty: '50', unit: 'g' },
        { name: 'Salt', qty: '1', unit: 'tsp' },
        { name: 'Black pepper', qty: '1', unit: 'tsp' },
      ]),
      stepsMd: `1. Preheat oven to 200°C (400°F)\n2. Cook pasta according to package, drain\n3. Make roux: melt butter, add flour, cook 1 minute\n4. Whisk in milk slowly to avoid lumps\n5. Cook until thickened (3-4 minutes)\n6. Remove from heat, add grated cheeses\n7. Stir until melted and smooth\n8. Combine cheese sauce with cooked pasta\n9. Transfer to baking dish\n10. Top with breadcrumbs mixed with butter\n11. Bake for 15 minutes until golden\n12. Serve hot`,
      tags: 'pasta,cheese,comfort-food,creamy,baked',
    },
    {
      title: 'BBQ Ribs with Cornbread',
      description:
        'Slow-cooked tender ribs with smoky BBQ sauce, served with sweet cornbread.',
      cuisine: 'American',
      dietTags: 'high-protein',
      difficulty: 'hard',
      timeMins: 180,
      estimatedPrice: 16,
      currency: 'USD',
      kcal: 640,
      proteinG: 42,
      carbsG: 45,
      fatG: 28,
      fiberG: 2,
      sugarG: 18,
      sodiumMg: 1200,
      ingredientsJson: JSON.stringify([
        { name: 'Pork ribs', qty: '1000', unit: 'g' },
        { name: 'BBQ sauce', qty: '300', unit: 'ml' },
        { name: 'Dry rub', qty: '3', unit: 'tbsp', notes: 'paprika, brown sugar, etc.' },
        { name: 'Cornmeal', qty: '200', unit: 'g' },
        { name: 'Flour', qty: '150', unit: 'g' },
        { name: 'Baking powder', qty: '1', unit: 'tbsp' },
        { name: 'Eggs', qty: '2', unit: 'whole' },
        { name: 'Milk', qty: '200', unit: 'ml' },
        { name: 'Butter', qty: '50', unit: 'g' },
        { name: 'Honey', qty: '2', unit: 'tbsp' },
      ]),
      stepsMd: `For Ribs:\n1. Remove membrane from back of ribs\n2. Apply dry rub generously\n3. Preheat oven to 130°C (275°F)\n4. Wrap ribs in foil, place on baking tray\n5. Slow-cook for 2.5 hours\n6. Remove foil, brush with BBQ sauce\n7. Bake for 15 more minutes until caramelized\n\nFor Cornbread:\n1. Preheat oven to 200°C (400°F)\n2. Mix cornmeal, flour, baking powder\n3. Whisk eggs, milk, melted butter together\n4. Combine wet and dry ingredients\n5. Pour into greased skillet\n6. Bake 20-25 minutes until golden\n7. Brush with honey while warm`,
      tags: 'ribs,BBQ,pork,slow-cooked,southern',
    },
  ],
};

async function main() {
  console.log('🌱 Seeding recipes for all countries...\n');

  // Clear existing recipes (optional - remove if you want to keep them)
  // await prisma.recipe.deleteMany({});

  for (const [country, countryRecipes] of Object.entries(recipes)) {
    console.log(`📍 Adding recipes for ${country}...`);

    for (const recipe of countryRecipes) {
      try {
        const created = await prisma.recipe.create({
          data: recipe,
        });
        console.log(`  ✅ Created: ${created.title}`);
      } catch (error) {
        console.log(`  ❌ Error creating ${recipe.title}:`, error);
      }
    }

    console.log('');
  }

  console.log('🎉 Recipe seeding completed!');
  console.log('Total recipes added: 15 (3 per country)');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error during seeding:', e);
  process.exit(1);
});
