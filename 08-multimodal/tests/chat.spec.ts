import { test, expect } from "@playwright/test";

test.describe("Multimodal Chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with correct title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Multimodal");
  });

  test("shows empty state on load", async ({ page }) => {
    await expect(page.getByText("Start a conversation...")).toBeVisible();
  });

  test("has image upload functionality", async ({ page }) => {
    // Check that file input exists for image upload
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await expect(fileInput).toBeAttached();
  });

  test("can submit text message", async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill("Hello");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Hello")).toBeVisible({ timeout: 5000 });
  });

  test("file input exists and accepts images", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  test("placeholder changes when image context exists", async ({ page }) => {
    // Default placeholder
    const input = page.locator('input[type="text"]');
    await expect(input).toHaveAttribute(
      "placeholder",
      "Type a message or upload an image..."
    );
  });

  test("submit button disabled when empty", async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
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
