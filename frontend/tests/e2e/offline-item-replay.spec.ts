import { expect, test } from "@playwright/test";
import { authenticateAsDevelopmentAdministrator } from "./support/authentication";

test("offline Item changes survive reload and replay in order", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const suffix = `${testInfo.project.name}-${Date.now()}`;
  const createdName = `Offline ${suffix}`;
  const updatedName = `Replayed ${suffix}`;
  const deletedName = `Deleted ${suffix}`;
  const expectConnectivity = async (label: "Online" | "Offline") => {
    if (testInfo.project.name === "mobile-chromium") {
      await page.getByRole("button", { name: "Open navigation" }).click();
    }
    await expect(page.getByRole("button", { name: "Open offline settings" })).toContainText(label);
    if (testInfo.project.name === "mobile-chromium") {
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Close navigation" })).not.toBeVisible();
    }
  };

  await authenticateAsDevelopmentAdministrator(page);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        crossOriginIsolated: globalThis.crossOriginIsolated,
        hasSharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
      })),
    )
    .toEqual({ crossOriginIsolated: true, hasSharedArrayBuffer: true });
  await expectConnectivity("Online");

  await page.goto("/settings#offline");
  await page.getByRole("switch", { name: "Offline simulator" }).check();
  await expectConnectivity("Offline");

  await page.goto("/items");
  await page.getByRole("button", { name: "Create item" }).first().click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(createdName);
  await page.getByRole("textbox", { name: "Quantity" }).fill("4");
  await page.getByRole("button", { name: "Create item" }).last().click();
  await page.reload();
  await expect(page.getByText(createdName, { exact: true })).toBeVisible();
  await expect(page.getByText("Pending", { exact: true })).toBeVisible();
  const search = page.getByRole("textbox", { name: "Search by name, description or status" });
  await search.fill(createdName);
  await search.press("Enter");
  if (testInfo.project.name === "mobile-chromium") {
    await page.getByRole("button").filter({ hasText: createdName }).click();
    await page.getByRole("button", { name: "Edit" }).click();
  } else {
    await page.getByRole("row").filter({ hasText: createdName }).getByRole("button", { name: "Edit" }).click();
  }
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(updatedName);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(updatedName, { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Create item" }).first().click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(deletedName);
  await page.getByRole("textbox", { name: "Quantity" }).fill("1");
  await page.getByRole("button", { name: "Create item" }).last().click();
  await search.fill(deletedName);
  await search.press("Enter");
  await expect(page.getByText(deletedName, { exact: true }).first()).toBeVisible();
  if (testInfo.project.name === "mobile-chromium") {
    await page.getByRole("button").filter({ hasText: deletedName }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
  } else {
    await page
      .getByRole("row")
      .filter({ hasText: deletedName })
      .getByRole("button", { name: "Delete", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("No items match the current search and filters.")).toBeVisible();

  await page.goto("/settings#offline");
  await page.getByRole("switch", { name: "Offline simulator" }).uncheck();
  await expectConnectivity("Online");
  await expect(page.getByText(/0 pending · 0 failed/u)).toBeVisible({ timeout: 30_000 });

  await page.goto("/items");
  await search.fill(updatedName);
  await search.press("Enter");
  await expect(page.getByText(updatedName, { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Pending", { exact: true })).not.toBeVisible();

  await search.fill(deletedName);
  await search.press("Enter");
  await expect(page.getByText("No items match the current search and filters.")).toBeVisible();
});
