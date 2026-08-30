import { expect, test } from "@playwright/test";
import { APP_IDENTITY, PWA_POLICY } from "../../pwa-policy.mjs";
import { selectPwaFixtureRevision } from "../../scripts/pwa-update-fixture.mjs";

const buildRevisionSelector = 'meta[name="vireo-build-revision"]';

test("production manifest and service worker support an offline shell", async ({ context, page }) => {
  await page.route("**/api/auth/me", route =>
    route.fulfill({ status: 401, contentType: "application/json", body: '{"message":"Unauthorized"}' }),
  );
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref).toBeTruthy();
  const manifestResponse = await page.request.get(manifestHref!);
  expect(manifestResponse.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = (await manifestResponse.json()) as Record<string, unknown>;
  expect(manifest).toMatchObject({
    id: APP_IDENTITY.id,
    name: APP_IDENTITY.name,
    short_name: APP_IDENTITY.shortName,
    description: APP_IDENTITY.description,
    display: "standalone",
    start_url: APP_IDENTITY.startUrl,
    scope: APP_IDENTITY.scope,
  });
  expect(manifest.icons).toEqual(expect.arrayContaining([...PWA_POLICY.icons]));

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

  await context.setOffline(false);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("the controlled worker forwards and does not cache API requests", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.state ?? null)).toBe("activated");
  const networkProbe = await page.evaluate(async apiPathPrefix => {
    const response = await fetch(`${apiPathPrefix}/pwa-network-probe`);
    return {
      body: await response.json(),
      header: response.headers.get("x-vireo-network-probe"),
      status: response.status,
    };
  }, PWA_POLICY.apiPathPrefix);
  expect(networkProbe).toEqual({ body: { network: "passed" }, header: "passed", status: 200 });
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

test("the offline shell handles a deep link without falling back into the API namespace", async ({ context, page }) => {
  await page.route("**/api/auth/me", route =>
    route.fulfill({ status: 401, contentType: "application/json", body: '{"message":"Unauthorized"}' }),
  );
  await page.goto("/items");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.evaluate(async () => navigator.serviceWorker.ready);

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("a production worker update activates revision B after a user-safe prompt", async ({ page }) => {
  await selectPwaFixtureRevision("A");
  await page.route("**/api/auth/me", route =>
    route.fulfill({ status: 401, contentType: "application/json", body: '{"message":"Unauthorized"}' }),
  );
  await page.goto("/login");
  await expect(page.locator(buildRevisionSelector)).toHaveAttribute("content", "A");
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(buildRevisionSelector)).toHaveAttribute("content", "A");
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.state ?? null)).toBe("activated");

  await selectPwaFixtureRevision("B");
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });

  await expect
    .poll(() =>
      page.evaluate(async () => {
        const registration = await navigator.serviceWorker.ready;
        return registration.waiting?.state ?? null;
      }),
    )
    .toBe("installed");
  await expect(page.getByText("A new version is ready.")).toBeVisible();

  await page.getByRole("button", { name: "Update" }).click();
  await expect.poll(() => page.locator(buildRevisionSelector).getAttribute("content")).toBe("B");
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.state ?? null)).toBe("activated");
});
