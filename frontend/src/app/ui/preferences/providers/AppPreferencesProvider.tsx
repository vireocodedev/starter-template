import React from "react";
import {
  AppPreferencesSchema,
  DEFAULT_APP_PREFERENCES,
  type AppPreferences,
} from "@/app/ui/preferences/models/AppPreferences";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";
import { createAppPreferencesStorage } from "@/app/ui/preferences/services/app-preferences-storage";

const preferencesStorage = createAppPreferencesStorage();

function readPreferences(): AppPreferences {
  try {
    return AppPreferencesSchema.parse(preferencesStorage.read());
  } catch {
    return DEFAULT_APP_PREFERENCES;
  }
}

export function AppPreferencesProvider({ children }: React.PropsWithChildren) {
  const [preferences, setPreferences] = React.useState(readPreferences);
  const updatePreference = React.useCallback(
    <TKey extends keyof AppPreferences>(key: TKey, value: AppPreferences[TKey]) => {
      setPreferences(previous => {
        const next = { ...previous, [key]: value };
        preferencesStorage.write(next);
        return next;
      });
    },
    [],
  );
  const resetPreferences = React.useCallback(() => {
    preferencesStorage.remove();
    setPreferences(DEFAULT_APP_PREFERENCES);
  }, []);
  const value = React.useMemo(
    () => ({ preferences, updatePreference, resetPreferences }),
    [preferences, resetPreferences, updatePreference],
  );
  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}
