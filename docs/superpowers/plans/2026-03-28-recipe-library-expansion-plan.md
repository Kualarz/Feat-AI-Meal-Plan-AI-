# Recipe Library Expansion & Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand recipe library to 50+ dishes with "Chef-style" detail and AI-generated imagery, while fixing UI tag duplication and button functions.

**Architecture:** Use a Node.js utility script with Prisma to batch-generate and update recipe records via Gemini for text and `generate_image` for visuals. UI changes focus on consolidating tags into the Hero section with premium styling.

**Tech Stack:** Next.js, Prisma, Tailwind CSS, Lucide React, Gemini AI, `generate_image` tool.

---
## Task 1: UI Tag Deduplication & Premium Styling

**Files:**
- Modify: `app/recipes/[id]/page.tsx`

- [x] **Step 1: Consolidate tags in the Hero section**
  Move the diet tags from the "About the Dish" sub-section into the Hero overlay.
- [x] **Step 2: Apply "Green Pill + Checkmark" style**
  Update the Tailwind classes to match the premium About-section style.
- [x] **Step 3: Remove redundant tag rendering in the Body**
  Delete the `dietList` rendering block below the description.

## Task 2: Interaction Button Repair

**Files:**
- Modify: `app/recipes/[id]/page.tsx`
- Modify: `components/AddToPlannerModal.tsx`

- [ ] **Step 1: Fix Share Button Fallback**
  Add a `try...catch` and `navigator.clipboard.writeText` fallback if `navigator.share` fails or is unavailable.
- [x] **Step 1: Fix Share Button Fallback**
- [x] **Step 2: Secure Like/Save State**
  Ensure handlers check for `localStorage.getItem('token')` and handle 401/403 errors by optionally redirecting to `/auth/signin`.
- [x] **Step 3: Verify Add to Plan Props**
  Ensure the `recipeName` prop in `AddToPlannerModal` is correctly used in the success toast message.


## Task 3: Batch Generation & Enhancement Script

**Files:**
- Create: `scripts/batch-enhance-recipes.ts`
- Modify: `package.json` (add runner script)

- [ ] **Step 1: Scaffold the expansion script**
  Create a script that initializes Prisma and defines a "Chef Upgrade" prompt template.
- [ ] **Step 2: Implement "Diverse Cuisine" Generator**
  Generate 25+ new recipe records with diverse global origins (e.g., Cambodian, Thai, Vietnamese, Korean, Italian, Mexican).
- [ ] **Step 3: Implement Content "Enhancer"**
  Update existing records with storytelling descriptions, ingredient descriptions, and detailed "peel-and-grind" instructions.
- [ ] **Step 4: Integrate AI Image Generation**
  For each missing image, use `generate_image` with a descriptive prompt (e.g., "Professional studio food photography, top-down view of [title], vibrant colors, rustic wooden table").
- [ ] **Step 5: Persist to Database**
  Save all changes via `prisma.recipe.upsert` or `update`.


## Task 4: Execution & Final Audit

- [ ] **Step 1: Execute the Batch Script**
  Run `npx tsx scripts/batch-enhance-recipes.ts` and monitor logs for completion.
- [ ] **Step 2: Visual Verification**
  Manually check 5 random recipes for:
  - Correct tag styling in Hero.
  - Presence of detailed "peel-and-paste" steps.
  - High-quality dish image.
- [ ] **Step 3: Interaction Test**
  Verify Like/Save/Plan buttons work as expected on the newly generated recipes.
