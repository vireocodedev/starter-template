import type React from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { VireoLoadingRegion, VireoSkeleton } from "@vireocodedev/starter-ui";
import { useTranslation } from "react-i18next";
import { HOME_TRANSLATION_NAMESPACE } from "@/app/app.localization";
import { AppSkeletonText } from "@/app/shell/components/AppSkeletonText";
import { AppPageHeader } from "@/app/shell/layout/AppPageHeader";
import { AppPageLayout } from "@/app/shell/layout/AppPageLayout";
import { useAppTranslation } from "@/app/ui/localization/use-app-translation";

type AppPageHomeViewProps = {
  icons?: readonly [React.ReactNode, React.ReactNode, React.ReactNode];
  loading?: boolean;
};

function contentLeaf(loading: boolean, loadingVisible: boolean, content: React.ReactNode) {
  return loading ? <AppSkeletonText visible={loadingVisible}>{content}</AppSkeletonText> : content;
}

export function AppPageHomeView({ icons, loading = false }: AppPageHomeViewProps) {
  const { t: tApp } = useAppTranslation();
  const { t } = useTranslation(HOME_TRANSLATION_NAMESPACE);
  const cards = [
    {
      accent: "primary.main",
      body: t("cards.entity.body"),
      icon: icons?.[0],
      id: "entity",
      title: t("cards.entity.title"),
    },
    {
      accent: "success.main",
      body: t("cards.contracts.body"),
      icon: icons?.[1],
      id: "contracts",
      title: t("cards.contracts.title"),
    },
    {
      accent: "secondary.main",
      body: t("cards.pwa.body"),
      icon: icons?.[2],
      id: "pwa",
      title: t("cards.pwa.title"),
    },
  ] as const;
  const statuses = [
    { color: "primary", label: t("version") },
    { color: "success", label: t("status.api") },
    { color: undefined, label: t("status.pwa") },
    { color: undefined, label: t("status.responsive") },
  ] as const;

  return (
    <VireoLoadingRegion
      loading={loading}
      loadingLabel={tApp("loading.page")}
      sx={{ display: "flex", flex: "1 1 auto", height: "100%", minHeight: 0, minWidth: 0 }}
    >
      {({ loadingVisible }) => (
        <AppPageLayout
          header={
            <AppPageHeader
              description={contentLeaf(loading, loadingVisible, t("header.description"))}
              title={contentLeaf(loading, loadingVisible, t("header.title"))}
            />
          }
        >
          <Box
            data-app-overview-state={loading ? "loading" : "loaded"}
            data-app-overview-loading-phase={loading ? (loadingVisible ? "visible" : "pending") : undefined}
            data-app-route-fallback-variant={loading ? "overview" : undefined}
            sx={{ minWidth: 0 }}
          >
            <Box
              data-app-overview-frame
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
                {statuses.map((status, index) => (
                  <Chip
                    color={status.color}
                    key={`${index}-${status.label}`}
                    label={contentLeaf(loading, loadingVisible, status.label)}
                    size="small"
                    variant="outlined"
                  />
                ))}
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
                {contentLeaf(loading, loadingVisible, t("title"))}
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.9375rem", sm: "1.125rem" },
                  lineHeight: 1.55,
                  mt: { xs: 1.5, sm: 2 },
                  maxWidth: 720,
                }}
              >
                {contentLeaf(loading, loadingVisible, t("introduction"))}
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
                    data-app-overview-card={card.id}
                    key={card.id}
                    sx={{
                      borderColor: "divider",
                      overflow: "hidden",
                      position: "relative",
                      "&::before": {
                        bgcolor: card.accent,
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
                          sx={{
                            fontSize: "0.6875rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {contentLeaf(
                            loading,
                            loadingVisible,
                            t("module", { number: String(index + 1).padStart(2, "0") }),
                          )}
                        </Typography>
                        <Typography color="success.main" sx={{ fontSize: "0.6875rem", fontWeight: 800 }}>
                          {contentLeaf(loading, loadingVisible, t("operational"))}
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
                            color: card.accent,
                            display: "flex",
                            height: 40,
                            justifyContent: "center",
                            width: 40,
                          }}
                        >
                          {loading ? (
                            <VireoSkeleton
                              height={24}
                              variant="rounded"
                              width={24}
                              sx={{ visibility: loadingVisible ? "visible" : "hidden" }}
                            />
                          ) : (
                            card.icon
                          )}
                        </Box>
                        <Typography sx={{ fontSize: { xs: "1rem", sm: "1.125rem" }, fontWeight: 800 }}>
                          {contentLeaf(loading, loadingVisible, card.title)}
                        </Typography>
                      </Stack>
                      <Typography color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, mt: 1 }}>
                        {contentLeaf(loading, loadingVisible, card.body)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>
        </AppPageLayout>
      )}
    </VireoLoadingRegion>
  );
}
