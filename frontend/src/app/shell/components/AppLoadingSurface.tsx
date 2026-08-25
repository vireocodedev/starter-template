import { Avatar, Box, CircularProgress, Skeleton, Stack, Typography } from "@mui/material";
import { VireoDelayedRender } from "@vireocodedev/starter-ui";
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

export function AppRouteFallback() {
  const { t } = useAppTranslation();

  return (
    <Box
      aria-label={t("loading.page")}
      role="status"
      sx={{ bgcolor: "surface.sunken", flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden", p: { xs: 2, sm: 3 } }}
    >
      <VireoDelayedRender delay={150} sx={{ height: "100%" }}>
        <Stack aria-hidden spacing={2}>
          <Skeleton height={40} variant="rounded" width="min(24rem, 70%)" />
          <Skeleton height={20} variant="rounded" width="min(34rem, 90%)" />
          <Skeleton height={180} variant="rounded" />
        </Stack>
      </VireoDelayedRender>
    </Box>
  );
}
