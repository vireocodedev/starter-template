import { useContext } from "react";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";

export function useAppShellNavigation() {
  const value = useContext(AppShellNavigationContext);
  if (!value) throw new Error("useAppShellNavigation must be used inside AppShellLayout.");
  return value;
}
