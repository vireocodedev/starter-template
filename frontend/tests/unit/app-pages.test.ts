import { describe, expect, it, vi } from "vitest";
import { APP_NAVIGATION_PAGES, APP_PAGE_REGISTRY, APP_PAGES, loadAppPage, preloadAppPage } from "@/app/app.pages";

describe("application page registry", () => {
  it("owns every route path and path builder in one registry", () => {
    for (const [id, definition] of Object.entries(APP_PAGE_REGISTRY)) {
      expect(APP_PAGES[id as keyof typeof APP_PAGES]).toBe(definition.path);
      expect(definition.buildPath()).toBe(definition.path);
      expect(definition.load).toEqual(expect.any(Function));
      expect(["none", "progress", "retain", "skeleton"]).toContain(definition.loading.policy);
    }
  });

  it("declares exact skeletons only for routes with shared synchronous composition", () => {
    const skeletonRoutes = Object.entries(APP_PAGE_REGISTRY)
      .filter(([, definition]) => definition.loading.policy === "skeleton")
      .map(([id]) => id);

    expect(skeletonRoutes).toEqual(["home"]);
    expect(APP_PAGE_REGISTRY.home.loading).toEqual({ policy: "skeleton", composition: "overview" });
    expect(APP_PAGE_REGISTRY.login.loading).toEqual({ policy: "progress", frame: "application" });
  });

  it("keeps navigation entries ordered and unique", () => {
    const paths = APP_NAVIGATION_PAGES.map(page => page.path);
    const orders = APP_NAVIGATION_PAGES.map(page => page.order);

    expect(new Set(paths).size).toBe(paths.length);
    expect(orders).toEqual([...orders].sort((left, right) => left - right));
  });

  it("shares one route-module promise between intent prefetch and rendering", async () => {
    const load = vi.spyOn(APP_PAGE_REGISTRY.home, "load");

    preloadAppPage(APP_PAGES.home);
    await loadAppPage("home");

    expect(load).toHaveBeenCalledOnce();
  });
});
