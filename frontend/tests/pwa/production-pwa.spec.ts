import { expect, test } from "@playwright/test";

test("production manifest and service worker support an offline shell", async ({ context, page }) => {
  await page.route("**/api/auth/me", route =>
    route.fulfill({ status: 401, contentType: "application/json", body: '{"message":"Unauthorized"}' }),
  );
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
  const manifest = (await page.request.get(manifestHref!)).json() as Promise<Record<string, unknown>>;
  await expect(manifest).resolves.toMatchObject({
    name: "Vireo Starter App",
    short_name: "Vireo",
    display: "standalone",
    start_url: "/",
  });

  await page.evaluate(async () => navigator.serviceWorker.ready);
  const registrations = await page.evaluate(async () =>
    (await navigator.serviceWorker.getRegistrations()).map(registration => registration.scope),
  );
  expect(registrations).toContain("http://127.0.0.1:4173/");

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  const apiResult = await page.evaluate(async () => {
    try {
      await fetch("/api/offline-contract-probe");
      return "resolved";
    } catch {
      return "rejected";
    }
  });
  expect(apiResult).toBe("rejected");
});

test("the service worker does not cache authenticated API responses", async ({ page }) => {
  await page.goto("/login");
  const cacheKeys = await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    return await caches.keys();
  });
  const cachedRequests = await page.evaluate(async keys => {
    const requests = await Promise.all(keys.map(async key => await caches.open(key).then(cache => cache.keys())));
    return requests.flat().map(request => new URL(request.url).pathname);
  }, cacheKeys);

  expect(cachedRequests.some(path => path === "/api" || path.startsWith("/api/"))).toBe(false);
});
