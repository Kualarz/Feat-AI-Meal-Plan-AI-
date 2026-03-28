import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log('API Key exists:', !!key);
console.log('API Key prefix:', key?.substring(0, 5));

const genAI = new GoogleGenerativeAI(key || '');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('Response:', result.response.text());
  } catch (e: any) {
    console.error('Error Status:', e.status);
    console.error('Error Message:', e.message);
    if (e.response) {
      console.error('Error Response:', await e.response.text());
    }
  }
}

test();
