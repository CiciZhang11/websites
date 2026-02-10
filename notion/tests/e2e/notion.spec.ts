import { test, expect } from "@playwright/test";

test.describe("Notion Replica", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page when not authenticated", async ({ page }) => {
    // Clear any existing auth
    await page.evaluate(() => localStorage.removeItem("auth_token"));
    await page.reload();

    await expect(page.locator("h2")).toContainText("Sign in");
  });

  test("should login successfully", async ({ page }) => {
    // Navigate to login if not already there
    if (await page.locator("h2:has-text('Sign in')").count() > 0) {
      await page.fill('input[name="email"]', "demo@notion.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForURL(/\//, { timeout: 5000 });
    }

    // Should be on workspace page
    await expect(page.locator(".notion-sidebar")).toBeVisible();
  });

  test("should create a new page", async ({ page }) => {
    // Login first
    if (await page.locator("h2:has-text('Sign in')").count() > 0) {
      await page.fill('input[name="email"]', "demo@notion.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\//, { timeout: 5000 });
    }

    // Click new page button
    await page.click('button:has-text("New Page")');
    
    // Should navigate to new page
    await page.waitForTimeout(1000);
    await expect(page.locator(".notion-page")).toBeVisible();
  });

  test("should search for pages", async ({ page }) => {
    // Login first
    if (await page.locator("h2:has-text('Sign in')").count() > 0) {
      await page.fill('input[name="email"]', "demo@notion.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\//, { timeout: 5000 });
    }

    // Open search
    await page.click('button:has-text("Search")');
    
    // Wait for search modal
    await expect(page.locator('text=Search')).toBeVisible();
    
    // Type search query
    await page.fill('input[placeholder*="Search"]', "Welcome");
    await page.waitForTimeout(500);
    
    // Should show results
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 2000 });
  });

  test("should edit blocks", async ({ page }) => {
    // Login first
    if (await page.locator("h2:has-text('Sign in')").count() > 0) {
      await page.fill('input[name="email"]', "demo@notion.com");
      await page.fill('input[name="password"]', "password123");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\//, { timeout: 5000 });
    }

    // Wait for page to load
    await page.waitForSelector(".notion-block", { timeout: 5000 });
    
    // Click on first block
    const firstBlock = page.locator(".notion-block").first();
    await firstBlock.click();
    
    // Type text
    await firstBlock.type("Test content");
    
    // Wait a bit for auto-save
    await page.waitForTimeout(1000);
    
    // Content should be there
    await expect(firstBlock).toContainText("Test content");
  });
});
