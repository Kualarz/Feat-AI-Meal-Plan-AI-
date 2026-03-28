# Implementation Plan — Recipe Discovery, Collections & Navigation
**Date:** 2026-03-27
**Spec:** `2026-03-27-recipe-discovery-collections-design.md`

---

## Phase 1 — Navigation Redesign
*Affects every page. Do this first so later phases render correctly.*

- [ ] Rewrite `components/MainNavigation.tsx` from vertical `<aside>` to horizontal `<header>`
- [ ] Add `<MainNavigation />` to `app/layout.tsx` above `{children}`
- [ ] Remove `<MainNavigation />` and sidebar layout wrappers from all individual pages that currently include it

---

## Phase 2 — Database Schema
*Must be done before any new API work.*

- [ ] Add `CuratedCollection` model to `prisma/schema.prisma`
- [ ] Make `PlanMeal.dayOfWeek` optional (`Int?`)
- [ ] Add `"queue"` as valid value for `PlanMeal.slot` (update any validation)
- [ ] Run `prisma migrate dev`

---

## Phase 3 — New API Endpoints

- [ ] `GET /api/curated-collections` — return all cached curated collections with recipe objects
- [ ] `POST /api/curated-collections/generate` — call Claude, group recipes into 3–5 themed collections, save to DB
- [ ] `POST /api/plan/queue` — add recipe to current week's plan as `slot: "queue"`, `dayOfWeek: null`
- [ ] `PATCH /api/plan/queue/[id]` — promote a queued meal to a real slot + dayOfWeek (used when dragging from queue to planner)

---

## Phase 4 — New Components

- [ ] `components/RecipeCard.tsx` — extract from `app/recipes/page.tsx`, add `+` button and save icon with popover
- [ ] `components/CollectionPickerModal.tsx` — bottom sheet, search, list collections, create new
- [ ] `components/CuratedCollectionRow.tsx` — emoji + title + tagline + horizontal scroll strip of RecipeCards
- [ ] `components/FilterBar.tsx` — sticky search input + horizontal filter pill strip with per-pill dropdowns

---

## Phase 5 — Recipes Page Wiring

- [ ] Replace inline card JSX with `<RecipeCard />` in `app/recipes/page.tsx`
- [ ] Add `<FilterBar />` below navbar (sticky), remove sidebar
- [ ] Fetch curated collections on load, render `<CuratedCollectionRow />` components above grid
- [ ] Make `<FilterBar />` sticky below navbar

---

## Phase 6 — Planner Queue

- [ ] Fetch `slot: "queue"` PlanMeals in `app/planner/page.tsx`
- [ ] Render collapsible horizontal queue panel at top of planner
- [ ] Wire drag-from-queue → drop-on-slot to call `PATCH /api/plan/queue/[id]`
- [ ] Hide panel when queue is empty

---

## Build Order Summary

```
Phase 1 (Nav) → Phase 2 (DB) → Phase 3 (APIs) → Phase 4 (Components) → Phase 5 (Recipes Page) → Phase 6 (Planner Queue)
```
