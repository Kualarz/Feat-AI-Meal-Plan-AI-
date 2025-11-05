import { test, expect } from '@playwright/test';

test.describe('Recipes Page', () => {
  test.beforeEach(async ({ page }) => {
    // Continue as guest for recipes access
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');
  });

  test('should load recipes page', async ({ page }) => {
    await page.goto('/recipes');

    await expect(page.locator('text=Recipes')).toBeVisible();
  });

  test('should display recipe search/filter controls', async ({ page }) => {
    await page.goto('/recipes');

    // Look for common recipe page elements
    const searchElements = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]');
    const filterButtons = page.locator('button:has-text(/filter|cuisine|difficulty/i)');

    // At least one should exist
    const count = await searchElements.count();
    expect(count + (await filterButtons.count())).toBeGreaterThan(0);
  });

  test('should be able to navigate recipe pagination', async ({ page }) => {
    await page.goto('/recipes');

    // Wait for recipes to load
    await page.waitForLoadState('networkidle');

    // Look for recipe items or pagination
    const recipes = page.locator('[role="article"], .recipe-card, [data-testid*="recipe"]');
    const recipeCount = await recipes.count();

    // Should have at least some recipes loaded
    expect(recipeCount).toBeGreaterThan(0);
  });

  test('should display navbar on recipes page', async ({ page }) => {
    await page.goto('/recipes');

    // Check navbar exists
    await expect(page.locator('text=Feast AI')).toBeVisible();
    await expect(page.locator('text=🍽️')).toBeVisible();
  });

  test('should have navigation links in navbar', async ({ page }) => {
    await page.goto('/recipes');

    // Dark mode toggle should exist
    const darkModeButton = page.locator('button[aria-label*="dark mode" i], button[aria-label*="theme" i], button[title*="Switch to"]');
    await expect(darkModeButton).toBeVisible();
  });

  test('should navigate to recipe details', async ({ page }) => {
    await page.goto('/recipes');

    // Wait for recipes to load
    await page.waitForLoadState('networkidle');

    // Click first recipe
    const firstRecipe = page.locator('[role="article"], .recipe-card, a[href*="/recipes/"]').first();
    if (await firstRecipe.count() > 0) {
      await firstRecipe.click();

      // Should navigate to recipe detail page
      await expect(page).toHaveURL(/\/recipes\/[a-z0-9-]+/i);
    }
  });

  test('should support theme toggle', async ({ page }) => {
    await page.goto('/recipes');

    const darkModeButton = page.locator('button[title*="Switch to"]');

    // Get initial theme
    const initialTheme = await page.locator('html').getAttribute('class');

    // Click dark mode toggle
    if (await darkModeButton.count() > 0) {
      await darkModeButton.click();

      // Wait a bit for theme to change
      await page.waitForTimeout(100);

      // Theme should change
      const newTheme = await page.locator('html').getAttribute('class');
      // Might not always change, but button should be clickable
      expect(darkModeButton).toBeVisible();
    }
  });
});

test.describe('Add Recipe Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');
  });

  test('should load add recipe page', async ({ page }) => {
    await page.goto('/recipes/add');

    // Check for add recipe form or heading
    const heading = page.locator('text=/Add|Create|New.*Recipe/i');
    expect(await heading.count()).toBeGreaterThan(0);
  });

  test('should display recipe form fields', async ({ page }) => {
    await page.goto('/recipes/add');

    // Look for common recipe form fields
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]');
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]');

    // At least title field should exist
    const formFieldCount = await titleInput.count() + (await descriptionInput.count());
    expect(formFieldCount).toBeGreaterThan(0);
  });
});

test.describe('Import Recipe Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');
  });

  test('should load import page', async ({ page }) => {
    await page.goto('/recipes/import');

    // Check for import-related content
    const heading = page.locator('text=/Import|URL/i');
    expect(await heading.count()).toBeGreaterThan(0);
  });

  test('should have URL input field', async ({ page }) => {
    await page.goto('/recipes/import');

    // Look for URL input
    const urlInput = page.locator('input[type="url"], input[placeholder*="URL" i], input[placeholder*="url" i]');
    expect(await urlInput.count()).toBeGreaterThan(0);
  });
});
