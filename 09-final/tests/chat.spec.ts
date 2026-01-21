import { test, expect } from "@playwright/test";

test.describe("Final Showcase Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with header", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("AI SDK v6 Research Assistant");
  });

  test("shows welcome screen with suggestions", async ({ page }) => {
    await expect(page.getByText("Welcome to the AI Research Assistant")).toBeVisible();
    await expect(page.getByRole("button", { name: /weather/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /stock/i })).toBeVisible();
  });

  test("clicking suggestion fills input", async ({ page }) => {
    const weatherButton = page.getByRole("button", { name: /weather in San Francisco/i });
    await weatherButton.click();

    const input = page.locator('input[type="text"]');
    await expect(input).toHaveValue("What's the weather in San Francisco?");
  });

  test("can submit text message", async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill("Hello");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Hello")).toBeVisible({ timeout: 5000 });
  });

  test("has image upload functionality", async ({ page }) => {
    // Check that file input exists for image upload
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await expect(fileInput).toBeAttached();
  });

  test("shows assistant response", async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill("Say hello");
    await page.click('button[type="submit"]');

    // Wait for any assistant response (longer timeout for AI)
    await expect(
      page.locator('[class*="bg-white border border-gray-200"]')
    ).toBeVisible({ timeout: 30000 });
  });
});
