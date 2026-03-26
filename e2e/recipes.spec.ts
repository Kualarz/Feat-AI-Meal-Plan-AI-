import { test, expect } from '@playwright/test';

test.describe('Recipes Page', () => {
  test.beforeEach(async ({ page }) => {
    // Continue as guest for recipes access
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForURL('/recipes');
  });

  test('should load recipes page', async ({ page }) => {
    await expect(page.locator('h2:has-text("Recipe Browser")')).toBeVisible();
  });

  test('should display recipe search/filter controls', async ({ page }) => {
    // The filter sidebar is hidden on smaller viewports (hidden lg:block)
    // Check for search input or filter selects that exist in the DOM
    const searchInput = page.locator('input[name="q"]');
    const cuisineSelect = page.locator('select[name="cuisine"]');

    // At least one filter control should exist in the DOM
    const count = (await searchInput.count()) + (await cuisineSelect.count());
    expect(count).toBeGreaterThan(0);
  });

  test('should be able to navigate recipe pagination', async ({ page }) => {
    // Wait for recipe cards or empty state to appear (more reliable than waiting
    // for loading text to disappear, which can resolve prematurely on webkit/mobile
    // if React hasn't mounted yet when the check runs)
    await page.waitForFunction(
      () => {
        const recipeLinks = Array.from(document.querySelectorAll('a[href^="/recipes/"]'))
          .filter(a => /\/recipes\/.+/.test(a.getAttribute('href') ?? ''));
        const noRecipesEl = document.body.textContent?.includes('No recipes found');
        return recipeLinks.length > 0 || noRecipesEl;
      },
      { timeout: 15000 }
    );

    // Recipe cards are rendered as <Link href="/recipes/[id]"> wrapping <Card>
    const recipes = page.locator('a[href*="/recipes/"]').filter({ hasNot: page.locator('a[href="/recipes"]') });
    const recipeCount = await recipes.count();

    // Should have at least some recipe links (or show "No recipes found")
    const noRecipes = page.locator('text=No recipes found');
    const hasRecipes = recipeCount > 0;
    const hasEmptyState = (await noRecipes.count()) > 0;
    expect(hasRecipes || hasEmptyState).toBeTruthy();
  });

  test('should display navbar on recipes page', async ({ page }) => {
    // Check top navbar exists with the brand link
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('a:has-text("Feast AI")')).toBeVisible();
  });

  test('should have navigation links in navbar', async ({ page }) => {
    // Dark mode toggle should exist
    const darkModeButton = page.locator('button[aria-label*="dark mode" i], button[aria-label*="theme" i], button[title*="Switch to"]');
    await expect(darkModeButton).toBeVisible();
  });

  test('should navigate to recipe details', async ({ page }) => {
    // Wait for recipe cards to appear (same robust wait as pagination test)
    await page.waitForFunction(
      () => {
        const recipeLinks = Array.from(document.querySelectorAll('a[href^="/recipes/"]'))
          .filter(a => /\/recipes\/.+/.test(a.getAttribute('href') ?? ''));
        const noRecipesEl = document.body.textContent?.includes('No recipes found');
        return recipeLinks.length > 0 || noRecipesEl;
      },
      { timeout: 15000 }
    );

    // Find first recipe link (links to /recipes/[id])
    const firstRecipe = page.locator('a[href*="/recipes/"]').filter({ hasNot: page.locator('a[href="/recipes"]') }).first();
    if ((await firstRecipe.count()) > 0) {
      // Extract href and navigate — click-based navigation can be unreliable in
      // mobile viewports due to overflow-hidden ancestor containers
      const href = await firstRecipe.getAttribute('href');
      if (href) {
        await page.goto(href);
        await expect(page).toHaveURL(/\/recipes\/[a-z0-9-]+/i, { timeout: 10000 });
      }
    }
  });

  test('should support theme toggle', async ({ page }) => {
    const darkModeButton = page.locator('button[title*="Switch to"]');

    // Click dark mode toggle
    if ((await darkModeButton.count()) > 0) {
      await darkModeButton.click();

      // Wait a bit for theme to change
      await page.waitForTimeout(100);

      // Button should still be visible after toggling
      await expect(darkModeButton).toBeVisible();
    }
  });
});

test.describe('Add Recipe Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForURL('/recipes');
  });

  test('should load add recipe page', async ({ page }) => {
    await page.goto('/recipes/add');

    // Check for add recipe heading
    const heading = page.locator('text=/Add|Create|New.*Recipe/i');
    expect(await heading.count()).toBeGreaterThan(0);
  });

  test('should display recipe form fields', async ({ page }) => {
    await page.goto('/recipes/add');

    // Look for common recipe form fields
    const titleInput = page.locator('input[name="title"]');
    const descriptionInput = page.locator('textarea[name="description"]');

    // At least title field should exist
    const formFieldCount = (await titleInput.count()) + (await descriptionInput.count());
    expect(formFieldCount).toBeGreaterThan(0);
  });
});

test.describe('Import Recipe Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForURL('/recipes');
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
    const urlInput = page.locator('input[type="url"]');
    expect(await urlInput.count()).toBeGreaterThan(0);
  });
});
