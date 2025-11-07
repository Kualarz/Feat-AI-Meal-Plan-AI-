-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caloriesTarget" INTEGER,
    "proteinTarget" INTEGER,
    "diet" TEXT NOT NULL,
    "halalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "vegetarianEnabled" BOOLEAN NOT NULL DEFAULT false,
    "veganEnabled" BOOLEAN NOT NULL DEFAULT false,
    "currentWeight" REAL,
    "targetWeight" REAL,
    "weightGoal" TEXT,
    "height" REAL,
    "age" INTEGER,
    "activityLevel" TEXT,
    "allergens" TEXT,
    "dislikes" TEXT,
    "cuisines" TEXT,
    "timeBudgetMins" INTEGER,
    "budgetLevel" TEXT,
    "equipment" TEXT,
    "region" TEXT,
    "currency" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cuisine" TEXT,
    "dietTags" TEXT,
    "difficulty" TEXT,
    "timeMins" INTEGER,
    "estimatedPrice" REAL,
    "currency" TEXT,
    "kcal" INTEGER,
    "proteinG" INTEGER,
    "carbsG" INTEGER,
    "fatG" INTEGER,
    "fiberG" INTEGER,
    "sugarG" INTEGER,
    "sodiumMg" INTEGER,
    "ingredientsJson" TEXT NOT NULL,
    "stepsMd" TEXT NOT NULL,
    "safetyMd" TEXT,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "weekEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "dateISO" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "recipeId" TEXT,
    "notes" TEXT,
    CONSTRAINT "PlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlanMeal_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
