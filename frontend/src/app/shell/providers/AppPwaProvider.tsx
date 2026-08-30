import React from "react";
import { Alert, Button, Snackbar, Stack } from "@mui/material";
import { useUnsavedChangesRequestDiscard } from "@vireocodedev/ui";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

export const APP_PWA_UPDATE_DISCOVERY_INTERVAL_MS = 60 * 60 * 1_000;

function logPwaDiagnostic(event: string, error: unknown): void {
  // Keep the user-facing message stable while preserving useful local diagnostics.
  console.warn(`[PWA] ${event}`, error);
}

/** Owns service-worker readiness and user-safe application update feedback. */
export function AppPwaProvider({ children }: React.PropsWithChildren) {
  const { t } = useAppTranslation();
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null);
  const [registrationError, setRegistrationError] = React.useState(false);
  const [updateError, setUpdateError] = React.useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisterError(error) {
      logPwaDiagnostic("Service-worker registration failed", error);
      setRegistrationError(true);
    },
    onRegisteredSW(_serviceWorkerUrl, serviceWorkerRegistration) {
      setRegistration(serviceWorkerRegistration ?? null);
    },
  });

  React.useEffect(() => {
    if (!registration) return;
    const discoverUpdate = () => {
      void registration.update().catch(error => {
        logPwaDiagnostic("Service-worker update discovery failed", error);
        setUpdateError(true);
      });
    };
    const interval = window.setInterval(discoverUpdate, APP_PWA_UPDATE_DISCOVERY_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [registration]);

  const applyUpdate = useUnsavedChangesRequestDiscard(() => {
    void updateServiceWorker(true).catch(error => {
      logPwaDiagnostic("Service-worker update activation failed", error);
      setUpdateError(true);
    });
  });

  return (
    <>
      {children}
      <Snackbar anchorOrigin={{ horizontal: "center", vertical: "top" }} open={needRefresh}>
        <Alert
          action={
            <Stack direction="row" spacing={0.5}>
              <Button color="inherit" onClick={() => setNeedRefresh(false)} size="small">
                {t("pwa.later")}
              </Button>
              <Button color="inherit" onClick={applyUpdate} size="small" variant="outlined">
                {t("pwa.update")}
              </Button>
            </Stack>
          }
          severity="info"
          variant="filled"
        >
          {t("pwa.updateReady")}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        autoHideDuration={6000}
        onClose={() => setOfflineReady(false)}
        open={!needRefresh && offlineReady}
      >
        <Alert onClose={() => setOfflineReady(false)} severity="success" variant="filled">
          {t("pwa.offlineReady")}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        autoHideDuration={8_000}
        onClose={() => {
          setRegistrationError(false);
          setUpdateError(false);
        }}
        open={registrationError || updateError}
      >
        <Alert
          onClose={() => {
            setRegistrationError(false);
            setUpdateError(false);
          }}
          severity="warning"
          variant="filled"
        >
          {t(registrationError ? "pwa.registrationUnavailable" : "pwa.updateUnavailable")}
        </Alert>
      </Snackbar>
    </>
  );
}
