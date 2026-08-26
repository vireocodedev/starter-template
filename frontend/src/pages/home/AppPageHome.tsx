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
    { icon: <Inventory2Outlined />, title: t("cards.entity.title"), body: t("cards.entity.body") },
    {
      icon: <CheckCircleOutlined />,
      title: t("cards.contracts.title"),
      body: t("cards.contracts.body"),
    },
    { icon: <OfflineBoltOutlined />, title: t("cards.pwa.title"), body: t("cards.pwa.body") },
  ];

  return (
    <AppPageLayout header={<AppPageHeader title={t("header.title")} description={t("header.description")} />}>
      <Box
        sx={{
          bgcolor: "surface.base",
          border: 1,
          borderColor: "divider",
          boxShadow: theme =>
            `inset 0 1px 0 color-mix(in srgb, ${theme.palette.common.white} 8%, transparent), 0 18px 50px color-mix(in srgb, ${theme.palette.common.black} 8%, transparent)`,
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
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
          <Chip color="primary" label={t("version")} size="small" variant="outlined" />
          <Chip color="success" label={t("status.api")} size="small" variant="outlined" />
          <Chip label={t("status.pwa")} size="small" variant="outlined" />
          <Chip label={t("status.responsive")} size="small" variant="outlined" />
        </Stack>
        <Typography
          component="h2"
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            fontWeight: 850,
            letterSpacing: "-0.025em",
            lineHeight: { xs: 1.12, sm: 1.08 },
            mt: { xs: 2, sm: 2.5 },
            maxWidth: 760,
          }}
        >
          {t("title")}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.9375rem", sm: "1.125rem" },
            lineHeight: 1.55,
            mt: { xs: 1.5, sm: 2 },
            maxWidth: 720,
            color: "text.secondary",
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
          {cards.map((card, index) => (
            <Card
              key={card.title}
              sx={{
                borderColor: "divider",
                overflow: "hidden",
                position: "relative",
                "&::before": {
                  bgcolor: index === 0 ? "primary.main" : index === 1 ? "success.main" : "secondary.main",
                  bottom: 0,
                  content: '""',
                  insetInlineStart: 0,
                  position: "absolute",
                  top: 0,
                  width: 3,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: "0.6875rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    {t("module", { number: String(index + 1).padStart(2, "0") })}
                  </Typography>
                  <Typography color="success.main" sx={{ fontSize: "0.6875rem", fontWeight: 800 }}>
                    {t("operational")}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ alignItems: "center", mt: 2 }}>
                  <Box
                    sx={{
                      alignItems: "center",
                      bgcolor: "action.selected",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      color: index === 0 ? "primary.main" : index === 1 ? "success.main" : "secondary.main",
                      display: "flex",
                      height: 40,
                      justifyContent: "center",
                      width: 40,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.125rem" }, fontWeight: 800 }}>
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
