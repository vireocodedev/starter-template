import { expect, test } from "@playwright/test";

const username = process.env.VIREO_DEPLOYMENT_SMOKE_USERNAME!;
const password = process.env.VIREO_DEPLOYMENT_SMOKE_PASSWORD!;

test("the built production stack persists an authenticated item mutation", async ({ page }) => {
  const itemName = `Deployment smoke ${Date.now()}`;

  const loginResponse = await page.goto("/login");
  expect(loginResponse?.ok()).toBe(true);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/u);

  await page.goto("/items");
  await page.getByRole("button", { name: "Create item" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill(itemName);
  await page.getByRole("textbox", { name: "Quantity" }).fill("7");
  await page.getByRole("button", { name: "Create item" }).last().click();
  await expect(page.getByText(itemName, { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText(itemName, { exact: true })).toBeVisible();
});
