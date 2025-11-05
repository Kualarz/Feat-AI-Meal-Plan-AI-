import { NextResponse } from 'next/server';

const sampleRecipes = [
  // ============================================
  // CAMBODIA (KHR)
  // ============================================
  {
    id: 'kh-1',
    title: 'Lok Lak (Beef Stir-Fry)',
    description: 'Tender beef stir-fried with fresh vegetables and lime dipping sauce. A traditional Cambodian favorite.',
    cuisine: 'Cambodian',
    difficulty: 'medium',
    timeMins: 25,
    estimatedPrice: 5.50,
    currency: 'USD',
    kcal: 420,
    proteinG: 32,
    carbsG: 18,
    fatG: 24,
    fiberG: 3,
    sugarG: 2,
    sodiumMg: 580,
    imageUrl: 'https://images.unsplash.com/photo-1603894542802-f1dbc86e6461?w=400&h=300&fit=crop',
    dietTags: 'high-protein,gluten-free',
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
    stepsMd: `1. Cube the beef into bite-sized pieces
2. Heat oil in a wok or large pan over high heat
3. Stir-fry beef until cooked through (3-4 minutes)
4. Add garlic and cook for 30 seconds
5. Add tomatoes and onions, stir-fry for 2 minutes
6. Add cucumber last minute to keep fresh
7. Season with soy sauce
8. Serve with lime juice and rice`,
    safetyMd: `**Food Safety Tips:**
- Ensure beef is cooked thoroughly to internal temperature of 63°C (145°F)
- Use fresh lime juice immediately; do not store prepared lime juice
- Store uncooked beef in the coldest part of your refrigerator
- Wash all vegetables thoroughly before use
- Use separate cutting boards for meat and vegetables to prevent cross-contamination`,
    tags: 'beef,stir-fry,traditional,authentic',
  },
  {
    id: 'kh-2',
    title: 'Nom Banh Chok (Khmer Noodles)',
    description: 'The national dish of Cambodia - rice noodles with fish gravy and fresh vegetables.',
    cuisine: 'Cambodian',
    difficulty: 'hard',
    timeMins: 50,
    estimatedPrice: 3.50,
    currency: 'USD',
    kcal: 380,
    proteinG: 20,
    carbsG: 45,
    fatG: 12,
    fiberG: 4,
    sugarG: 3,
    sodiumMg: 720,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-415a06e44efb?w=400&h=300&fit=crop',
    dietTags: 'seafood',
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
    stepsMd: `1. Make the gravy: toast lemongrass, garlic, and galangal
2. Grind to paste, cook with turmeric and fish
3. Simmer for 20 minutes, add fish sauce
4. Cook noodles according to package instructions
5. Arrange noodles in bowl
6. Pour hot gravy over noodles
7. Top with fresh vegetables and herbs
8. Serve immediately`,
    safetyMd: `**Food Safety Tips:**
- Use fresh fish; if using canned, check expiration date
- Handle fish with clean utensils to prevent bacterial contamination
- Keep gravy hot (above 60°C) until serving
- Do not let cooked noodles sit at room temperature for more than 2 hours
- If using fresh herbs, wash thoroughly before serving`,
    tags: 'national-dish,noodles,seafood,traditional',
  },
  {
    id: 'kh-3',
    title: 'Amok (Creamy Fish Curry)',
    description: 'Fragrant curry made with fish and coconut milk, steamed in banana leaves.',
    cuisine: 'Cambodian',
    difficulty: 'hard',
    timeMins: 45,
    estimatedPrice: 6.00,
    currency: 'USD',
    kcal: 450,
    proteinG: 28,
    carbsG: 22,
    fatG: 28,
    fiberG: 2,
    sugarG: 4,
    sodiumMg: 640,
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=400&h=300&fit=crop',
    dietTags: 'seafood,gluten-free',
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
    stepsMd: `1. Prepare banana leaves as containers
2. Mix coconut milk with curry paste
3. Cut fish into chunks
4. Whisk eggs into coconut mixture
5. Add fish, lemongrass, kaffir leaves, and fish sauce
6. Pour into banana leaf cups
7. Steam for 30 minutes
8. Serve hot with rice`,
    safetyMd: `**Food Safety Tips:**
- Ensure fish is fresh and properly stored
- Check that eggs are at room temperature before whisking
- Use fresh banana leaves; sanitize before use
- Steam at proper temperature (100°C) for full 30 minutes
- Allow to cool slightly before serving (contents will be very hot)
- Do not consume raw eggs; ensure they are fully cooked`,
    tags: 'curry,coconut,fish,steamed,special',
  },

  // ============================================
  // THAILAND (THB)
  // ============================================
  {
    id: 'th-1',
    title: 'Pad Thai (Stir-Fried Noodles)',
    description: "Thailand's most famous dish - stir-fried rice noodles with shrimp, tofu, and bean sprouts.",
    cuisine: 'Thai',
    difficulty: 'easy',
    timeMins: 20,
    estimatedPrice: 2.50,
    currency: 'USD',
    kcal: 450,
    proteinG: 18,
    carbsG: 52,
    fatG: 18,
    fiberG: 3,
    sugarG: 8,
    sodiumMg: 920,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc72e?w=400&h=300&fit=crop',
    dietTags: 'vegetarian-option,vegan-option',
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
    stepsMd: `1. Soak rice noodles in warm water for 30 minutes
2. Heat oil in a wok or large pan
3. Stir-fry shrimp until pink (2-3 minutes)
4. Push to side, scramble eggs
5. Add drained noodles and toss
6. Pour tamarind paste and fish sauce
7. Add palm sugar and mix well
8. Add bean sprouts and tofu
9. Toss everything together for 1-2 minutes
10. Serve with crushed peanuts, lime, and chili flakes`,
    safetyMd: `**Food Safety Tips:**
- Use fresh shrimp stored at proper temperature
- Cook shrimp until fully opaque (no translucent parts)
- Keep bean sprouts refrigerated and use within 3 days
- Do not leave cooked Pad Thai at room temperature for more than 2 hours
- Wash hands thoroughly after handling raw shrimp
- Use clean utensils and cutting surfaces`,
    tags: 'noodles,shrimp,street-food,famous',
  },
  {
    id: 'th-2',
    title: 'Green Curry (Gaeng Keow Wan)',
    description: 'Spicy and creamy Thai green curry with chicken, vegetables, and basil.',
    cuisine: 'Thai',
    difficulty: 'medium',
    timeMins: 30,
    estimatedPrice: 3.50,
    currency: 'USD',
    kcal: 480,
    proteinG: 32,
    carbsG: 18,
    fatG: 32,
    fiberG: 3,
    sugarG: 6,
    sodiumMg: 680,
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=400&h=300&fit=crop',
    dietTags: 'gluten-free,high-protein',
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
    stepsMd: `1. Heat coconut milk in a large pan
2. Add green curry paste and stir until combined
3. Simmer for 3-4 minutes to develop flavor
4. Cut chicken into bite-sized pieces
5. Add chicken to curry and cook for 8 minutes
6. Add eggplant and cook for 5 minutes
7. Season with fish sauce and palm sugar
8. Add basil and kaffir leaves at the end
9. Serve with jasmine rice`,
    safetyMd: `**Food Safety Tips:**
- Ensure chicken reaches internal temperature of 75°C (165°F)
- Do not use spoiled coconut milk (check for odor and texture)
- Fresh basil should be added just before serving to preserve aroma
- Keep curry hot until serving
- Store leftovers in airtight container in refrigerator for up to 3 days`,
    tags: 'curry,chicken,spicy,coconut',
  },
  {
    id: 'th-3',
    title: 'Tom Yum Goong (Spicy Shrimp Soup)',
    description: 'Hot and sour soup with shrimp, lemongrass, and galangal - a Thai classic.',
    cuisine: 'Thai',
    difficulty: 'medium',
    timeMins: 25,
    estimatedPrice: 3.00,
    currency: 'USD',
    kcal: 220,
    proteinG: 18,
    carbsG: 12,
    fatG: 8,
    fiberG: 2,
    sugarG: 3,
    sodiumMg: 580,
    imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940571cd?w=400&h=300&fit=crop',
    dietTags: 'seafood,gluten-free,low-calorie',
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
    stepsMd: `1. Lightly bruise lemongrass and galangal
2. Bring stock to boil with lemongrass and galangal
3. Add chilies and simmer for 5 minutes
4. Add shrimp and mushrooms
5. Cook until shrimp are pink (3-4 minutes)
6. Add fish sauce and lime juice
7. Add kaffir leaves
8. Taste and adjust seasoning
9. Serve hot in bowls`,
    safetyMd: `**Food Safety Tips:**
- Use fresh shrimp stored at proper temperature
- Discard any shrimp with off smell or discoloration
- Boil stock at rolling boil to ensure safety
- Maintain soup at hot temperature until serving
- Do not leave soup at room temperature for more than 2 hours
- Clean all utensils that contacted raw shrimp`,
    tags: 'soup,shrimp,spicy,sour,light',
  },

  // ============================================
  // VIETNAM (VND)
  // ============================================
  {
    id: 'vn-1',
    title: 'Pho Bo (Beef Noodle Soup)',
    description: "Vietnam's national soup - aromatic beef broth with rice noodles and fresh herbs.",
    cuisine: 'Vietnamese',
    difficulty: 'hard',
    timeMins: 120,
    estimatedPrice: 3.00,
    currency: 'USD',
    kcal: 380,
    proteinG: 22,
    carbsG: 42,
    fatG: 12,
    fiberG: 2,
    sugarG: 3,
    sodiumMg: 920,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-415a06e44efb?w=400&h=300&fit=crop',
    dietTags: 'high-protein,gluten-free',
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
    stepsMd: `1. Blanch beef bones, then rinse and clean
2. Char onion and ginger in a pan for color
3. Bring water to boil and add bones
4. Add charred onion and ginger
5. Add spices (star anise, cinnamon, cloves)
6. Simmer for 1.5-2 hours until rich flavor develops
7. Strain broth, keep warm
8. Slice beef sirloin thinly
9. Cook rice noodles according to package
10. Assemble: noodles in bowl, top with thin beef slices
11. Pour hot broth over (heat will cook beef)
12. Serve with fresh herbs on the side`,
    safetyMd: `**Food Safety Tips:**
- Ensure beef bones are from reputable source
- Maintain broth at rolling boil for full cooking time
- Slice beef very thin to ensure proper cooking by hot broth (minimum 75°C)
- Use fresh herbs; wash thoroughly before serving
- Store broth in refrigerator for up to 3 days or freeze for longer storage
- Do not leave prepared Pho at room temperature`,
    tags: 'noodles,beef,soup,national-dish',
  },
  {
    id: 'vn-2',
    title: 'Banh Mi (Vietnamese Sandwich)',
    description: 'Crispy baguette filled with savory meat, pâté, pickled vegetables, and fresh cilantro.',
    cuisine: 'Vietnamese',
    difficulty: 'easy',
    timeMins: 20,
    estimatedPrice: 2.75,
    currency: 'USD',
    kcal: 380,
    proteinG: 16,
    carbsG: 44,
    fatG: 14,
    fiberG: 2,
    sugarG: 6,
    sodiumMg: 840,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561231?w=400&h=300&fit=crop',
    dietTags: 'vegetarian-option',
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
    stepsMd: `1. Slice baguette lengthwise and lightly toast in oven
2. Spread butter on inside of baguette
3. Layer pâté on one side
4. Add grilled pork and ham
5. Layer pickled vegetables
6. Add fresh cucumber slices
7. Top with cilantro and chili sauce
8. Close sandwich and slice in half
9. Serve immediately while warm`,
    safetyMd: `**Food Safety Tips:**
- Use fresh baguette; do not use stale bread
- Ensure pâté is fresh and properly refrigerated
- Cooked pork must reach internal temperature of 63°C (145°F)
- Consume prepared sandwich within 2 hours
- Wash vegetables thoroughly before use
- Keep pickled vegetables refrigerated and check expiration date`,
    tags: 'sandwich,pork,quick,street-food',
  },
  {
    id: 'vn-3',
    title: 'Goi Cuon (Fresh Spring Rolls)',
    description: 'Translucent rice paper rolls filled with shrimp, herbs, and crispy vermicelli.',
    cuisine: 'Vietnamese',
    difficulty: 'easy',
    timeMins: 25,
    estimatedPrice: 2.25,
    currency: 'USD',
    kcal: 280,
    proteinG: 10,
    carbsG: 32,
    fatG: 11,
    fiberG: 2,
    sugarG: 4,
    sodiumMg: 420,
    imageUrl: 'https://images.unsplash.com/photo-1571407388087-71c66d90cd0c?w=400&h=300&fit=crop',
    dietTags: 'gluten-free,seafood,low-calorie',
    ingredientsJson: JSON.stringify([
      { name: 'Rice paper', qty: '12', unit: 'sheets' },
      { name: 'Shrimp', qty: '200', unit: 'g', notes: 'cooked' },
      { name: 'Rice vermicelli', qty: '50', unit: 'g', notes: 'cooked' },
      { name: 'Lettuce', qty: '100', unit: 'g' },
      { name: 'Mint leaves', qty: '30', unit: 'g' },
      { name: 'Cilantro', qty: '20', unit: 'g' },
      { name: 'Water', qty: '500', unit: 'ml', notes: 'for softening paper' },
    ]),
    stepsMd: `1. Prepare a bowl of warm water
2. Cook rice noodles and shrimp if not already done
3. Dip rice paper in warm water for 5-10 seconds until pliable
4. Lay on damp surface
5. Layer lettuce, herbs, vermicelli, and shrimp in center
6. Fold sides inward and roll tightly
7. Serve with peanut sauce or fish sauce dip
8. Best served immediately after rolling`,
    safetyMd: `**Food Safety Tips:**
- Use cooked shrimp only; ensure proper cooking before use
- Rice paper should be pliable but not overly wet (can tear)
- Keep rice paper in cool place; do not expose to heat
- Fresh herbs should be washed thoroughly before use
- Consume rolls within 2 hours of preparation
- Store in refrigerator with damp paper towel if preparing ahead`,
    tags: 'rolls,shrimp,fresh,herbs,appetizer',
  },

  // ============================================
  // AUSTRALIA (AUD)
  // ============================================
  {
    id: 'au-1',
    title: 'Barramundi with Lemon Butter',
    description: 'Fresh Australian barramundi fish fillet with classic lemon butter and seasonal vegetables.',
    cuisine: 'Australian',
    difficulty: 'easy',
    timeMins: 25,
    estimatedPrice: 18.00,
    currency: 'USD',
    kcal: 420,
    proteinG: 38,
    carbsG: 8,
    fatG: 24,
    fiberG: 3,
    sugarG: 1,
    sodiumMg: 520,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    dietTags: 'seafood,high-protein,gluten-free',
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
    stepsMd: `1. Preheat oven to 200°C (400°F)
2. Boil baby potatoes until tender (15 minutes)
3. Trim asparagus and toss with oil, season with salt and pepper
4. Place barramundi on baking tray
5. Infuse butter with minced garlic and lemon zest
6. Top fish with garlic-lemon butter
7. Bake fish for 12-15 minutes until cooked through
8. Roast asparagus for 10 minutes
9. Serve fish with potatoes and asparagus
10. Garnish with fresh parsley and lemon wedge`,
    safetyMd: `**Food Safety Tips:**
- Ensure barramundi is fresh; check for fishy smell (should smell fresh, not "fishy")
- Cook fish until opaque and flakes easily with fork (internal temp 63°C/145°F)
- Do not cross-contaminate with other foods during preparation
- Keep raw fish on separate cutting board
- Use lemon immediately after cutting (vitamin C will prevent oxidation)
- Store leftover fish in airtight container for up to 2 days`,
    tags: 'fish,seafood,australian,healthy,elegant',
  },
  {
    id: 'au-2',
    title: 'Lamingtons (Chocolate Coconut Cakes)',
    description: 'Australian classic - sponge cakes dipped in chocolate and rolled in coconut.',
    cuisine: 'Australian',
    difficulty: 'medium',
    timeMins: 60,
    estimatedPrice: 8.00,
    currency: 'USD',
    kcal: 280,
    proteinG: 4,
    carbsG: 38,
    fatG: 12,
    fiberG: 1,
    sugarG: 28,
    sodiumMg: 180,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    dietTags: 'vegetarian',
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
    stepsMd: `1. Preheat oven to 180°C (350°F)
2. Cream butter and sugar until fluffy
3. Beat in eggs one at a time
4. Alternate adding flour mixture and milk
5. Add vanilla extract
6. Pour into lined baking pan and bake 25-30 minutes
7. Cool completely, then cut into squares
8. Melt chocolate in a bowl
9. Dip each cake piece in chocolate
10. Roll in desiccated coconut
11. Set on baking paper to cool and harden`,
    safetyMd: `**Food Safety Tips:**
- Ensure eggs are fresh (use within 3 weeks of purchase)
- Use room temperature eggs for best mixing
- Do not consume raw cake batter
- Allow cakes to cool completely before dipping to prevent chocolate from melting excessively
- Store in airtight container at room temperature for up to 5 days
- Keep away from direct sunlight to prevent chocolate bloom`,
    tags: 'dessert,cake,coconut,chocolate,classic',
  },
  {
    id: 'au-3',
    title: 'Pavlova with Fresh Berries',
    description: 'Light and crispy meringue base topped with whipped cream and fresh Australian berries.',
    cuisine: 'Australian',
    difficulty: 'medium',
    timeMins: 90,
    estimatedPrice: 12.00,
    currency: 'USD',
    kcal: 240,
    proteinG: 3,
    carbsG: 35,
    fatG: 8,
    fiberG: 2,
    sugarG: 32,
    sodiumMg: 40,
    imageUrl: 'https://images.unsplash.com/photo-1599599810694-b308d9d61dac?w=400&h=300&fit=crop',
    dietTags: 'vegetarian,gluten-free',
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
    stepsMd: `1. Preheat oven to 120°C (250°F)
2. Beat egg whites until soft peaks form
3. Gradually add sugar while beating until stiff peaks form
4. Fold in cornstarch, vinegar, and vanilla
5. Spread meringue on baking paper in circle shape
6. Create well in center with back of spoon
7. Bake for 1 hour until pale and crispy
8. Cool completely
9. Whip heavy cream until soft peaks
10. Top pavlova with cream and fresh berries
11. Serve immediately`,
    safetyMd: `**Food Safety Tips:**
- Use fresh eggs; ensure no shell fragments in egg whites
- All utensils must be completely fat-free for proper whipping
- Do not use eggs with any cracks or discoloration
- Bake at consistent low temperature to dry meringue without browning
- Ensure meringue is completely cool before assembling
- Use fresh berries; wash thoroughly before serving
- Consume within 2 hours of assembly for best texture`,
    tags: 'dessert,meringue,berries,elegant,special',
  },

  // ============================================
  // UNITED STATES (USD)
  // ============================================
  {
    id: 'us-1',
    title: 'Classic Burger with Fries',
    description: 'American classic - juicy beef burger with cheese, fresh toppings, and crispy fries.',
    cuisine: 'American',
    difficulty: 'easy',
    timeMins: 30,
    estimatedPrice: 12.00,
    currency: 'USD',
    kcal: 680,
    proteinG: 32,
    carbsG: 62,
    fatG: 32,
    fiberG: 3,
    sugarG: 8,
    sodiumMg: 1080,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    dietTags: 'high-protein',
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
    stepsMd: `1. Preheat grill or skillet to high heat
2. Form ground beef into patty, season with salt and pepper
3. Cook patty 3-4 minutes per side for medium
4. Add cheese in last minute of cooking
5. Toast buns lightly
6. Assemble: bottom bun, patty with cheese, tomato, lettuce, onion, pickles
7. Spread ketchup and mustard on top bun
8. Close burger
9. Serve with crispy fries on the side`,
    safetyMd: `**Food Safety Tips:**
- Ensure ground beef reaches internal temperature of 71°C (160°F)
- Use meat thermometer to check doneness
- Do not press burger while cooking (loses juices)
- Keep raw beef separate from other ingredients
- Wash hands and utensils after handling raw meat
- Do not allow cooked burger to sit unrefrigerated for more than 2 hours
- Store leftover beef in airtight container for up to 3 days`,
    tags: 'burger,beef,american,fast-food,classic',
  },
  {
    id: 'us-2',
    title: 'Mac and Cheese (Homemade)',
    description: 'Creamy, cheesy pasta comfort food - a true American favorite made from scratch.',
    cuisine: 'American',
    difficulty: 'easy',
    timeMins: 25,
    estimatedPrice: 8.00,
    currency: 'USD',
    kcal: 520,
    proteinG: 20,
    carbsG: 48,
    fatG: 24,
    fiberG: 2,
    sugarG: 4,
    sodiumMg: 680,
    imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4ee32510d8?w=400&h=300&fit=crop',
    dietTags: 'vegetarian',
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
    stepsMd: `1. Preheat oven to 200°C (400°F)
2. Cook pasta according to package, drain
3. Make roux: melt butter, add flour, cook 1 minute
4. Whisk in milk slowly to avoid lumps
5. Cook until thickened (3-4 minutes)
6. Remove from heat, add grated cheeses
7. Stir until melted and smooth
8. Combine cheese sauce with cooked pasta
9. Transfer to baking dish
10. Top with breadcrumbs mixed with butter
11. Bake for 15 minutes until golden
12. Serve hot`,
    safetyMd: `**Food Safety Tips:**
- Heat milk to prevent curdling in cheese sauce
- Ensure cheese is melted smoothly (do not overheat)
- Use fresh dairy products; check expiration dates
- Maintain proper stovetop temperature
- Store leftovers in airtight container for up to 3 days
- Reheat gently to prevent cheese from becoming grainy`,
    tags: 'pasta,cheese,comfort-food,creamy,baked',
  },
  {
    id: 'us-3',
    title: 'BBQ Ribs with Cornbread',
    description: 'Slow-cooked tender ribs with smoky BBQ sauce, served with sweet cornbread.',
    cuisine: 'American',
    difficulty: 'hard',
    timeMins: 180,
    estimatedPrice: 16.00,
    currency: 'USD',
    kcal: 640,
    proteinG: 42,
    carbsG: 45,
    fatG: 28,
    fiberG: 2,
    sugarG: 18,
    sodiumMg: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561231?w=400&h=300&fit=crop',
    dietTags: 'high-protein',
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
    stepsMd: `For Ribs:
1. Remove membrane from back of ribs
2. Apply dry rub generously
3. Preheat oven to 130°C (275°F)
4. Wrap ribs in foil, place on baking tray
5. Slow-cook for 2.5 hours
6. Remove foil, brush with BBQ sauce
7. Bake for 15 more minutes until caramelized

For Cornbread:
1. Preheat oven to 200°C (400°F)
2. Mix cornmeal, flour, baking powder
3. Whisk eggs, milk, melted butter together
4. Combine wet and dry ingredients
5. Pour into greased skillet
6. Bake 20-25 minutes until golden
7. Brush with honey while warm`,
    safetyMd: `**Food Safety Tips:**
- Ensure pork reaches internal temperature of 71°C (160°F)
- Use meat thermometer to verify doneness
- Do not leave cooked ribs at room temperature for more than 2 hours
- Store leftovers in airtight container for up to 3 days
- When reheating, ensure ribs reach 75°C (165°F)
- Use fresh eggs and dairy products
- Keep raw pork separate from other foods to prevent cross-contamination`,
    tags: 'ribs,BBQ,pork,slow-cooked,southern',
  },

  // ============================================
  // ADDITIONAL RECIPES
  // ============================================
  {
    id: 'extra-1',
    title: 'Som Tam (Papaya Salad)',
    description: 'Spicy and tangy green papaya salad with lime, chili, and peanuts',
    cuisine: 'Thai',
    difficulty: 'easy',
    timeMins: 10,
    estimatedPrice: 1.50,
    currency: 'USD',
    kcal: 220,
    proteinG: 8,
    carbsG: 18,
    fatG: 14,
    fiberG: 4,
    sugarG: 8,
    sodiumMg: 450,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    dietTags: 'vegan,low-carb',
    ingredientsJson: JSON.stringify([
      { name: 'Green papaya', qty: '300', unit: 'g', notes: 'shredded' },
      { name: 'Cherry tomatoes', qty: '100', unit: 'g' },
      { name: 'Long beans', qty: '50', unit: 'g' },
      { name: 'Garlic', qty: '3', unit: 'cloves' },
      { name: 'Thai chilies', qty: '2', unit: 'whole' },
      { name: 'Lime juice', qty: '3', unit: 'tbsp' },
      { name: 'Fish sauce', qty: '1', unit: 'tbsp' },
      { name: 'Palm sugar', qty: '1', unit: 'tsp' },
      { name: 'Peanuts', qty: '30', unit: 'g' },
    ]),
    stepsMd: `1. Pound garlic and chilies in mortar
2. Add palm sugar and pound lightly
3. Add long beans and tomatoes, gently bruise
4. Add shredded papaya and toss lightly
5. Add lime juice and fish sauce
6. Toss everything together
7. Top with crushed peanuts
8. Serve immediately`,
    safetyMd: `**Food Safety Tips:**
- Use green (unripe) papaya; not sweet papaya
- Wear gloves when handling green papaya (can cause skin irritation)
- Use fresh lime juice only
- Wash all vegetables thoroughly before use
- Consume immediately after preparation (papaya oxidizes quickly)
- Do not store; prepare fresh for each serving`,
    tags: 'salad,papaya,spicy,fresh,vegan',
  },
  {
    id: 'extra-2',
    title: 'Khao Pad (Fried Rice)',
    description: 'Thai-style fried rice with jasmine rice, eggs, and vegetables',
    cuisine: 'Thai',
    difficulty: 'easy',
    timeMins: 15,
    estimatedPrice: 2.00,
    currency: 'USD',
    kcal: 420,
    proteinG: 14,
    carbsG: 48,
    fatG: 16,
    fiberG: 2,
    sugarG: 2,
    sodiumMg: 720,
    imageUrl: 'https://images.unsplash.com/photo-1603894542802-f1dbc86e6461?w=400&h=300&fit=crop',
    dietTags: 'vegetarian-option',
    ingredientsJson: JSON.stringify([
      { name: 'Cooked jasmine rice', qty: '300', unit: 'g', notes: 'day old' },
      { name: 'Eggs', qty: '2', unit: 'whole' },
      { name: 'Onion', qty: '50', unit: 'g' },
      { name: 'Carrot', qty: '50', unit: 'g' },
      { name: 'Peas', qty: '50', unit: 'g' },
      { name: 'Garlic', qty: '2', unit: 'cloves' },
      { name: 'Soy sauce', qty: '2', unit: 'tbsp' },
      { name: 'Oil', qty: '2', unit: 'tbsp' },
      { name: 'Cilantro', qty: '10', unit: 'g' },
    ]),
    stepsMd: `1. Heat oil in wok or large pan over high heat
2. Add minced garlic, stir for 10 seconds
3. Push to side, crack eggs into pan, scramble
4. Break rice into individual grains
5. Add rice to wok, stir-fry continuously
6. Add vegetables and soy sauce
7. Mix thoroughly for 2-3 minutes
8. Top with fresh cilantro
9. Serve hot`,
    safetyMd: `**Food Safety Tips:**
- Use day-old cooked rice (fresh rice is too moist)
- Reheat rice to at least 75°C (165°F) to kill bacteria
- Use fresh vegetables; wash thoroughly
- Do not leave cooked fried rice at room temperature
- Store leftovers in airtight container for up to 3 days`,
    tags: 'rice,thai,vegetables,quick,comfort',
  },
  {
    id: 'extra-3',
    title: 'Massaman Curry',
    description: 'Rich and aromatic Thai curry with beef and peanuts',
    cuisine: 'Thai',
    difficulty: 'hard',
    timeMins: 60,
    estimatedPrice: 4.50,
    currency: 'USD',
    kcal: 520,
    proteinG: 28,
    carbsG: 35,
    fatG: 28,
    fiberG: 3,
    sugarG: 6,
    sodiumMg: 980,
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=400&h=300&fit=crop',
    dietTags: 'gluten-free',
    ingredientsJson: JSON.stringify([
      { name: 'Beef chuck', qty: '500', unit: 'g' },
      { name: 'Coconut milk', qty: '400', unit: 'ml' },
      { name: 'Massaman paste', qty: '3', unit: 'tbsp' },
      { name: 'Potatoes', qty: '200', unit: 'g' },
      { name: 'Peanuts', qty: '100', unit: 'g' },
      { name: 'Onion', qty: '100', unit: 'g' },
      { name: 'Tamarind paste', qty: '1', unit: 'tbsp' },
      { name: 'Fish sauce', qty: '1', unit: 'tbsp' },
      { name: 'Palm sugar', qty: '1', unit: 'tbsp' },
    ]),
    stepsMd: `1. Cut beef into cubes
2. Heat coconut milk in large pot
3. Add Massaman paste, stir well
4. Simmer for 5 minutes to develop flavor
5. Add beef and simmer for 30 minutes
6. Add potatoes and peanuts
7. Continue simmering for 20 minutes
8. Add tamarind paste, fish sauce, and palm sugar
9. Adjust seasoning to taste
10. Serve with rice`,
    safetyMd: `**Food Safety Tips:**
- Ensure beef reaches 71°C (160°F) internal temperature
- Maintain simmering temperature throughout cooking
- Do not leave curry unattended on heat
- Use proper ventilation (coconut milk can smoke)
- Store leftovers in airtight container for up to 3 days
- Reheat to 75°C (165°F) before serving`,
    tags: 'curry,beef,peanuts,aromatic,comfort',
  },
  {
    id: 'extra-4',
    title: 'Buddha Bowl',
    description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
    cuisine: 'American',
    difficulty: 'easy',
    timeMins: 25,
    estimatedPrice: 3.50,
    currency: 'USD',
    kcal: 420,
    proteinG: 15,
    carbsG: 48,
    fatG: 16,
    fiberG: 8,
    sugarG: 6,
    sodiumMg: 280,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    dietTags: 'vegan,high-fiber,gluten-free',
    ingredientsJson: JSON.stringify([
      { name: 'Cooked quinoa', qty: '150', unit: 'g' },
      { name: 'Sweet potato', qty: '150', unit: 'g' },
      { name: 'Broccoli', qty: '100', unit: 'g' },
      { name: 'Bell pepper', qty: '100', unit: 'g' },
      { name: 'Chickpeas (canned)', qty: '150', unit: 'g' },
      { name: 'Tahini', qty: '2', unit: 'tbsp' },
      { name: 'Lemon juice', qty: '2', unit: 'tbsp' },
      { name: 'Garlic', qty: '1', unit: 'clove' },
      { name: 'Water', qty: '3', unit: 'tbsp' },
    ]),
    stepsMd: `1. Cook quinoa according to package
2. Cube sweet potato, toss with oil, salt, pepper
3. Roast at 200°C for 15 minutes
4. Cut broccoli and bell pepper, roast for 10 minutes
5. Warm chickpeas in pan with spices
6. Make dressing: whisk tahini, lemon, garlic, water
7. Assemble bowl: quinoa base, arrange vegetables on top
8. Drizzle with tahini dressing
9. Top with fresh herbs
10. Serve warm or at room temperature`,
    safetyMd: `**Food Safety Tips:**
- Cook quinoa until fluffy, not mushy
- Roast vegetables until tender but still firm
- Drain and rinse canned chickpeas
- Make dressing fresh; do not store long-term
- Consume within 2 hours of assembly for best texture
- Store components separately if preparing ahead`,
    tags: 'bowl,vegetarian,vegan,healthy,nutritious',
  },
  {
    id: 'extra-5',
    title: 'Grilled Salmon with Asparagus',
    description: 'Omega-3 rich salmon with roasted asparagus and lemon butter',
    cuisine: 'American',
    difficulty: 'medium',
    timeMins: 30,
    estimatedPrice: 5.00,
    currency: 'USD',
    kcal: 480,
    proteinG: 38,
    carbsG: 8,
    fatG: 32,
    fiberG: 2,
    sugarG: 1,
    sodiumMg: 420,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    dietTags: 'high-protein,keto-friendly',
    ingredientsJson: JSON.stringify([
      { name: 'Salmon fillet', qty: '300', unit: 'g' },
      { name: 'Asparagus', qty: '200', unit: 'g' },
      { name: 'Lemon', qty: '1', unit: 'whole' },
      { name: 'Butter', qty: '30', unit: 'g' },
      { name: 'Garlic', qty: '2', unit: 'cloves' },
      { name: 'Dill', qty: '5', unit: 'g' },
      { name: 'Olive oil', qty: '2', unit: 'tbsp' },
      { name: 'Salt', qty: '1', unit: 'tsp' },
      { name: 'Black pepper', qty: '1', unit: 'tsp' },
    ]),
    stepsMd: `1. Preheat grill or pan to medium-high
2. Pat salmon dry with paper towels
3. Toss asparagus with oil, salt, pepper
4. Place salmon skin-side up on grill
5. Cook 4-5 minutes, flip once, cook another 3-4 minutes
6. Grill asparagus alongside for 8-10 minutes
7. Make lemon butter: melt butter with garlic
8. Top salmon with lemon butter and dill
9. Squeeze fresh lemon juice
10. Serve immediately with asparagus`,
    safetyMd: `**Food Safety Tips:**
- Use fresh salmon; check for firm texture and no fishy smell
- Cook salmon to 63°C (145°F) internal temperature
- Do not cross-contaminate with other foods
- Keep raw salmon on separate cutting board
- Use separate utensils for raw and cooked salmon
- Consume within 2 hours of cooking or refrigerate immediately`,
    tags: 'fish,salmon,healthy,grilled,protein',
  },
  {
    id: 'extra-6',
    title: 'Laksa (Spicy Noodle Soup)',
    description: 'Malaysian spicy coconut milk-based noodle soup with seafood',
    cuisine: 'Malaysian',
    difficulty: 'hard',
    timeMins: 50,
    estimatedPrice: 3.75,
    currency: 'USD',
    kcal: 450,
    proteinG: 20,
    carbsG: 40,
    fatG: 20,
    fiberG: 3,
    sugarG: 4,
    sodiumMg: 1050,
    imageUrl: 'https://images.unsplash.com/photo-1618164436241-4473940571cd?w=400&h=300&fit=crop',
    dietTags: 'seafood',
    ingredientsJson: JSON.stringify([
      { name: 'Rice noodles', qty: '200', unit: 'g' },
      { name: 'Shrimp', qty: '200', unit: 'g' },
      { name: 'Squid', qty: '100', unit: 'g' },
      { name: 'Fish stock', qty: '1000', unit: 'ml' },
      { name: 'Coconut milk', qty: '200', unit: 'ml' },
      { name: 'Laksa paste', qty: '4', unit: 'tbsp' },
      { name: 'Ginger', qty: '2', unit: 'tbsp' },
      { name: 'Cilantro', qty: '20', unit: 'g' },
      { name: 'Bean sprouts', qty: '100', unit: 'g' },
    ]),
    stepsMd: `1. Bring fish stock to boil
2. Add laksa paste and ginger, simmer 5 minutes
3. Add coconut milk, stir well
4. Add shrimp and squid, simmer 5 minutes
5. Cook rice noodles separately, drain
6. Place noodles in serving bowls
7. Ladle hot laksa broth over noodles
8. Top with bean sprouts and cilantro
9. Serve immediately with lime and chili
10. Add extra paste or chili to taste`,
    safetyMd: `**Food Safety Tips:**
- Use fresh seafood; store at proper temperature
- Ensure shrimp and squid are fully cooked (opaque)
- Maintain broth at boiling temperature during cooking
- Do not let soup sit at room temperature
- Use fresh bean sprouts; consume same day as package opening
- Keep cilantro fresh; wash thoroughly before use`,
    tags: 'soup,laksa,seafood,spicy,malaysian',
  },
];

export async function GET() {
  try {
    return NextResponse.json(sampleRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}
