import { expect, test } from "@playwright/test";
import { authenticateAsDevelopmentAdministrator } from "./support/authentication";

test("the development administrator reaches a settled live Overview", async ({ page }) => {
  await authenticateAsDevelopmentAdministrator(page);

  await expect(page.locator('[data-app-overview-state="loaded"]')).toBeVisible();
  const overviewHero = page.locator("[data-app-overview-hero]");
  const liveSnapshot = overviewHero.getByText("Live snapshot", { exact: true });
  await expect(liveSnapshot).toHaveCount(1);
  await expect(liveSnapshot).toBeVisible();
  await expect(page.locator("[data-app-overview-metrics]")).toBeVisible();
});
