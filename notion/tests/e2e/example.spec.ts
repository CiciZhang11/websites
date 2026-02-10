import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  // Add your test assertions here
  await expect(page).toHaveTitle(/Notion Replica/);
});

test('login page works', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h2')).toContainText('Sign in');
  
  // Fill in login form
  await page.fill('input[name="email"]', 'demo@notion.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Should redirect to workspace
  await page.waitForURL(/\//, { timeout: 5000 });
});
