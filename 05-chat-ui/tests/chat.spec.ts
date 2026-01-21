import { test, expect } from "@playwright/test";

test.describe("Chat UI", () => {
  test("page loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("AI SDK Research Assistant");
  });

  test("chat input accepts text", async ({ page }) => {
    await page.goto("/");
    const input = page.locator('input[placeholder*="Ask about AI SDK"]');
    await expect(input).toBeVisible();
    await input.fill("Hello");
    await expect(input).toHaveValue("Hello");
  });

  test("can submit a message", async ({ page }) => {
    await page.goto("/");
    const input = page.locator('input[placeholder*="Ask about AI SDK"]');
    await input.fill("What is streamText?");
    await page.click('button[type="submit"]');

    // Wait for message to appear
    await expect(page.locator("text=What is streamText?")).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows assistant response", async ({ page }) => {
    await page.goto("/");
    const input = page.locator('input[placeholder*="Ask about AI SDK"]');
    await input.fill("Say hello");
    await page.click('button[type="submit"]');

    // Wait for response (longer timeout for AI)
    await expect(
      page.locator('[class*="bg-white border shadow-sm"]')
    ).toBeVisible({ timeout: 30000 });
  });
});
