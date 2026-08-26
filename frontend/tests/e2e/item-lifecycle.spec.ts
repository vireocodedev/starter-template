import { expect, test } from "@playwright/test";

test("an administrator can create an item through the complete application stack", async ({ page }, testInfo) => {
  const itemName = `E2E item ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/items");
  await expect(page).toHaveURL(/\/items$/);
  await page.getByRole("button", { name: "Create item" }).click();

  await page.getByRole("textbox", { name: "Name" }).fill(itemName);
  await page.getByRole("textbox", { name: "Quantity" }).fill("7");
  await page.getByRole("button", { name: "Create item" }).last().click();

  await expect(page.getByText(itemName, { exact: true })).toBeVisible();
});
