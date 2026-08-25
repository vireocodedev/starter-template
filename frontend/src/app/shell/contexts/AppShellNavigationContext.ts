import { createContext } from "react";

export type AppShellNavigationContextValue = {
  mobile: boolean;
  openNavigation: () => void;
};

export const AppShellNavigationContext = createContext<AppShellNavigationContextValue | undefined>(undefined);
