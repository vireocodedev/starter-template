import { Avatar, Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import { VireoDelayedRender } from "@vireocodedev/starter-ui";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

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

function OverviewRouteBodyFallback() {
  return (
    <Box
      data-app-route-fallback-variant="overview"
      sx={{
        bgcolor: "surface.base",
        border: 1,
        borderColor: "divider",
        maxWidth: 1280,
        mx: "auto",
        overflow: "hidden",
        p: { xs: 2, sm: 3, md: 4 },
        position: "relative",
        width: "100%",
        "&::before": {
          bgcolor: "primary.main",
          content: '""',
          height: 4,
          insetInline: 0,
          position: "absolute",
          top: 0,
        },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {[96, 84, 74, 110].map(width => (
          <Skeleton key={width} height={24} variant="rounded" width={width} />
        ))}
      </Stack>
      <Stack spacing={0.5} sx={{ mt: { xs: 2, sm: 2.5 }, maxWidth: 760 }}>
        <Skeleton sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }} variant="text" width="84%" />
        <Skeleton sx={{ fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" } }} variant="text" width="62%" />
      </Stack>
      <Stack spacing={0.25} sx={{ mt: { xs: 1.5, sm: 2 }, maxWidth: 720 }}>
        <Skeleton sx={{ fontSize: { xs: "0.9375rem", sm: "1.125rem" } }} variant="text" width="100%" />
        <Skeleton sx={{ fontSize: { xs: "0.9375rem", sm: "1.125rem" } }} variant="text" width="72%" />
      </Stack>
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1.5, sm: 2 },
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
          mt: { xs: 3, sm: 4 },
        }}
      >
        {[0, 1, 2].map(index => (
          <Box
            key={index}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              minHeight: 176,
              p: { xs: 2, sm: 3 },
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Skeleton height={14} variant="rounded" width={72} />
              <Skeleton height={14} variant="rounded" width={64} />
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 2 }}>
              <Skeleton height={40} variant="rounded" width={40} />
              <Skeleton height={22} variant="rounded" width="55%" />
            </Stack>
            <Skeleton sx={{ mt: 1 }} variant="text" width="88%" />
            <Skeleton variant="text" width="66%" />
          </Box>
        ))}
      </Box>
    </Box>
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

  return (
    <AppPageLayout header={<AppRouteHeaderFallback />}>
      <Box aria-label={t("loading.page")} role="status" sx={{ minWidth: 0 }}>
        <VireoDelayedRender delay={150} sx={{ minWidth: 0 }}>
          <Box aria-hidden>{variant === "overview" ? <OverviewRouteBodyFallback /> : <GenericRouteBodyFallback />}</Box>
        </VireoDelayedRender>
      </Box>
    </AppPageLayout>
  );
}
