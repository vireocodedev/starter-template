import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { PageOverlayControllerProvider, VireoConfirmationProvider } from "@vireocodedev/starter-ui";
import { AppShellNavigationContext } from "@/app/shell/contexts/AppShellNavigationContext";
import { AppUnsavedChangesProvider } from "@/app/shell/providers/AppUnsavedChangesProvider";
import { AppLocalizationProvider } from "@/app/ui/localization/app-localization-provider";
import { AppPreferencesProvider } from "@/app/ui/preferences/providers/AppPreferencesProvider";
import { AppThemeProvider } from "@/app/ui/theme/AppThemeProvider";

export type AppStorybookProviderProps = React.PropsWithChildren<{
  initialEntries?: string[];
  mobile?: boolean;
}>;

export function AppStorybookProvider({ children, initialEntries = ["/"], mobile = false }: AppStorybookProviderProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
        },
      }),
  );
  const navigation = React.useMemo(() => ({ mobile, openNavigation: () => undefined }), [mobile]);

  return (
    <AppPreferencesProvider>
      <AppLocalizationProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={initialEntries}>
              <AppShellNavigationContext.Provider value={navigation}>
                <PageOverlayControllerProvider>
                  <VireoConfirmationProvider>
                    <AppUnsavedChangesProvider>{children}</AppUnsavedChangesProvider>
                  </VireoConfirmationProvider>
                </PageOverlayControllerProvider>
              </AppShellNavigationContext.Provider>
            </MemoryRouter>
          </QueryClientProvider>
        </AppThemeProvider>
      </AppLocalizationProvider>
    </AppPreferencesProvider>
  );
}
