import { test, expect } from "@playwright/test";

test("dashboard is accessible in test mode", async ({ page }) => {
  await page.context().addCookies([
    {
      name: 'test-auth',
      value: 'true',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  await page.goto("/dashboard");
  await expect(page).toHaveURL("/dashboard");
});