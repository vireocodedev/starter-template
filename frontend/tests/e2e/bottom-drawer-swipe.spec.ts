import { expect, test } from "@playwright/test";

test("the mobile filters drawer settles closed after a handle swipe", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "The bottom drawer is the mobile overlay presentation.");

  const runtimeErrors: Error[] = [];
  page.on("pageerror", error => runtimeErrors.push(error));

  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/items");
  await page.getByRole("button", { name: "Filters" }).click();

  const drawerTitle = page.getByRole("heading", { name: "Filter items" });
  await expect(drawerTitle).toBeVisible();

  const pullerBounds = await page.locator(".VireoBottomDrawer-puller:visible").boundingBox();
  expect(pullerBounds).not.toBeNull();

  const x = pullerBounds!.x + pullerBounds!.width / 2;
  const startY = pullerBounds!.y + pullerBounds!.height / 2;
  const cdp = await page.context().newCDPSession(page);

  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: startY }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: startY + 180 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: startY + 320 }],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

  await expect(drawerTitle).not.toBeVisible();
  expect(runtimeErrors).toEqual([]);
});
