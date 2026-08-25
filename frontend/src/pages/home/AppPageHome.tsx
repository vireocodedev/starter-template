import { CheckCircleOutlined, Inventory2Outlined, OfflineBoltOutlined } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";
import { useTranslation } from "react-i18next";
import { HOME_TRANSLATION_NAMESPACE } from "@/app/app.localization";

export function AppPageHome() {
  useAppTranslation();
  const { t } = useTranslation(HOME_TRANSLATION_NAMESPACE);
  const cards = [
    { icon: <Inventory2Outlined color="primary" />, title: t("cards.entity.title"), body: t("cards.entity.body") },
    {
      icon: <CheckCircleOutlined color="success" />,
      title: t("cards.contracts.title"),
      body: t("cards.contracts.body"),
    },
    { icon: <OfflineBoltOutlined color="warning" />, title: t("cards.pwa.title"), body: t("cards.pwa.body") },
  ];

  return (
    <AppPageLayout header={<AppPageHeader title={t("header.title")} description={t("header.description")} />}>
      <Box sx={{ maxWidth: 1280, mx: "auto", width: "100%" }}>
        <Chip color="primary" label={t("version")} size="small" />
        <Typography
          component="h2"
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            fontWeight: 850,
            letterSpacing: "-0.025em",
            lineHeight: { xs: 1.12, sm: 1.08 },
            mt: { xs: 1.5, sm: 2 },
            maxWidth: 760,
          }}
        >
          {t("title")}
        </Typography>
        <Typography
          color="text.primary"
          sx={{
            fontSize: { xs: "0.9375rem", sm: "1.125rem" },
            lineHeight: 1.55,
            mt: { xs: 1.5, sm: 2 },
            maxWidth: 720,
            opacity: 0.58,
          }}
        >
          {t("introduction")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, sm: 2 },
            gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
            mt: { xs: 3, sm: 4 },
          }}
        >
          {cards.map(card => (
            <Card key={card.title} sx={{ borderColor: "divider" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
                <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ alignItems: "center" }}>
                  {card.icon}
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, fontWeight: 750 }}>
                    {card.title}
                  </Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, mt: 1 }}>
                  {card.body}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </AppPageLayout>
  );
}
