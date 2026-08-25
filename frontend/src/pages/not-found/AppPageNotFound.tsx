import { HomeRounded, TravelExploreRounded } from "@mui/icons-material";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { APP_PAGES } from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useTranslation } from "react-i18next";
import { NOT_FOUND_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function AppPageNotFound() {
  const { t } = useTranslation(NOT_FOUND_TRANSLATION_NAMESPACE);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppPageLayout header={<AppPageHeader title={t("header.title")} description={t("header.description")} />}>
      <Paper
        variant="outlined"
        sx={{
          bgcolor: "surface.base",
          display: "grid",
          minHeight: { xs: 320, sm: 400 },
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
            <TravelExploreRounded sx={{ fontSize: 40 }} />
          </Box>
          <Stack spacing={1}>
            <Typography component="p" color="primary.main" sx={{ fontWeight: 800 }}>
              404
            </Typography>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
              {t("title")}
            </Typography>
            <Typography color="text.secondary">{t("description", { path: location.pathname })}</Typography>
          </Stack>
          <Button onClick={() => void navigate(APP_PAGES.home)} startIcon={<HomeRounded />} variant="contained">
            {t("return")}
          </Button>
        </Stack>
      </Paper>
    </AppPageLayout>
  );
}
