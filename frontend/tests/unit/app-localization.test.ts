import { describe, expect, it } from "vitest";
import { APP_LOCALIZATION_RESOURCES } from "@/app/app.localization";

function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];

  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key));
}

describe("application localization registry", () => {
  it("keeps application and feature locale keys in parity", () => {
    const canonical = APP_LOCALIZATION_RESOURCES.en;

    for (const [locale, resources] of Object.entries(APP_LOCALIZATION_RESOURCES)) {
      expect(leafPaths(resources).sort(), `locale ${locale}`).toEqual(leafPaths(canonical).sort());
    }
  });
});
