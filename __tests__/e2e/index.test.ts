import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');
  expect(await page.textContent('h1')).toBe('This is a demo project');
});
