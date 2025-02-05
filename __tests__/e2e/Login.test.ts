import { defaultEmail } from '@/constants/auth';
import { expect, test } from '@playwright/test';

// Test suite for SignInPage

test.describe('SignInPage', () => {
  test('should load the sign-in page', async ({ page }) => {
    await page.goto('/login');
    const h1 = await page.locator('h1').textContent();
    expect(h1).toBe('This is a demo project');
  });

  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', defaultEmail);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/kanban');
  });
});
