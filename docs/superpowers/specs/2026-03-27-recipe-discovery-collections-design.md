# Recipe Discovery, Collections & Planner Queue — Design Spec
**Date:** 2026-03-27
**Status:** Approved
**Reference:** Zest app UX patterns

---

## Overview

Redesign the recipe browse experience to add:
1. AI-generated curated collection rows above the filter grid
2. A redesigned recipe card with `+` (quick queue) and save icon (context menu) buttons
3. A collection picker modal for organizing saved recipes into user folders
4. A recipe queue/staging area on the planner page

---

## 1. Database Schema Changes

### New model: `CuratedCollection`

```prisma
model CuratedCollection {
  id          String   @id @default(cuid())
  title       String
  emoji       String
  tagline     String
  recipeIds   String[]
  generatedAt DateTime @default(now())
}
```

- No `userId` — global/editorial, not user-owned
- `recipeIds` is an ordered array of recipe IDs
- Regenerated on demand via admin trigger (not on every page load)

### Modified model: `PlanMeal`

Add `"queue"` to the slot enum and make `dayOfWeek` optional:

```prisma
slot      String  // "breakfast" | "lunch" | "dinner" | "dessert" | "queue"
dayOfWeek Int?    // null when slot = "queue"
```

Queue recipes live inside the existing `PlanMeal` table — no separate model needed.

---

## 2. New Components

### `components/RecipeCard.tsx`
Extracted from `app/recipes/page.tsx`. Self-contained recipe card with:
- Full-bleed food photo with hover zoom
- Recipe name + metadata below
- **Top-left:** `+` button — one-tap add to planner queue
- **Top-right:** Heart icon (like) + Save icon (bookmark) side by side
- Save icon click opens a small popover with two options:
  - "Add to Collection" → opens `CollectionPickerModal`
  - "Add to Plan" → same as `+`, sends to queue with toast confirmation
- All buttons appear on hover (desktop); always visible on mobile breakpoint

### `components/CollectionPickerModal.tsx`
Bottom sheet modal for assigning a recipe to a user collection:
- Header: "Save to Collection" title + orange "+ New" button
- Search input to filter collections
- List rows: collection thumbnail (first recipe image), name, recipe count, `+` to add
- Closes on selection with a success toast
- Reusable — invoked from `RecipeCard`, `SavedRecipes` page, or anywhere a recipe needs collection assignment

### `components/CuratedCollectionRow.tsx`
One themed editorial row:
- Left: emoji + bold title + italic tagline
- Right: "→" arrow link (navigates to filtered view)
- Horizontally scrollable strip of `RecipeCard` components
- Cards slightly cut off on right edge to signal scrollability
- Accepts `{ title, emoji, tagline, recipes[] }` as props

---

## 3. New API Endpoints

### `POST /api/curated-collections/generate`
- Auth required (any authenticated user)
- Fetches all recipes from DB
- Calls Claude with recipe list, asks it to group into 3–5 themed collections with emoji, title, tagline, and ordered recipe IDs
- Saves results to `CuratedCollection` table (clears old rows first)
- Returns the generated collections

### `GET /api/curated-collections`
- No auth required (public read)
- Returns all `CuratedCollection` rows with full recipe objects populated
- Called on `app/recipes/page.tsx` load

### `POST /api/plan/queue`
- Auth required
- Body: `{ recipeId: string }`
- Finds or creates the current week's `Plan` for the user
- Creates a `PlanMeal` with `slot: "queue"`, `dayOfWeek: null`
- Returns the created `PlanMeal`

---

## 4. Modified Files

### `app/recipes/page.tsx`
- Fetch curated collections from `GET /api/curated-collections` on load
- Render 3–5 `<CuratedCollectionRow>` components above the filter sidebar + grid
- Replace all inline recipe card JSX with `<RecipeCard>` component
- Remove old bookmark/save inline logic (now lives in `RecipeCard`)

### `app/planner/page.tsx`
- Add a collapsible horizontal queue panel at the top of the page
- Fetch `PlanMeal` records with `slot: "queue"` for the current week
- Render as horizontally scrollable `RecipeCard` strip with drag handles
- Dragging a queued card onto a day/slot updates `slot` + `dayOfWeek` via PATCH
- Panel hidden when queue is empty

### `prisma/schema.prisma`
- Add `CuratedCollection` model
- Make `PlanMeal.dayOfWeek` optional (`Int?`)
- Add `"queue"` as a valid slot value (update any enum or validation)

---

## 5. UI & Interaction Summary

| Interaction | Result |
|---|---|
| Click `+` on recipe card | Recipe added to planner queue, toast shown |
| Click save icon on recipe card | Popover opens: "Add to Collection" / "Add to Plan" |
| Click "Add to Collection" | `CollectionPickerModal` opens |
| Select collection in modal | Recipe assigned to collection, modal closes, toast shown |
| Click "New" in modal | Inline input to create new collection, then assign |
| Click "Add to Plan" in popover | Same as `+`, adds to queue |
| Drag recipe from planner queue | Drop onto day/slot to move from queue to plan |
| Click "→" on curated row | Navigates to filtered recipe browse |

---

## 6. Search Bar & Filter Redesign

Replace the current sidebar filter layout with a horizontal top bar:

**Search bar (full width, top)**
- Persistent search input spanning the full page width
- Rounded pill shape, light background, search icon on left, clear `×` button when text is present
- Filters results in real time (debounced)

**Filter pill strip (below search bar)**
- Horizontally scrollable row of pill buttons, each with an icon + label:
  - ⏰ Time
  - 🥕 Main Ingredient
  - 🌍 Cuisine
  - 🍽️ Dish Type
  - 💪 Nutrition
- Tapping a pill opens a dropdown/popover with that filter's options (replaces sidebar panels)
- Active filters show a filled/accent-colored pill with a count badge (e.g. "Cuisine · 2")
- A "Clear all" pill appears at the end when any filter is active

**Layout change**
- Remove the left sidebar entirely
- Recipe grid becomes full-width below the search + pill strip
- Curated collection rows sit between the pill strip and the full grid
- Search bar + filter pill strip are `position: sticky`, pinned just below the top navbar (e.g. `top: [navbar height]`) so they remain visible while scrolling through recipes and curated rows

### New component: `components/FilterBar.tsx`
Accepts current filter state + onChange callbacks. Self-contained — renders search input + pill strip + per-pill dropdown popovers.

---

## 7. Navigation Redesign

Replace the per-page vertical sidebar with a single sticky horizontal top navbar in `app/layout.tsx`.

### Layout structure
```
[ 🍽 Feast AI ]  [ Dashboard ] [ Recipes ] [ Planner ] [ Groceries ] [ Leftovers ]          [ ⚙️ Settings ]
```
- **Left:** Logo mark + "Feast AI" wordmark
- **Left (after logo):** Nav links in a row — Dashboard, Recipe Browser, Meal Planner, Shopping List, Leftovers
- **Right:** Settings icon/link + Theme toggle
- `position: sticky`, `top: 0`, `z-index` above page content
- `bg-card` background with `border-b border-border` separator
- Active link uses `bg-accent text-accent-foreground` pill, same style as current sidebar
- Hover state: `hover:bg-brand-orange-tint hover:text-accent` (matches current sidebar hover)

### Files changed
- `components/MainNavigation.tsx` — rewritten from `<aside>` vertical to `<header>` horizontal
- `app/layout.tsx` — `<MainNavigation />` added once here, above `{children}`
- All individual pages that currently render `<MainNavigation />` as a sidebar — remove it and remove the sidebar layout wrapper (usually a flex row with `w-64` sidebar + main content)

---

## 8. Out of Scope

- Admin panel for manually editing curated collections
- Push notifications when queue is dragged
- Sharing collections with other users
- Reordering collections on the recipes page
