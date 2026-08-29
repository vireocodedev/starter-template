import type { AppPreferences } from "../models/AppPreferences";

export type AppPreferencesStorageDiagnostic = Readonly<{
  code: "invalid-value" | "storage-unavailable";
  operation: "read" | "remove" | "write";
  storage: "local";
}>;

export type AppPreferencesStorage = Readonly<{
  read(): unknown;
  remove(): boolean;
  write(value: AppPreferences): boolean;
}>;

export function createAppPreferencesStorage(
  getStorage: () => Storage = () => globalThis.localStorage,
  onDiagnostic: (diagnostic: AppPreferencesStorageDiagnostic) => void = () => undefined,
): AppPreferencesStorage {
  const reportUnavailable = (operation: AppPreferencesStorageDiagnostic["operation"]) =>
    onDiagnostic({ code: "storage-unavailable", operation, storage: "local" });

  return {
    read() {
      try {
        const value = getStorage().getItem("starter-template:preferences");
        if (value === null) return null;
        try {
          return JSON.parse(value) as unknown;
        } catch {
          onDiagnostic({ code: "invalid-value", operation: "read", storage: "local" });
          return null;
        }
      } catch {
        reportUnavailable("read");
        return null;
      }
    },
    remove() {
      try {
        getStorage().removeItem("starter-template:preferences");
        return true;
      } catch {
        reportUnavailable("remove");
        return false;
      }
    },
    write(value) {
      try {
        getStorage().setItem("starter-template:preferences", JSON.stringify(value));
        return true;
      } catch {
        reportUnavailable("write");
        return false;
      }
    },
  };
}
