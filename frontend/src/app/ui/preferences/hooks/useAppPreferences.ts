import React from "react";
import { AppPreferencesContext } from "@/app/ui/preferences/contexts/AppPreferencesContext";

export function useAppPreferences() {
  const value = React.useContext(AppPreferencesContext);
  if (!value) throw new Error("useAppPreferences must be used inside AppPreferencesProvider.");
  return value;
}
