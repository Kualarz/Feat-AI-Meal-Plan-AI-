import Anthropic from '@anthropic-ai/sdk';

export interface LeftoverRecipeSuggestion {
  title: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_mins: number;
  ingredients_used: string[];
  additional_items_needed: string[];
  steps: string;
  why: string;
  image_url?: string;
}

export interface LeftoverRecipesResponse {
  suggestions: LeftoverRecipeSuggestion[];
  rationale: string;
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generateLeftoverRecipes(
  leftoverIngredients: string[],
  currency: string = 'USD'
): Promise<LeftoverRecipesResponse> {
  const userMessage =
    `I have these leftover ingredients: ${leftoverIngredients.join(', ')}\n\n` +
    `Please suggest 3-5 creative Southeast Asian recipes I can make using mostly these ingredients.\n` +
    `Minimize the number of additional items needed.\n` +
    `Currency for pricing: ${currency}`;

  const systemPrompt =
    `You are a creative home chef specializing in Southeast Asian cuisine.\n` +
    `User has these leftover ingredients and wants to use them in recipes.\n\n` +
    `IMPORTANT: Output ONLY valid JSON, no markdown, no explanations.\n\n` +
    `Return JSON in this exact format:\n` +
    `{"suggestions": [{"title": "Recipe Name", "cuisine": "Thai/etc", "difficulty": "easy/medium/hard", ` +
    `"time_mins": 30, "ingredients_used": ["ing1"], "additional_items_needed": ["item1"], ` +
    `"steps": "1. Step one\\n2. Step two", "why": "Why this recipe"}], ` +
    `"rationale": "Why I suggested these recipes"}`;

  try {
    const message = await client.messages.create({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    let jsonText = content.text.trim();
    // Handle markdown code blocks
    if (jsonText.includes('```')) {
      const parts = jsonText.split('```');
      jsonText = parts.length > 1 ? parts[1] : parts[0];
      if (jsonText.startsWith('json')) {
        jsonText = jsonText.substring(4);
      }
    }
    jsonText = jsonText.trim();

    const result = JSON.parse(jsonText) as LeftoverRecipesResponse;

    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error('Invalid response structure: missing suggestions array');
    }

    return result;
  } catch (error) {
    console.error('Leftover recipe generation error:', error);

    if (error instanceof SyntaxError) {
      console.log('Retrying leftover recipe request...');
      const retryMessage = await client.messages.create({
        model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON, nothing else.',
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const retryContent = retryMessage.content[0];
      if (retryContent.type !== 'text') {
        throw new Error('Unexpected response type from AI on retry');
      }

      let retryJsonText = retryContent.text.trim();
      if (retryJsonText.includes('```')) {
        const parts = retryJsonText.split('```');
        retryJsonText = parts.length > 1 ? parts[1] : parts[0];
        if (retryJsonText.startsWith('json')) {
          retryJsonText = retryJsonText.substring(4);
        }
      }
      retryJsonText = retryJsonText.trim();

      return JSON.parse(retryJsonText) as LeftoverRecipesResponse;
    }

    throw error;
  }
}
