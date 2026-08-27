import React from "react";
import { Alert, Button, Snackbar, Stack } from "@mui/material";
import { useUnsavedChangesRequestDiscard } from "@vireocodedev/ui";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

/** Owns service-worker readiness and user-safe application update feedback. */
export function AppPwaProvider({ children }: React.PropsWithChildren) {
  const { t } = useAppTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  const applyUpdate = useUnsavedChangesRequestDiscard(() => updateServiceWorker(true));

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
    </>
  );
}
