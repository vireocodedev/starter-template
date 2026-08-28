import { HomeRounded, LockRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { VireoResponsiveCard } from "@vireocodedev/ui";
import { useNavigate } from "react-router";
import { APP_PAGES } from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useTranslation } from "react-i18next";
import { FORBIDDEN_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function AppPageForbidden() {
  const { t } = useTranslation(FORBIDDEN_TRANSLATION_NAMESPACE);
  const navigate = useNavigate();

  return (
    <AppPageLayout
      paddingOnCompact={false}
      header={<AppPageHeader title={t("header.title")} description={t("header.description")} />}
    >
      <VireoResponsiveCard
        variant="outlined"
        sx={{
          display: "grid",
          minHeight: { xs: "100%", sm: 400 },
          p: { xs: 3, sm: 5 },
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <Stack spacing={2.5} sx={{ alignItems: "center", maxWidth: 560 }}>
          <Box
            sx={{
              alignItems: "center",
              bgcolor: "action.hover",
              borderRadius: "50%",
              color: "text.secondary",
              display: "flex",
              height: 72,
              justifyContent: "center",
              width: 72,
            }}
          >
            <LockRounded sx={{ fontSize: 40 }} />
          </Box>
          <Stack spacing={1}>
            <Typography component="p" color="primary.main" sx={{ fontWeight: 800 }}>
              403
            </Typography>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
              {t("title")}
            </Typography>
            <Typography color="text.secondary">{t("description")}</Typography>
          </Stack>
          <Button onClick={() => void navigate(APP_PAGES.home)} startIcon={<HomeRounded />} variant="contained">
            {t("return")}
          </Button>
        </Stack>
      </VireoResponsiveCard>
    </AppPageLayout>
  );
}
