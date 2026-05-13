import { test, expect } from "@playwright/test";

test("dashboard is accessible in test mode", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/dashboard");
});