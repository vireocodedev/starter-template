import React from "react";
import { createAuthRedirectState } from "@vireocodedev/starter-shell";
import { toast } from "@vireocodedev/starter-ui/sonner";
import { useLocation, useNavigate } from "react-router";
import { APP_PAGES } from "@/app/app.pages";
import { appSessionExpiry } from "@/app/data/network/services/appSessionExpiry";
import { useAppAuth } from "@/app/shell/hooks/useAppAuth";

const SESSION_EXPIRED_TOAST_ID = "app-session-expired";

/** Converts a centralized HTTP session-expiry signal into application auth and routing state. */
export function AppSessionRecoveryProvider({ children }: React.PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const { expireSession, user } = useAppAuth();

  React.useEffect(() => {
    if (user) appSessionExpiry.reset();
  }, [user]);

  React.useEffect(
    () =>
      appSessionExpiry.subscribe(() => {
        const redirectState = createAuthRedirectState(location, APP_PAGES.login);

        navigate(APP_PAGES.login, { replace: true, state: redirectState });
        expireSession();
        toast.error("Your session expired. Sign in again.", { id: SESSION_EXPIRED_TOAST_ID });
      }),
    [expireSession, location, navigate],
  );

  return <>{children}</>;
}
