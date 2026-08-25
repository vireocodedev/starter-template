import { Paper, Stack, Typography } from "@mui/material";
import { APP_PAGES } from "@/app/app.pages";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { BASIC_PAGE_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { useTranslation } from "react-i18next";

export function AppPageBasicPage() {
  const { t } = useTranslation(BASIC_PAGE_TRANSLATION_NAMESPACE);
  return (
    <AppPageLayout
      header={
        <AppPageHeader
          backLabel={t("header.back")}
          backTo={APP_PAGES.devTools}
          title={t("header.title")}
          description={t("header.description")}
        />
      }
    >
      <Paper variant="outlined" sx={{ bgcolor: "surface.base", p: 3 }}>
        <Stack spacing={1}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
            {t("content.title")}
          </Typography>
          <Typography color="text.secondary">{t("content.description")}</Typography>
        </Stack>
      </Paper>
    </AppPageLayout>
  );
}
