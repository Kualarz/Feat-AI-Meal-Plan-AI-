# eatr-vibe - AI Meal Plan & Recipe App

Generate personalized 7-day meal plans with AI featuring Southeast Asian cuisine.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create `.env.local` file:
```env
ANTHROPIC_API_KEY=your_anthropic_key_here
AI_MODEL=claude-3-5-sonnet-20241022
NEXT_PUBLIC_APP_NAME="eatr-vibe"
DATABASE_URL="file:./dev.db"
```

Get your API key from: https://console.anthropic.com/

### 3. Set Up Database
```bash
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## Features

- AI-powered 7-day meal plans
- Cambodian, Thai, Vietnamese recipes
- Halal, vegetarian, vegan support
- Allergen tracking
- Smart grocery lists
- Recipe browser with filters

## How to Use

1. Click "Get Started"
2. Fill in your preferences (calories, diet, allergens, etc.)
3. Go to Planner and click "Generate Plan"
4. Browse your 7-day meal plan
5. Check grocery list for shopping

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Anthropic Claude AI

## Support

For issues, check the console logs or verify your API key is set correctly.
