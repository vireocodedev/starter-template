import { Alert, type AlertProps } from "@mui/material";
import type { AppAuthFailure } from "@/app/data/network/models/AppAuthFailure";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

const FAILURE_MESSAGE_KEYS = {
  unauthenticated: "auth.outcomes.unauthenticated",
  "invalid-credentials": "auth.outcomes.invalidCredentials",
  forbidden: "auth.outcomes.forbidden",
  "expired-session": "auth.outcomes.expiredSession",
  offline: "auth.outcomes.offline",
  server: "auth.outcomes.server",
  "malformed-response": "auth.outcomes.malformedResponse",
  "logout-failure": "auth.outcomes.logoutFailure",
} as const;

export function AppAuthFailureAlert({ failure, ...props }: { failure: AppAuthFailure } & Omit<AlertProps, "children">) {
  const { t } = useAppTranslation();

  return (
    <Alert {...props} role="alert" severity="error">
      {t(FAILURE_MESSAGE_KEYS[failure.kind])}
    </Alert>
  );
}
