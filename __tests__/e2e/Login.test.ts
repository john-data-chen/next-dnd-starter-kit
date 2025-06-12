import { defaultEmail } from '@/constants/demoData';
import { expect, test } from '@playwright/test';


test.describe('SignInPage', () => {
  test('should load the sign-in page', async ({ page }) => {
    // clear cookies
    await page.context().clearCookies();
    await page.goto('/login');
    const h1 = await page.locator('h1').textContent();
    expect(h1).toBe('Next.js template for beginner');
  });

  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', defaultEmail);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/en/boards?login_success=true');
  });
});