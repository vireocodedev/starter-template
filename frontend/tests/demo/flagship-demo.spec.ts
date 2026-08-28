import { expect, test } from "@playwright/test";

const username = process.env.VIREO_DEMO_USERNAME;
const password = process.env.VIREO_DEMO_PASSWORD;

test("public flagship completes the read-only evaluation journey", async ({ page }) => {
  test.skip(!username || !password, "Demo credentials are required for the hosted synthetic journey.");

  const response = await page.goto("/login");
  expect(response?.ok()).toBe(true);
  await page.getByRole("textbox", { name: "Username" }).fill(username!);
  await page.getByRole("textbox", { name: "Password" }).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Keep field operations supplied and moving." }),
  ).toBeVisible();
  await expect(page.getByText("Live snapshot", { exact: true })).toBeVisible();
  await expect(page.locator("[data-app-overview-metrics]")).toBeVisible();

  await page.getByRole("button", { name: "Open inventory" }).click();
  await expect(page).toHaveURL(/\/items$/);
  await expect(page.getByRole("heading", { level: 1, name: "Items" })).toBeVisible();
  await expect(page.getByText("Portable barcode scanners", { exact: true })).toBeVisible();
});
