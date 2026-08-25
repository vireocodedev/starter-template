import React from "react";
import type { AppPreferences } from "@/app/ui/preferences/models/AppPreferences";

export type AppPreferencesContextValue = {
  preferences: AppPreferences;
  updatePreference: <TKey extends keyof AppPreferences>(key: TKey, value: AppPreferences[TKey]) => void;
  resetPreferences: () => void;
};

export const AppPreferencesContext = React.createContext<AppPreferencesContextValue | null>(null);
