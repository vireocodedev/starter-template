import { parseAppEnv } from "@/app/config/app-env";
import { DEFAULT_APP_PREFERENCES } from "@/app/ui/preferences/models/AppPreferences";
import {
  createAppPreferencesStorage,
  type AppPreferencesStorageDiagnostic,
} from "@/app/ui/preferences/services/app-preferences-storage";
import { resolveDevelopmentCredentials } from "@/pages/login/login-development-credentials";
import { describe, expect, it, vi } from "vitest";

describe("safe browser state composition", () => {
  it("keeps credentials absent unless the build explicitly enables the demo hint", () => {
    expect(resolveDevelopmentCredentials("http", false)).toBeUndefined();
    expect(resolveDevelopmentCredentials("mock", false)).toBeUndefined();
    expect(resolveDevelopmentCredentials("mock", true)).toEqual({ username: "demo", password: "demo123" });
    expect(parseAppEnv({} as ImportMetaEnv).VITE_SHOW_DEMO_CREDENTIALS).toBe(false);
    expect(
      parseAppEnv({ VITE_SHOW_DEMO_CREDENTIALS: "true" } as unknown as ImportMetaEnv).VITE_SHOW_DEMO_CREDENTIALS,
    ).toBe(true);
  });

  it("degrades storage failures without exposing keys, values, or exception details", () => {
    const diagnostics: AppPreferencesStorageDiagnostic[] = [];
    const storage = createAppPreferencesStorage(
      () => {
        throw new Error("secret browser failure");
      },
      diagnostic => diagnostics.push(diagnostic),
    );

    expect(storage.read()).toBeNull();
    expect(storage.write(DEFAULT_APP_PREFERENCES)).toBe(false);
    expect(storage.remove()).toBe(false);
    expect(diagnostics).toEqual([
      { code: "storage-unavailable", operation: "read", storage: "local" },
      { code: "storage-unavailable", operation: "write", storage: "local" },
      { code: "storage-unavailable", operation: "remove", storage: "local" },
    ]);
    expect(JSON.stringify(diagnostics)).not.toContain("secret");
    expect(JSON.stringify(diagnostics)).not.toContain("preferences");
  });

  it("classifies corrupt persisted JSON and returns a safe empty value", () => {
    const diagnostics = vi.fn();
    const browserStorage = {
      getItem: () => "not-json",
      removeItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 1,
    } satisfies Storage;
    const storage = createAppPreferencesStorage(() => browserStorage, diagnostics);

    expect(storage.read()).toBeNull();
    expect(diagnostics).toHaveBeenCalledWith({ code: "invalid-value", operation: "read", storage: "local" });
  });
});
