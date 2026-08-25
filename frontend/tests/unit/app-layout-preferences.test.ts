import { describe, expect, it } from "vitest";
import { AppPreferencesSchema, DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";

describe("application layout preferences", () => {
  it("migrates stored preferences created before navigation width was introduced", () => {
    const { locale, navigationMode, navigationWidth } = AppPreferencesSchema.parse({
      darkMode: true,
      tableSize: "medium",
      pageWidth: "full",
      desktopSurface: "dialog",
      allowSidePanelResize: true,
      navigationLocked: false,
    });

    expect(locale).toBe("en");
    expect(navigationMode).toBe("expanded");
    expect(navigationWidth).toBe(264);
  });

  it("ships a valid default preference set", () => {
    expect(AppPreferencesSchema.parse(DEFAULT_APP_PREFERENCES)).toEqual(DEFAULT_APP_PREFERENCES);
  });

  it("keeps stored expanded width inside the capability range", () => {
    expect(
      AppPreferencesSchema.safeParse({
        ...DEFAULT_APP_PREFERENCES,
        navigationWidth: 219,
      }).success,
    ).toBe(false);
    expect(
      AppPreferencesSchema.safeParse({
        ...DEFAULT_APP_PREFERENCES,
        navigationWidth: 481,
      }).success,
    ).toBe(false);
  });
});
