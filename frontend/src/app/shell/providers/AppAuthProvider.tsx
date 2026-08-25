import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { appSessionExpiry } from "@/app/data/network/services/appSessionExpiry";
import { appAuthApi } from "@/app/data/network/api/app-auth.api.online";
import type { AuthUser } from "@/app/data/network/models/AuthUser";
import { AppAuthContext, type AppAuthContextValue } from "../contexts/AppAuthContext";

export function AppAuthProvider({ children }: React.PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void appAuthApi
      .me()
      .then(authenticatedUser => {
        appSessionExpiry.reset();
        setUser(authenticatedUser);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = React.useMemo<AppAuthContextValue>(
    () => ({
      user,
      loading,
      expireSession: () => {
        queryClient.clear();
        setUser(null);
      },
      login: async (username, password) => {
        await appAuthApi.login(username, password);
        const authenticatedUser = await appAuthApi.me();
        appSessionExpiry.reset();
        setUser(authenticatedUser);
      },
      logout: async () => {
        appSessionExpiry.beginManualLogout();
        try {
          await appAuthApi.logout();
          queryClient.clear();
          setUser(null);
        } catch (error) {
          appSessionExpiry.cancelManualLogout();
          throw error;
        }
      },
    }),
    [loading, queryClient, user],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}
