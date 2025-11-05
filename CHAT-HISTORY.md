# Chat History - Project Creation

## Project Request
User requested a Next.js 14+ (App Router) project in TypeScript for an "AI Meal Plan & Recipe" web app.

## Requirements Summary

### Tech Stack
- Framework: Next.js 14+ with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Prisma with SQLite
- AI: Anthropic Claude API
- No authentication (single user MVP)

### Core Features
1. **Onboarding** - Dietary preferences (balanced, vegetarian, vegan, pescatarian, halal, budget, time)
2. **AI Meal Planning** - Generate 7-day SEA-friendly meal plans
3. **Recipe Browser** - Filter by cuisine, diet, time, price, macros
4. **Recipe Details** - Images, ingredients, steps, nutrition, food safety
5. **Grocery List** - Grouped by SEA market sections
6. **Recipe Import** - Import from URL with normalization

### Environment Variables
```env
ANTHROPIC_API_KEY=your_key_here
AI_MODEL=claude-3-5-sonnet-20241022
NEXT_PUBLIC_APP_NAME="eatr-vibe"
DATABASE_URL="file:./dev.db"
```

### Database Schema (Prisma)
- **User** - id, email, name, createdAt
- **Preference** - userId, nutrition targets, diet flags, allergens, dislikes, cuisines, time/budget, equipment, region, currency
- **Recipe** - title, description, cuisine, diet tags, difficulty, time, price, macros, ingredients (JSON), steps (markdown), safety, image, source
- **Plan** - userId, weekStart, weekEnd, createdAt
- **PlanMeal** - planId, dateISO, slot (breakfast/lunch/dinner/dessert), recipeId, notes

### API Routes Created
1. `GET/POST /api/preferences` - User preferences
2. `POST /api/ai/plan` - Generate meal plan with AI
3. `GET /api/recipes` - List recipes with filters
4. `GET /api/recipes/[id]` - Recipe detail
5. `POST /api/recipes/import` - Import recipe from URL
6. `GET /api/plans/latest` - Get latest meal plan

### Pages Created
1. `/` - Home/landing page
2. `/setup` - Onboarding preferences form
3. `/planner` - 7-day meal calendar
4. `/recipes` - Recipe browser with filters
5. `/recipes/[id]` - Recipe detail page
6. `/groceries` - Grouped shopping list

### Components Created
- `Button.tsx` - Styled button component
- `Card.tsx` - Card container
- `Input.tsx` - Text input with label
- `Select.tsx` - Dropdown select

### AI Integration (lib/ai.ts)
- Function: `generateMealPlan(profile, range)`
- System prompt enforces JSON-only output
- Strict dietary compliance (halal, vegan, vegetarian)
- Retry logic for malformed JSON
- Returns 7-day meal plan with:
  - Daily meals (breakfast, lunch, dinner, dessert)
  - Ingredients, steps, macros for each meal
  - Shopping list grouped by SEA market sections
  - Rationale for meal choices

### Special Requirements Implemented
✅ Halal flag strictly enforced (no pork, alcohol)
✅ Vegetarian flag (no meat, fish)
✅ Vegan flag (no animal products)
✅ Allergen avoidance
✅ Dislikes tracking
✅ SEA cuisine focus (Cambodian, Thai, Vietnamese)
✅ Time budget constraints
✅ Budget levels (low, medium, high)
✅ Equipment constraints
✅ Region/currency support (KH/KHR, AU/AUD, etc.)
✅ Food safety information
✅ Responsive Tailwind design

## Project Creation Process

1. **Initial Setup** - Created package.json, tsconfig.json, Next.js config, Tailwind config
2. **Database** - Created Prisma schema with all required models
3. **AI Service** - Implemented Claude integration with proper prompting
4. **API Routes** - Built all backend endpoints
5. **Components** - Created reusable UI components
6. **Pages** - Built all frontend pages with full functionality
7. **Documentation** - Created README and setup guides

## Final Delivery

Created clean project folder at:
`C:\Users\Kualar\Documents\eatr-vibe-app`

Included documentation:
- START-HERE.txt - Quick start guide
- SETUP.txt - Detailed setup instructions
- COMMANDS.txt - Command reference
- FOLDER-GUIDE.txt - Folder structure explanation
- README.md - Technical documentation
- This file - CHAT-HISTORY.md

## User Notes

User expressed confusion with multiple files in working directory. Solution: Created brand new clean folder with only necessary project files, no clutter.

## Next Steps for User

1. Open Terminal in `eatr-vibe-app` folder
2. Run `npm install`
3. Create `.env.local` with Anthropic API key
4. Run `npm run db:push`
5. Run `npm run dev`
6. Visit http://localhost:3000

---
Generated: November 4, 2025
Project: eatr-vibe - AI Meal Plan & Recipe App
