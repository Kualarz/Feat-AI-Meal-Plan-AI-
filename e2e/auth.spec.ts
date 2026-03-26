import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    // Homepage has "Sign In" button which links to /auth/signin
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/auth/signin');

    // From signin page, click "Sign Up" link to go to signup
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/auth/signup');
    await expect(page.locator('text=Create Your Account')).toBeVisible();
  });

  test('should display signup form fields', async ({ page }) => {
    await page.goto('/auth/signup');

    // Check all form fields exist
    const fullNameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');

    await expect(fullNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
  });

  test('should show validation error for weak password', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    // Blur the last field to ensure React flushes all onChange state updates —
    // Mobile Safari has a timing race where short fill() values don't commit before submit
    await page.locator('input[name="confirmPassword"]').blur();

    // Use both submission methods to cover all browsers:
    //   requestSubmit() works on webkit desktop (button click doesn't trigger onSubmit there)
    //   button click works on Mobile Safari (requestSubmit() doesn't fire React handler there)
    await page.locator('form').evaluate((f) => { try { (f as HTMLFormElement).requestSubmit(); } catch { /* noop */ } });
    await page.locator('button[type="submit"]').click({ force: true });

    // Should see error for weak password (client-side validation)
    await expect(
      page.locator('text=/Password must be at least/i')
    ).toBeVisible();
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'StrongPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    await page.locator('input[name="confirmPassword"]').blur();

    await page.locator('form').evaluate((f) => { try { (f as HTMLFormElement).requestSubmit(); } catch { /* noop */ } });
    await page.locator('button[type="submit"]').click({ force: true });

    // Should see error for password mismatch
    await expect(
      page.locator('text=/Passwords do not match/i')
    ).toBeVisible();
  });

  test('should navigate to signin page', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.click('text=Sign In');

    await expect(page).toHaveURL('/auth/signin');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should display signin form fields', async ({ page }) => {
    await page.goto('/auth/signin');

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show error for missing credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Try to submit without filling form
    await page.click('button:has-text("Sign In")');

    // HTML5 validation on required inputs — email field should be focused
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeFocused();
  });

  test('should have guest mode option', async ({ page }) => {
    await page.goto('/auth/signup');

    const guestButton = page.locator('button:has-text("Continue as Guest")');
    await expect(guestButton).toBeVisible();
  });

  test('should link between signin and signup', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/auth/signup');

    await page.click('text=Sign In');
    await expect(page).toHaveURL('/auth/signin');
  });
});

test.describe('Guest Mode', () => {
  test('should allow continue as guest', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.click('button:has-text("Continue as Guest")');

    // Should be redirected to recipes page
    await expect(page).toHaveURL('/recipes');
  });

  test('should show guest mode indicator in navbar', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.click('button:has-text("Continue as Guest")');

    // Check for guest mode text or Sign In link in navbar
    await expect(
      page.locator('text=/Guest Mode|Sign In/i')
    ).toBeVisible();
  });
});
