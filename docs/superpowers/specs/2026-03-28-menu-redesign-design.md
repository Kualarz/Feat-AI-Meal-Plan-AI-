# Menu Page Redesign — Design Spec
**Date:** 2026-03-28
**Status:** Approved

---

## Overview

Rename the Planner feature to **Menu** throughout the app (route, nav labels, page title). Redesign the page with a Zest-inspired vertical-day calendar, a Queue staging area with a single holo-plus add button, rich recipe chips, and a custom date-range selector.

---

## 1. Route & Navigation Rename

| Location | Before | After |
|---|---|---|
| Route | `/planner` | `/menu` |
| `app/planner/page.tsx` | (existing file) | Move to `app/menu/page.tsx` |
| `app/planner/page.tsx` | — | Replace with redirect → `/menu` |
| `components/Navbar.tsx` | href `/planner`, label "Planner" | href `/menu`, label "Menu" |
| `components/MainNavigation.tsx` | href `/planner`, label "Meal Planner" | href `/menu`, label "Menu" |

---

## 2. Page Layout

```
┌─────────────────────────────────────────┐
│  Global Navbar (sticky top-0)           │
├─────────────────────────────────────────┤
│  Page header (sticky top-16)            │
│  "My Menu"   [From Mar 28 → To Apr 3]  🛒│
├─────────────────────────────────────────┤
│  Queue strip                            │
│  [🍝 chip] [🥗 chip] [＋ holo button]  │
├─────────────────────────────────────────┤
│  Vertical calendar (scrollable)         │
│  [Mon 28] [🍝 chip] [🥗 chip] [⊕ drop] │
│  [Tue 29] [drag recipes here …]         │
│  [Wed 30] [🍲 chip] [⊕ drop]           │
│  …                                      │
└─────────────────────────────────────────┘
```

### Page header
- Title: "My Menu" (font-display, large)
- Date range picker: two pill inputs side by side — **From** date and **To** date. Tapping either opens a native date picker (`<input type="date">`). Defaults to today → today + 6 days.
- Shopping List button (links to `/groceries?planId=…`)
- The header is `sticky top-16` (below global Navbar)

---

## 3. Queue Strip

- Always visible below the page header
- Label: "Queue" + item count badge when non-empty
- Hint text: "drag onto a day below ↓"
- Horizontal scroll row of recipe chips (same chip design as calendar, see §5)
- **Single holo-plus button** at the end of the row:
  - Visual: dashed green border square (`border-2 border-dashed border-accent`), `＋` icon, "Add" label below
  - On click: a small popover appears above the button with two options:
    - 📚 **Library** — opens the Recipe Picker in `savedOnly` mode
    - 📖 **Browse** — opens the Recipe Picker in browse-all mode
  - Clicking outside the popover closes it
- Removing a recipe from the queue removes it from `queueRecipes` state (no API call)

---

## 4. Calendar

### Structure
- **Vertical layout**: each day is a horizontal row
- **Rows**: day label column (left, fixed width ~48px) + free-form recipe zone (right, flex)
- The calendar scrolls vertically; the queue strip remains sticky

### Day label column
- Shows: short day name (Mon/Tue…), date number (large, bold), month abbreviation
- Today's row: green background (`bg-accent`), white text
- Other days: light grey background, dark text

### Date range
- Driven by the From/To date picker in the header
- Renders one row per day from From date to To date (inclusive)
- No minimum or maximum enforced beyond From ≤ To
- Default: today to today + 6 (7 days)

### Recipe zone (per day)
- A horizontally scrollable flex row
- **No fixed slots** (no breakfast/lunch/dinner). Any number of recipes can be dropped into a day.
- When empty: dashed border, centred "Drag recipes here" placeholder
- When recipes present: chips flow left-to-right; a `⊕ drop here` ghost tile appears at the end as the next drop target
- Drag-over state: zone border turns accent-coloured, slight scale-up

### Drag and drop
- Source: recipe chips in the Queue strip (`draggable`)
- Target: any day's recipe zone
- On drop: recipe is added to that day in state and persisted via `POST /api/plans/:id/meals`
- `slot` value sent to API: `"any"` (since there are no fixed slots)
- A recipe can be dropped into the same day multiple times (duplicate entries allowed)
- Removing a chip from a day calls `DELETE /api/plans/:id/meals/:mealId`

---

## 5. Recipe Chip Design

Used in both the Queue strip and inside day rows.

### Anatomy (width ~112px)
```
┌──────────────────────┐
│ [DietBadge]    [✕]  │  ← image area (h ~62px)
│   recipe image       │
├──────────────────────┤
│ Recipe Title         │
│ [🇮🇹 Italian] [🔥520]│
└──────────────────────┘
```

- **Image**: fills top half; falls back to emoji placeholder on null
- **Diet badge** (top-left of image): coloured pill with icon + short label. Derived from `recipe.dietTags` (CSV field — use the first tag). If `dietTags` is null/empty, badge is omitted. Colours:

| Diet | Colour | Icon |
|---|---|---|
| Vegetarian | `#22c55e` green | 🥦 |
| Vegan | `#16a34a` deep green | 🌱 |
| Halal | `#7c3aed` purple | 🕌 |
| Pescatarian | `#0ea5e9` sky blue | 🐟 |
| Keto | `#f59e0b` amber | 🥑 |
| High Protein | `#f97316` orange | 💪 |
| Omnivore / default | `#6b7280` grey | 🍖 |

- **✕ remove button** (top-right of image): small dark circle, removes chip from queue or day
- **Title**: 2-line clamp, font-display, 8.5px
- **Country tag** (bottom-left): flag emoji + `recipe.cuisine` text, grey pill
- **Calorie count** (bottom-right): 🔥 + `recipe.kcal` in orange
- **Entire chip is a `<Link href="/recipes/[id]">`** — navigating to the recipe detail page. The ✕ button stops propagation so removing doesn't navigate.
- In the Queue: chip has a subtle `cursor-grab` / `active:cursor-grabbing`
- In day rows: chip is not draggable (already placed); only removable

---

## 6. Recipe Picker Modal

Unchanged from current implementation. Opened via the holo-plus popover. On confirm, selected recipes are added to `queueRecipes` state.

---

## 7. API Mapping

| Action | API call |
|---|---|
| Load / create plan | `POST /api/plans` |
| Add meal to day | `POST /api/plans/:id/meals` body: `{ recipeId, dateISO, slot: "any" }` |
| Remove meal from day | `DELETE /api/plans/:id/meals/:mealId` |
| Load plan for date range | Use existing plan; filter `meals` by dateISO in range |

The `slot` field is sent as `"any"` since the new design has no fixed breakfast/lunch/dinner slots. The existing Prisma schema accepts any string for `slot`.

---

## 8. State

```ts
const [plan, setPlan]               // Plan | null — from API
const [queueRecipes, setQueue]       // Recipe[] — staged, not yet placed
const [pickerMode, setPickerMode]    // 'library' | 'browser' | null
const [addPopoverOpen, setPopover]   // boolean — holo-plus popover
const [dragging, setDragging]        // Recipe | null
const [dragOver, setDragOver]        // string | null — dateISO key
const [fromDate, setFromDate]        // string — ISO date
const [toDate, setToDate]            // string — ISO date
```

---

## 9. Files Changed

| File | Change |
|---|---|
| `app/menu/page.tsx` | New — full redesigned Menu page |
| `app/planner/page.tsx` | Replace with `redirect('/menu')` |
| `components/Navbar.tsx` | Update href + label: Planner → Menu |
| `components/MainNavigation.tsx` | Update href + label: Meal Planner → Menu |

No schema changes required.
