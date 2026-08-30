import { expect, type Page } from "@playwright/test";

const developmentAdministrator = { username: "admin", password: "admin123" } as const;

/** Signs in through the HTTP development backend used by the local E2E environment. */
export async function authenticateAsDevelopmentAdministrator(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Username" }).fill(developmentAdministrator.username);
  await page.getByRole("textbox", { name: "Password" }).fill(developmentAdministrator.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
}
