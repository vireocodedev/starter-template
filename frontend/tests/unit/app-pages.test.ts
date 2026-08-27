import { describe, expect, it, vi } from "vitest";
import {
  APP_NAVIGATION_PAGES,
  APP_PAGE_REGISTRY,
  APP_PAGES,
  APP_ROUTE_SKELETON_COMPOSITIONS,
  loadAppPage,
  preloadAppPage,
} from "@/app/app.pages";
import { APP_LOCALIZATION_RESOURCES } from "@/app/app.localization";

function hasNestedKey(value: unknown, path: string): boolean {
  return path.split(".").every(segment => {
    if (!value || typeof value !== "object" || !(segment in value)) return false;
    value = (value as Record<string, unknown>)[segment];
    return true;
  });
}

describe("application page registry", () => {
  it("owns every route path and path builder in one registry", () => {
    for (const [id, definition] of Object.entries(APP_PAGE_REGISTRY)) {
      expect(APP_PAGES[id as keyof typeof APP_PAGES]).toBe(definition.path);
      expect(definition.buildPath()).toBe(definition.path);
      expect(["eager", "lazy"]).toContain(definition.render);
      if (definition.render === "lazy") expect(definition.load).toEqual(expect.any(Function));
      else expect(definition.component).toEqual(expect.any(Function));
      expect(["none", "progress", "retain", "skeleton"]).toContain(definition.loading.policy);
    }
  });

  it("declares exact skeletons only for routes with shared synchronous composition", () => {
    expect(Object.values(APP_PAGE_REGISTRY).map(definition => definition.loading.policy)).not.toContain("skeleton");
    expect(Object.keys(APP_ROUTE_SKELETON_COMPOSITIONS)).toEqual(["overview"]);
    expect(APP_PAGE_REGISTRY.home.loading).toEqual({ policy: "none" });
    expect(APP_PAGE_REGISTRY.login.loading).toEqual({ policy: "progress", frame: "application" });
  });

  it("renders the synchronous Overview eagerly and preserves lazy boundaries for feature routes", () => {
    expect(APP_PAGE_REGISTRY.home.render).toBe("eager");
    expect(APP_PAGE_REGISTRY.items.render).toBe("lazy");
    expect(APP_PAGE_REGISTRY.settings.render).toBe("lazy");
    expect(APP_PAGE_REGISTRY.login.render).toBe("lazy");
  });

  it("resolves every progress-header key in every supported locale", () => {
    for (const resources of Object.values(APP_LOCALIZATION_RESOURCES)) {
      for (const definition of Object.values(APP_PAGE_REGISTRY)) {
        if (definition.loading.policy !== "progress" || definition.loading.frame !== "page") continue;
        const header = definition.loading.header;
        if (!header) continue;
        const namespace = resources[header.namespace as keyof typeof resources];

        expect(namespace, `Missing namespace ${header.namespace}`).toBeDefined();
        expect(hasNestedKey(namespace, header.titleKey), `${header.namespace}:${header.titleKey}`).toBe(true);
        expect(hasNestedKey(namespace, header.descriptionKey), `${header.namespace}:${header.descriptionKey}`).toBe(
          true,
        );
        if (header.backLabelKey) {
          expect(hasNestedKey(namespace, header.backLabelKey), `${header.namespace}:${header.backLabelKey}`).toBe(true);
        }
      }
    }
  });

  it("keeps navigation entries ordered and unique", () => {
    const paths = APP_NAVIGATION_PAGES.map(page => page.path);
    const orders = APP_NAVIGATION_PAGES.map(page => page.order);

    expect(new Set(paths).size).toBe(paths.length);
    expect(orders).toEqual([...orders].sort((left, right) => left - right));
  });

  it("shares one route-module promise between intent prefetch and rendering", async () => {
    const load = vi.spyOn(APP_PAGE_REGISTRY.items, "load");

    preloadAppPage(APP_PAGES.items);
    await loadAppPage("items");

    expect(load).toHaveBeenCalledOnce();
  });
});
