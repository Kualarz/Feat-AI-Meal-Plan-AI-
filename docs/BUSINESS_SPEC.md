# FEAST AI — Project Source of Truth
> **Document Type:** Consultant-Ready Business & Technical Specification
> **Version:** 1.0
> **Date:** 2026-03-26
> **Prepared by:** Claude Code (Senior Solutions Architect mode)
> **Status:** Living document — update after every sprint

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Business Context & Ventures](#2-business-context--ventures)
3. [Technical Architecture](#3-technical-architecture)
4. [Current Feature Inventory](#4-current-feature-inventory)
5. [Business Value Proposition](#5-business-value-proposition)
6. [AI Agent Architecture](#6-ai-agent-architecture)
7. [3-Phase Roadmap (6 Months)](#7-3-phase-roadmap-6-months)
8. [Knowledge Gaps — What's Missing for Business Success](#8-knowledge-gaps--whats-missing-for-business-success)
9. [Market Context](#9-market-context)
10. [Risk Register](#10-risk-register)

---

## 1. Executive Summary

**Feast AI** is a full-stack, AI-powered meal planning application targeting budget-conscious Australian households — starting in Victoria (Noble Park) — with a long-term vision to expand into Southeast Asia, specifically Cambodia. The platform uses Anthropic's Claude 3.5 Sonnet to generate personalised 7-day meal plans, optimise grocery spend against Coles/Woolworths pricing, and reduce food waste via a leftover recipe engine.

A parallel venture, the **Fan Jacket Smoke Test**, is a pre-order MVP model for the Australian market using the same lean-launch philosophy: validate demand before committing capital.

Both ventures share a single thesis: **use AI to reduce financial friction for everyday Australians and Southeast Asians.**

---

## 2. Business Context & Ventures

### 2.1 Feast AI — Meal Prep SaaS

| Attribute | Detail |
|-----------|--------|
| **Core Problem** | Australian grocery bills have risen ~20% since 2022. Households waste $2,500–$3,800/year in food. Meal planning is manual and time-consuming. |
| **Core Solution** | AI generates a full week of meals tailored to your body, diet, and *what's cheapest at Coles/Woolworths this week*. |
| **Primary Target** | Renters, young families, multicultural households in suburban VIC (Noble Park, Dandenong corridor) |
| **Secondary Target** | Cambodian diaspora communities; future direct expansion into Phnom Penh |
| **Revenue Model** | Freemium SaaS — free tier (manual recipe browse) + premium tier (AI plan generation, price sync) |
| **Unique Angle** | Southeast Asian cuisine-first (Cambodian, Thai, Vietnamese) — not another bland Western recipe app |

### 2.2 Fan Jacket Venture — Smoke Test MVP

| Attribute | Detail |
|-----------|--------|
| **Model** | Pre-order / smoke test — collect intent-to-buy before manufacturing |
| **Market** | Australia (initial), Cambodia (expansion) |
| **Current State** | Concept stage — no code exists in this repo for this venture |
| **Integration Opportunity** | Shared user authentication + payment infrastructure with Feast AI |
| **Validation Goal** | 50+ pre-orders before placing first bulk order |

### 2.3 Founder Context
- Based in Noble Park, Victoria, Australia
- Multicultural community insight (Cambodian heritage)
- Health & nutrition awareness informed by personal/family experience
- Cambodia market interest — health insurance, food, and lifestyle verticals

---

## 3. Technical Architecture

### 3.1 Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Next.js 14 (App Router) + React 18 + TypeScript + Tailwind │
│  Dark mode (class strategy) │ Mobile-responsive             │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP / fetch
┌───────────────────────▼─────────────────────────────────────┐
│                      API LAYER (14+ endpoints)               │
│  Next.js API Routes │ JWT Auth │ Zod Validation              │
│  Rate Limiting (100 req/15min) │ CORS │ Security Headers     │
└───────────────────────┬─────────────────────────────────────┘
                        │ Prisma ORM
┌───────────────────────▼─────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  SQLite (dev) │ Ready for PostgreSQL (prod)                  │
│  5 models: User, Preference, Recipe, Plan, PlanMeal          │
└───────────────────────┬─────────────────────────────────────┘
                        │ Anthropic SDK
┌───────────────────────▼─────────────────────────────────────┐
│                    AI/AGENT LAYER                            │
│  Claude 3.5 Sonnet │ Meal Plan Gen │ Recipe Extract          │
│  Leftover Optimizer │ YouTube Import                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Decisions & Rationale

| Decision | Technology | Why |
|----------|-----------|-----|
| Frontend framework | Next.js 14 (App Router) | SSR for SEO, API routes = one repo |
| Styling | Tailwind CSS 3.4 | Fast iteration, dark mode built-in |
| ORM | Prisma 6 | Type-safe queries, easy migration to Postgres |
| Database (dev) | SQLite | Zero-config local dev |
| Database (prod) | PostgreSQL (planned) | Scalable, Vercel/Supabase compatible |
| AI | Anthropic Claude 3.5 Sonnet | Best food/nutrition reasoning; structured JSON output |
| Auth | JWT + bcryptjs | Stateless; works on Vercel edge |
| Testing | Jest + Playwright | Unit + full E2E browser coverage |
| Container | Docker (multi-stage, non-root) | Production-safe, cloud-portable |

### 3.3 Docker Architecture

```dockerfile
# Stage 1: Builder (node:18-alpine)
#   npm ci → prisma generate → next build
# Stage 2: Runtime (node:18-alpine)
#   dumb-init → non-root user (uid:1001) → port 3000
#   Healthcheck: GET /api/health every 30s
```

**Deployment targets (in priority order):**
1. **Vercel** — zero-config, free tier, auto-deploys from GitHub
2. **Docker + Cloud Run / ECS** — for self-hosted or cost-controlled scale
3. **VPS + PM2** — bare-metal budget option

### 3.4 Database Schema (Abbreviated)

```
User ──< Preference   (dietary profile, macros, allergens, budget)
User ──< Plan ──< PlanMeal >── Recipe
                                └── ingredientsJson (JSON string)
                                └── stepsMd (Markdown)
                                └── dietTags (CSV: halal, vegan...)
```

**Notable schema features:**
- `region` + `currency` on Preference — multi-country ready (AU, KH, TH)
- `halalEnabled` boolean — explicit halal toggle for Muslim users in Noble Park
- `cuisines` default: `"Cambodian,Thai,Vietnamese"` — Southeast Asian first
- `allergens` as CSV — simple but sufficient for MVP

---

## 4. Current Feature Inventory

### 4.1 What Exists (Coded & Working)

| Feature | Status | Location |
|---------|--------|----------|
| User signup/signin (JWT) | ✅ Complete | `/app/auth/` |
| Dietary preferences form | ✅ Complete | `/app/setup/` |
| Recipe browser (search, filter, paginate) | ✅ Complete | `/app/recipes/` |
| Recipe detail page | ✅ Complete | `/app/recipes/[id]/` |
| Add custom recipe | ✅ Complete | `/app/recipes/add/` |
| Import recipe from URL | ✅ Complete | `/app/recipes/import/` |
| Import recipe from YouTube | ✅ Complete | `YouTubeImportModal` |
| AI meal plan generator (7-day) | ✅ Complete | `/api/ai/plan` |
| Meal planner calendar UI | ✅ Complete | `/app/planner/` |
| Grocery list (aggregated by category) | ✅ Complete | `/app/groceries/` |
| Leftover recipe suggestions (AI) | ✅ Complete | `/app/leftovers/` |
| Saved recipes page | ✅ Complete | `/app/saved-recipes/` |
| Dark mode toggle | ✅ Complete | `ThemeProvider` |
| Health check endpoint | ✅ Complete | `/api/health` |
| Rate limiting | ✅ Complete | `lib/rate-limit.ts` |
| Security headers (CSP, HSTS, etc.) | ✅ Complete | `middleware.ts` |
| Docker containerisation | ✅ Complete | `Dockerfile` |
| E2E tests (Playwright, 5 browsers) | ✅ Complete | `e2e/` |
| Unit tests (Jest) | ✅ Complete | `__tests__/` |
| 15 seeded recipes (5 cuisines) | ✅ Complete | `prisma/seed.ts` |

### 4.2 What Does NOT Exist Yet

> See Section 8 (Knowledge Gaps) for full prioritised list.

---

## 5. Business Value Proposition

### 5.1 The Core Value Loop

```
User enters body metrics + diet + budget
        ↓
Claude generates a personalised 7-day plan
        ↓
Plan is checked against Coles/Woolworths prices  ← [NOT YET BUILT]
        ↓
Grocery list is generated, optimised, exportable
        ↓
User cooks, logs leftovers
        ↓
Claude suggests new recipes from leftovers
        ↓
Less waste. Less spend. Better health.
```

### 5.2 Pain Points Solved

| User Pain | How Feast AI Solves It |
|-----------|----------------------|
| "I don't know what to cook" | Claude generates a full week in seconds |
| "Groceries are too expensive" | Budget-level preference + price optimisation (roadmap) |
| "I always waste food" | Leftover recipe engine uses what you already have |
| "Recipe apps don't have my food" | Cambodian, Thai, Vietnamese cuisine built-in by default |
| "I need halal options" | Explicit halal toggle, Claude respects it in all plans |
| "I don't have time to plan" | 1-click AI plan generation |
| "I can't track my macros" | Auto-calculated per meal based on body metrics |

### 5.3 Why This Wins in Noble Park / South-East Melbourne

Noble Park and the Dandenong corridor are among Australia's most multicultural postcodes. The average household:
- Is budget-constrained (median income below Melbourne average)
- Cooks Southeast Asian food regularly
- Has dietary restrictions (halal, vegetarian) within the household
- Shops primarily at Coles/Woolworths/Aldi

**No existing app speaks this language.** Feast AI is the first meal planner built *for* this community, not *adapted* for it.

---

## 6. AI Agent Architecture

### 6.1 Current Agents

| Agent | File | Model | Temp | Purpose |
|-------|------|-------|------|---------|
| Meal Plan Generator | `lib/ai.ts` | Claude 3.5 Sonnet | 1.0 | 7-day personalised plan + shopping list |
| Recipe URL Extractor | `lib/ai.ts` | Claude 3.5 Sonnet | 0.3 | Scrape + normalise recipes from web |
| YouTube Recipe Extractor | `lib/ai.ts` | Claude 3.5 Sonnet | 0.5 | Extract recipe from YT video description |
| Leftover Optimizer | `lib/ai-leftovers.ts` | Claude 3.5 Sonnet | 0.8 | 3–5 recipes from leftover ingredients |

### 6.2 Planned Agents (Roadmap)

| Agent | Priority | Purpose |
|-------|----------|---------|
| Price Comparison Agent | P0 | Scrape Coles/Woolworths prices, recommend cheapest option |
| Nutrition Coach Agent | P1 | Weekly check-in, adjust plan based on progress |
| Cultural Recipe Agent | P1 | Generate authentic Cambodian recipes from family names |
| Pantry Tracker Agent | P2 | Track what's in fridge/pantry, reduce shopping list |
| Meal Swap Agent | P2 | "I don't like this meal — swap it" with macro-matching |

### 6.3 Prompt Engineering Notes

- **Meal Plan Generator** uses `temperature: 1` (max creativity) with automatic retry at `0.7` on JSON parse failure — robust against malformed AI output.
- All agents output **structured JSON** — the app never renders raw LLM text directly (except Markdown steps).
- System prompts include: dietary restrictions, allergens, budget level, region, currency — ensuring plans are *always* contextually correct.

---

## 7. 3-Phase Roadmap (6 Months)

### Phase 1: Proof of Concept (PoC) — Months 1–2
**Goal:** Deploy a working app to real users. Validate core loop. Gather feedback.

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Migrate SQLite → PostgreSQL (Supabase) | P0 | 1 day | Required for multi-user production |
| Deploy to Vercel (production URL) | P0 | 2 hrs | Connect GitHub, set env vars |
| Add Coles/Woolworths price data (static CSV) | P0 | 3 days | Manual scrape or Grocer API — see Gap #1 |
| Integrate price data into AI prompt | P0 | 1 day | Pass weekly specials to Claude context |
| Payment gate (Stripe) for premium tier | P0 | 2 days | $9.99 AUD/month freemium cap |
| Basic analytics (Posthog or Vercel Analytics) | P1 | 4 hrs | Track DAU, plan generation counts |
| User onboarding flow improvement | P1 | 2 days | Setup wizard feels like a developer form |
| Mobile UI polish (Noble Park persona) | P1 | 3 days | More consumer-friendly, less SaaS-dev aesthetic |
| Fan Jacket pre-order landing page | P1 | 1 day | Separate `/fan-jacket` route or subdomain |

**PoC Success Criteria:**
- 50 real users signed up
- 200+ meal plans generated
- < $50 AUD/month infra cost
- Fan Jacket: 10+ pre-order email captures

---

### Phase 2: Pilot — Months 3–4
**Goal:** Prove retention and willingness to pay. Build community.

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Live Coles/Woolworths price scraper | P0 | 1 week | Weekly cron job, price per 100g |
| Pantry/fridge tracker | P0 | 1 week | Manual entry + barcode scan (future) |
| Meal swap agent ("I don't like this") | P1 | 3 days | Claude re-generates single meal, macro-matched |
| Weekly nutrition report (email) | P1 | 3 days | Resend or SendGrid, PDF summary |
| Social sharing (recipe card export) | P1 | 2 days | Image generation for Instagram |
| Push notifications (meal reminders) | P2 | 3 days | PWA notifications or Expo (if going mobile) |
| Fan Jacket: Stripe pre-order flow | P0 | 3 days | Collect payment, hold until order placed |
| Cambodia market research | P1 | ongoing | Survey 20 Cambodian households |
| Cambodian recipe expansion (50+ recipes) | P1 | 1 week | Partner with local cooks or source dataset |

**Pilot Success Criteria:**
- 500 users, 10% paying ($9.99/mo)
- Average session > 5 minutes
- Churn < 15%/month
- Fan Jacket: 50 pre-orders

---

### Phase 3: Production Scale — Months 5–6
**Goal:** Revenue-positive. Prepare for Cambodia expansion.

| Task | Priority | Effort | Notes |
|------|----------|--------|-------|
| Redis caching (AI responses, price data) | P0 | 2 days | Reduce Anthropic API costs by ~60% |
| PostgreSQL read replicas | P0 | 1 day | Supabase handles this |
| Multi-currency support (AUD + KHR) | P0 | 2 days | Schema ready, UI needs update |
| Khmer language support (i18n) | P1 | 1 week | next-intl, Khmer font stack |
| Cambodia supermarket price integration | P1 | 2 weeks | Lucky Supermarket, Aeon Mall |
| Mobile app (React Native / Expo) | P1 | 4 weeks | Shared API, mobile-native UX |
| B2B pilot: Noble Park community orgs | P2 | ongoing | Foodbank, community kitchens |
| Affiliate/referral program | P2 | 1 week | "Refer 3 friends, get 1 month free" |
| Health insurance upsell (Cambodia) | P2 | research | Grandfather's insight — health cost awareness |

**Production Success Criteria:**
- $1,000+ AUD MRR
- < $200 AUD/month infra cost
- Cambodia waitlist: 100+ signups
- Fan Jacket: first batch shipped

---

## 8. Knowledge Gaps — What's Missing for Business Success

These are specific things **not yet coded** that are required for the business to succeed. Prioritised by business impact.

---

### GAP 1 — Real-Time Coles/Woolworths Price Data
**Impact:** CRITICAL — This is the #1 differentiator and it doesn't exist yet.
**What's missing:** A price data pipeline that ingests weekly specials from Coles and Woolworths.
**Options:**
- Option A: Woolworths Everyday Rewards API (limited, requires partner access)
- Option B: Coles/Woolworths web scraper (cron job, parse HTML) — legal grey area
- Option C: Third-party grocery API (Grocer API, Supermarket API AU)
- Option D: Manual CSV upload weekly (viable for MVP/PoC)

**Current state:** Claude is prompted with "budget level" (low/medium/high) as a proxy. This is not price optimisation.

---

### GAP 2 — Payment & Subscription System
**Impact:** CRITICAL — No way to monetise currently.
**What's missing:** Stripe integration for subscription billing.
**Needed:**
- `stripe` npm package
- `/api/stripe/webhook` endpoint
- Subscription status field on `User` model
- Feature gating (premium vs free) in middleware
- Subscription management UI (`/settings/billing`)

---

### GAP 3 — Production Database (PostgreSQL)
**Impact:** HIGH — SQLite is a single file, not suitable for concurrent users.
**What's missing:** Migration from SQLite to PostgreSQL.
**Fix:** Change `datasource provider` to `postgresql` in `schema.prisma`, set `DATABASE_URL` to Supabase connection string, run `prisma migrate deploy`.

---

### GAP 4 — User Onboarding & Retention Hooks
**Impact:** HIGH — Setup form is functional but developer-facing; will lose non-technical users.
**What's missing:**
- Visual onboarding wizard (step 1 of 4, progress bar)
- "Quick start" option (skip body metrics, just set cuisine + budget)
- First-time user email (welcome + "your first plan is ready")
- Empty state CTAs (e.g., "Generate your first plan →")

---

### GAP 5 — Saved Recipes (User Ownership)
**Impact:** HIGH — Users can browse recipes but `saved-recipes` page exists without a database relation to support it.
**What's missing:** A `SavedRecipe` join table (`userId` + `recipeId`) + API endpoints (`POST /api/recipes/[id]/save`, `DELETE`, `GET /api/saved-recipes`).

---

### GAP 6 — Email Infrastructure
**Impact:** HIGH — No transactional emails exist.
**What's missing:**
- Welcome email on signup
- Weekly meal plan summary email
- Password reset flow (no `/auth/reset-password` route exists)
- **Provider recommendation:** Resend (free tier: 100 emails/day, Next.js native)

---

### GAP 7 — Password Reset
**Impact:** HIGH — Users who forget their password are permanently locked out.
**What's missing:**
- `POST /api/auth/forgot-password` (send reset token via email)
- `POST /api/auth/reset-password` (validate token, update password)
- Temporary token storage (Redis or DB table with expiry)
- `/auth/forgot-password` and `/auth/reset-password` pages

---

### GAP 8 — Analytics & Observability
**Impact:** MEDIUM — Can't improve what you can't measure.
**What's missing:**
- User behaviour analytics (Posthog recommended — free, self-hostable)
- Error tracking (Sentry DSN env var exists but SDK not installed)
- AI usage tracking (cost per user, tokens per plan)
- Business metrics dashboard (MRR, DAU, plan generation rate)

---

### GAP 9 — Social / Shareable Recipe Cards
**Impact:** MEDIUM — Organic growth requires shareable content.
**What's missing:**
- `GET /api/recipes/[id]/og-image` — dynamic Open Graph image generation
- `next/og` (Vercel's image generation) for recipe cards
- "Share this recipe" button on recipe detail page
- This is a low-cost, high-growth-impact feature

---

### GAP 10 — Halal Certification Display
**Impact:** MEDIUM (HIGH for Noble Park market) — Muslim users need trust signals.
**What's missing:**
- Visual halal badge on recipe cards when `dietTags` includes `halal`
- Disclaimer text about certification status
- Ability for users to report non-halal ingredients

---

### GAP 11 — Fan Jacket Venture Infrastructure
**Impact:** MEDIUM — Separate venture, no code exists.
**What's missing:** Everything.
**Minimum viable smoke test:**
- `/fan-jacket` landing page (hero, product image, value prop)
- Email capture form (Mailchimp or Resend list)
- Stripe one-click pre-order ($X AUD deposit)
- Thank you page + confirmation email

---

### GAP 12 — Barcode / Pantry Scanner
**Impact:** LOW (but high delight) — Future feature.
**What's missing:** Camera API integration for barcode scanning to auto-populate pantry list. Dependencies: `react-camera-pro`, Open Food Facts API for barcode lookup.

---

### GAP 13 — Multi-language Support (Khmer)
**Impact:** LOW now, HIGH for Cambodia expansion.
**What's missing:** i18n setup (`next-intl`), Khmer translation strings, Khmer-compatible font (Noto Sans Khmer).

---

## 9. Market Context

### 9.1 Australia — Primary Market

| Factor | Detail |
|--------|--------|
| **Location** | Noble Park, Victoria (South-East Melbourne) |
| **Demographics** | High multicultural density; large Cambodian, Vietnamese, Pacific Islander communities |
| **Grocery duopoly** | Coles + Woolworths control ~65% of Australian grocery market |
| **Cost of living** | Grocery prices up ~20% since 2022; food affordability is a genuine pain point |
| **Digital readiness** | High smartphone penetration; strong app adoption behaviour |
| **Competitor gap** | No meal planning app targets Southeast Asian diaspora in Australia |

### 9.2 Cambodia — Expansion Market

| Factor | Detail |
|--------|--------|
| **Entry strategy** | Cultural connection + diaspora network (Noble Park → Phnom Penh pipeline) |
| **Opportunity** | Growing middle class; smartphone-first; rising health awareness |
| **Health insurance angle** | Low penetration of health insurance in Cambodia — potential adjacent product |
| **Grocery landscape** | Lucky Supermarket, Aeon Mall — no equivalent to Coles/Woolworths |
| **Currency** | KHR (Cambodian Riel) — schema already has `currency` field |
| **Language** | Khmer script required for local adoption |

### 9.3 Competitive Landscape

| Competitor | Gap Feast AI Fills |
|-----------|-------------------|
| Mealime | No AI, no Southeast Asian cuisine, no price optimisation |
| Whisk | No AI plan generation, no halal filter, no AUD pricing |
| Eat This Much | Western-centric, no multicultural support, USD only |
| MyFitnessPal | Tracking only, not planning, no AI meal generation |
| HelloFresh | Subscription box model, ~$12/meal — 4x more expensive |

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Coles/Woolworths block price scraper | High | High | Use static CSV until official API access; pursue partner programme |
| Anthropic API cost overrun | Medium | High | Cache AI responses in Redis; implement token budgets per user tier |
| SQLite data loss in production | High | Critical | Migrate to PostgreSQL before first paid user |
| User data breach (JWT secret leaked) | Low | Critical | Rotate JWT secret; add 2FA; regular secret rotation |
| Low adoption in Noble Park (wrong channel) | Medium | High | Community partnerships (temples, community centres, Facebook groups) |
| Fan Jacket pre-orders don't convert | Medium | Medium | Smoke test first — no inventory until 50 pre-orders confirmed |
| Cambodia expansion premature | Low | Low | Research-only until AU market profitable |

---

## Appendix A — Key File Map

| Business Function | Technical File |
|-------------------|----------------|
| AI Meal Plan | [lib/ai.ts](lib/ai.ts) |
| AI Leftovers | [lib/ai-leftovers.ts](lib/ai-leftovers.ts) |
| Auth Logic | [lib/auth.ts](lib/auth.ts) |
| Database Schema | [prisma/schema.prisma](prisma/schema.prisma) |
| Seed Recipes | [prisma/seed.ts](prisma/seed.ts) |
| Security Headers | [middleware.ts](middleware.ts) |
| Docker Config | [Dockerfile](Dockerfile) |
| Environment Config | [.env.example](.env.example) |
| Grocery List API | [app/api/groceries/route.ts](app/api/groceries/route.ts) |
| Preferences API | [app/api/preferences/route.ts](app/api/preferences/route.ts) |

---

## Appendix B — Immediate Next Actions (This Week)

**To unblock business momentum, do these in order:**

1. **Deploy to Vercel** — get a real URL, share with 5 friends/family in Noble Park
2. **Add Stripe** — even a $1 "supporter" tier creates real payment infrastructure
3. **Fix saved-recipes DB gap** — users expect this to work
4. **Add password reset** — before any real users sign up
5. **Create Fan Jacket landing page** — email capture only, measure interest

---

*This document was generated by Claude Code on 2026-03-26 by scanning the live codebase at `c:\Users\Kualar\Documents\Feast AI`. It should be treated as the single source of truth for technical and business decisions. Update it after every major sprint or decision.*
