import React from "react";
import { Snackbar } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { appSessionExpiry } from "@/app/data/network/services/appSessionExpiry";
import { appAuthApi } from "@/app/data/network/api/app-auth.api.online";
import { type AppAuthFailure, toAppAuthFailureError } from "@/app/data/network/models/AppAuthFailure";
import type { AuthUser } from "@/app/data/network/models/AuthUser";
import { AppAuthFailureAlert } from "@/app/shell/components/AppAuthFailureAlert";
import { AppAuthContext, type AppAuthContextValue } from "../contexts/AppAuthContext";

export function AppAuthProvider({ children }: React.PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failure, setFailure] = React.useState<AppAuthFailure | null>(null);

  React.useEffect(() => {
    void appAuthApi
      .me()
      .then(authenticatedUser => {
        appSessionExpiry.reset();
        setFailure(null);
        setUser(authenticatedUser);
      })
      .catch(error => {
        const authError = toAppAuthFailureError(error, "bootstrap");
        setFailure(authError.failure);
        if (authError.failure.kind === "unauthenticated") setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = React.useMemo<AppAuthContextValue>(
    () => ({
      user,
      loading,
      failure,
      expireSession: () => {
        queryClient.clear();
        setFailure({ kind: "expired-session" });
        setUser(null);
      },
      login: async (username, password) => {
        setFailure(null);
        try {
          await appAuthApi.login(username, password);
        } catch (error) {
          const authError = toAppAuthFailureError(error, "login");
          setFailure(authError.failure);
          throw authError;
        }

        try {
          const authenticatedUser = await appAuthApi.me();
          appSessionExpiry.reset();
          setUser(authenticatedUser);
        } catch (error) {
          const authError = toAppAuthFailureError(error, "session");
          setFailure(authError.failure);
          throw authError;
        }
      },
      logout: async () => {
        appSessionExpiry.beginManualLogout();
        setFailure(null);
        try {
          await appAuthApi.logout();
          queryClient.clear();
          setUser(null);
        } catch (error) {
          appSessionExpiry.cancelManualLogout();
          const authError = toAppAuthFailureError(error, "logout");
          setFailure(authError.failure);
          throw authError;
        }
      },
    }),
    [failure, loading, queryClient, user],
  );

  return (
    <AppAuthContext.Provider value={value}>
      {children}
      <Snackbar anchorOrigin={{ horizontal: "center", vertical: "top" }} open={failure?.kind === "logout-failure"}>
        <AppAuthFailureAlert failure={{ kind: "logout-failure" }} onClose={() => setFailure(null)} variant="filled" />
      </Snackbar>
    </AppAuthContext.Provider>
  );
}
