-- Create Preference Table for Feast AI
-- This table stores user preferences for meal planning

CREATE TABLE "Preference" (
  -- Primary Key
  "id" TEXT NOT NULL PRIMARY KEY,

  -- Foreign Key
  "userId" TEXT NOT NULL,

  -- Nutrition Targets
  "caloriesTarget" INTEGER,
  "proteinTarget" INTEGER,

  -- Diet Preferences
  "diet" TEXT,
  "halalEnabled" BOOLEAN NOT NULL DEFAULT false,
  "vegetarianEnabled" BOOLEAN NOT NULL DEFAULT false,
  "veganEnabled" BOOLEAN NOT NULL DEFAULT false,

  -- Body Metrics
  "currentWeight" DOUBLE PRECISION,
  "targetWeight" DOUBLE PRECISION,
  "weightGoal" TEXT,
  "height" DOUBLE PRECISION,
  "age" INTEGER,
  "activityLevel" TEXT,

  -- Dietary Restrictions & Preferences
  "allergens" TEXT,
  "dislikes" TEXT,
  "cuisines" TEXT DEFAULT 'Cambodian,Thai,Vietnamese',

  -- Cooking Preferences
  "timeBudgetMins" INTEGER,
  "budgetLevel" TEXT,
  "equipment" TEXT,

  -- Location
  "region" TEXT,
  "currency" TEXT,

  -- Timestamp
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraint
  CONSTRAINT "Preference_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "User" ("id")
    ON DELETE CASCADE
);

-- Create Index for faster queries by userId
CREATE INDEX "Preference_userId_idx" ON "Preference"("userId");

-- Example Insert (for testing)
-- INSERT INTO "Preference" (
--   "id",
--   "userId",
--   "caloriesTarget",
--   "proteinTarget",
--   "diet",
--   "currentWeight",
--   "targetWeight",
--   "weightGoal",
--   "height",
--   "age",
--   "activityLevel",
--   "allergens",
--   "dislikes",
--   "cuisines",
--   "timeBudgetMins",
--   "budgetLevel",
--   "equipment",
--   "region",
--   "currency"
-- ) VALUES (
--   'clap12345abcde',
--   'user_123',
--   2000,
--   120,
--   'balanced',
--   70.5,
--   68.0,
--   'lose',
--   170,
--   28,
--   'moderate',
--   'peanuts,shellfish',
--   'beef,pork',
--   'Cambodian,Thai,Vietnamese',
--   40,
--   'medium',
--   'stovetop,wok,rice cooker',
--   'KH',
--   'KHR'
-- );
