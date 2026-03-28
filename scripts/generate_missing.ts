import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function run() {
  const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
  });
  
  const prompt = `Generate exactly 15 unique, world-class chef-style recipes from diverse global cuisines.
  Do NOT repeat these: Samlor Korko, Khao Soi, Bánh Cuốn, Cá Kho Tộ, Pleah Sach Ko, Miso Ramen, Sushi, Okonomiyaki, Chicken Tikka, Palak Paneer, Butter Chicken, Carbonara, Lasagna, Risotto, Tacos, Enchiladas, Chiles Rellenos, Ratatouille, Coq au Vin, Moussaka, Spanakopita, Kung Pao, Mapo Tofu, Dim Sum, Paella, Falafel, Shakshuka, Shawarma, Brisket, Clam Chowder, Pizza, Gazpacho, Feijoada, Tagine, Bibimbap.

  Return JSON array of 15 objects: 
  { "title": "string", "description": "string", "cuisine": "string", "dietTags": "string", "difficulty": "easy|medium|hard", "timeMins": 45, "estimatedPrice": 15, "kcal": 500, "proteinG": 30, "carbsG": 40, "fatG": 20, "ingredientsJson": "stringified array", "stepsMd": "numbered steps", "imagePrompt": "string" }
  Return ONLY the JSON.`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    fs.writeFileSync('scripts/batch_4.json', text);
    console.log('Successfully saved 15 recipes to scripts/batch_4.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
