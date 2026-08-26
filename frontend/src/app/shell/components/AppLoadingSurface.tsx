import {
  APP_ROUTE_SKELETON_COMPOSITIONS,
  type AppRouteLoadingHeader,
  type AppRouteLoadingPolicy,
} from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";
import { Avatar, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { VireoLoadingRegion } from "@vireocodedev/starter-ui";
import { useTranslation } from "react-i18next";

function AppApplicationProgressFallback({ label }: { label: string }) {
  const { t } = useAppTranslation();

  return (
    <VireoLoadingRegion
      loading
      loadingLabel={label}
      data-app-route-fallback-policy="progress"
      sx={{
        alignItems: "center",
        bgcolor: "surface.sunken",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        justifyContent: "center",
        minHeight: "100dvh",
        p: 3,
      }}
    >
      {({ loadingVisible }) => (
        <>
          <Avatar
            variant="rounded"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontSize: 24, fontWeight: 800 }}
          >
            V
          </Avatar>
          <Typography sx={{ fontWeight: 800 }}>{t("brand.name")}</Typography>
          <Box sx={{ alignItems: "center", display: "flex", height: 28, justifyContent: "center" }}>
            {loadingVisible ? <CircularProgress aria-hidden size={28} /> : null}
          </Box>
        </>
      )}
    </VireoLoadingRegion>
  );
}

export function AppBootstrapFallback() {
  const { t } = useAppTranslation();
  return <AppApplicationProgressFallback label={t("loading.application")} />;
}

function AppRouteHeaderFallback({ header }: { header: AppRouteLoadingHeader }) {
  const { i18n } = useTranslation();
  const translate = i18n.getFixedT(i18n.resolvedLanguage ?? i18n.language, header.namespace as never) as unknown as (
    key: string,
  ) => string;

  return (
    <AppPageHeader
      backLabel={header.backLabelKey ? translate(header.backLabelKey) : undefined}
      backTo={header.backTo}
      description={translate(header.descriptionKey)}
      title={translate(header.titleKey)}
    />
  );
}

function AppPageProgressFallback({ header }: { header?: AppRouteLoadingHeader }) {
  const { t } = useAppTranslation();

  return (
    <AppPageLayout header={header ? <AppRouteHeaderFallback header={header} /> : undefined}>
      <VireoLoadingRegion
        loading
        loadingLabel={t("loading.page")}
        data-app-route-fallback-policy="progress"
        sx={{ minWidth: 0 }}
      >
        {({ loadingVisible }) => (
          <Stack
            data-app-route-fallback-variant="progress"
            sx={{ alignItems: "center", justifyContent: "center", minHeight: 180 }}
          >
            {loadingVisible ? <CircularProgress aria-hidden size={28} /> : null}
          </Stack>
        )}
      </VireoLoadingRegion>
    </AppPageLayout>
  );
}

function assertNever(value: never): never {
  throw new Error(`Unhandled route loading policy: ${JSON.stringify(value)}`);
}

export function AppRouteFallback({ loading }: { loading: AppRouteLoadingPolicy }) {
  const { t } = useAppTranslation();

  switch (loading.policy) {
    case "none":
    case "retain":
      return null;
    case "progress":
      return loading.frame === "application" ? (
        <AppApplicationProgressFallback label={t("loading.page")} />
      ) : (
        <AppPageProgressFallback header={loading.header} />
      );
    case "skeleton": {
      const LoadingComposition = APP_ROUTE_SKELETON_COMPOSITIONS[loading.composition];
      return <LoadingComposition loading />;
    }
    default:
      return assertNever(loading);
  }
}
