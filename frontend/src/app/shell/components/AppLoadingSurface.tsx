import { Avatar, Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";
import { AppPageHomeView } from "@/pages/home/AppPageHomeView";

export function AppBootstrapFallback() {
  const { t } = useAppTranslation();

  return (
    <Box
      aria-label={t("loading.application")}
      role="status"
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
      <Avatar
        variant="rounded"
        sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontSize: 24, fontWeight: 800 }}
      >
        V
      </Avatar>
      <Typography sx={{ fontWeight: 800 }}>{t("brand.name")}</Typography>
      <VireoDelayedRender delay={150}>
        <CircularProgress aria-hidden size={28} />
      </VireoDelayedRender>
    </Box>
  );
}

type AppRouteFallbackProps = {
  variant?: "overview" | "page";
};

function AppRouteHeaderFallback() {
  return (
    <AppPageHeader
      description={
        <Skeleton
          aria-hidden
          sx={{ display: "block", fontSize: "inherit", maxWidth: "min(28rem, 55vw)", width: "28rem" }}
          variant="text"
        />
      }
      title={
        <Skeleton
          aria-hidden
          sx={{ display: "block", fontSize: "inherit", maxWidth: "min(12rem, 40vw)", width: "12rem" }}
          variant="text"
        />
      }
    />
  );
}

function GenericRouteBodyFallback() {
  return (
    <Stack data-app-route-fallback-variant="page" spacing={2}>
      <Skeleton height={48} variant="rounded" width="min(34rem, 100%)" />
      <Skeleton height={180} variant="rounded" />
    </Stack>
  );
}

export function AppRouteFallback({ variant = "page" }: AppRouteFallbackProps) {
  const { t } = useAppTranslation();

  if (variant === "overview") return <AppPageHomeView loading />;

  return (
    <AppPageLayout header={<AppRouteHeaderFallback />}>
      <Box aria-label={t("loading.page")} role="status" sx={{ minWidth: 0 }}>
        <VireoDelayedRender delay={150} sx={{ minWidth: 0 }}>
          <Box aria-hidden>
            <GenericRouteBodyFallback />
          </Box>
        </VireoDelayedRender>
      </Box>
    </AppPageLayout>
  );
}
