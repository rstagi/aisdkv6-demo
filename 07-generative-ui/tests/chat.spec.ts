import { test, expect } from "@playwright/test";

test.describe("Generative UI Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with correct title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Generative UI");
  });

  test("shows empty state on load", async ({ page }) => {
    await expect(page.getByText("Start a conversation...")).toBeVisible();
  });

  test("can submit message", async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill("Hello");
    await page.click('button[type="submit"]');

    // Message should appear
    await expect(page.getByText("Hello")).toBeVisible({ timeout: 5000 });
  });

  test("shows assistant response", async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill("Say hello");
    await page.click('button[type="submit"]');

    // Wait for any assistant response (longer timeout for AI)
    await expect(
      page.locator('[class*="bg-white border shadow-sm"]')
    ).toBeVisible({ timeout: 30000 });
  });
});
